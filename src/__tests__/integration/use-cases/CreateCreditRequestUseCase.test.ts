import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCreditRequestUseCase } from '@/application/use-cases/CreateCreditRequestUseCase';
import { InvalidDocumentError } from '@/domain/errors/DomainError';
import {
  InMemoryCreditRequestRepository,
  InMemoryCustomerRepository,
  StubCreditScoringService,
} from '@/__tests__/helpers/in-memory-repos';
import { makeCustomer, VALID_CPF_RAW, VALID_CNPJ_RAW } from '@/__tests__/helpers/factories';

const VALID_PF_DTO = {
  customerTipo: 'PF' as const,
  customerDocumento: VALID_CPF_RAW,
  customerNome: 'Ana Ferreira',
  customerEmail: 'ana@ferreira.com.br',
  customerTelefone: '(11) 99999-0001',
  customerRenda: 10000,
  valorSolicitado: 5000,
  bandeiraId: 'bandeira-visa',
  modalidade: 'CREDITO_PESSOAL',
  finalidade: 'Compra de equipamentos de informática',
};

describe('CreateCreditRequestUseCase', () => {
  let creditRepo: InMemoryCreditRequestRepository;
  let customerRepo: InMemoryCustomerRepository;
  let scoringService: StubCreditScoringService;
  let useCase: CreateCreditRequestUseCase;

  beforeEach(() => {
    creditRepo = new InMemoryCreditRequestRepository();
    customerRepo = new InMemoryCustomerRepository();
    scoringService = new StubCreditScoringService(720);
    useCase = new CreateCreditRequestUseCase(creditRepo, customerRepo, scoringService);
  });

  // ─── Happy path ───────────────────────────────────────────────────────────
  describe('successful creation', () => {
    it('creates a credit request and returns a summary DTO', async () => {
      const result = await useCase.execute(VALID_PF_DTO);

      expect(result.status).toBe('SOLICITADA');
      expect(result.valorSolicitado).toBe(5000);
      expect(result.customerNome).toBe('Ana Ferreira');
      expect(result.scoreCredito).toBe(720);
      expect(result.id).toBeDefined();
      expect(result.numeroSolicitacao).toMatch(/^SOL-\d{4}-\d{5}$/);
    });

    it('persists the request to the repository', async () => {
      await useCase.execute(VALID_PF_DTO);
      expect(creditRepo.store).toHaveLength(1);
    });

    it('creates a new customer when none exists for the document', async () => {
      expect(customerRepo.store).toHaveLength(0);
      await useCase.execute(VALID_PF_DTO);
      expect(customerRepo.store).toHaveLength(1);
      expect(customerRepo.store[0].documento).toBe(VALID_CPF_RAW);
    });

    it('reuses an existing customer with the same document', async () => {
      const existing = makeCustomer({ documento: VALID_CPF_RAW, nomeRazaoSocial: 'Ana Original' });
      customerRepo.store.push(existing);

      await useCase.execute(VALID_PF_DTO);

      // Should not create a second customer
      expect(customerRepo.store).toHaveLength(1);
    });

    it('links the created request to the correct customer ID', async () => {
      await useCase.execute(VALID_PF_DTO);
      const customerId = customerRepo.store[0].id;
      expect(creditRepo.store[0].customerId).toBe(customerId);
    });
  });

  // ─── Approval tier assignment (business rules) ────────────────────────────
  describe('approval tier assignment', () => {
    it('assigns LIDER tier for R$5.000 (≤ R$10.000)', async () => {
      const r = await useCase.execute({ ...VALID_PF_DTO, valorSolicitado: 5_000 });
      expect(r.alcadaRequerida).toBe('LIDER');
    });

    it('assigns COORDENADOR tier for R$25.000', async () => {
      const r = await useCase.execute({ ...VALID_PF_DTO, valorSolicitado: 25_000 });
      expect(r.alcadaRequerida).toBe('COORDENADOR');
    });

    it('assigns GERENTE tier for R$100.000', async () => {
      const r = await useCase.execute({ ...VALID_PF_DTO, valorSolicitado: 100_000 });
      expect(r.alcadaRequerida).toBe('GERENTE');
    });

    it('assigns GERENTE_GERAL tier for R$500.000', async () => {
      const r = await useCase.execute({ ...VALID_PF_DTO, valorSolicitado: 500_000 });
      expect(r.alcadaRequerida).toBe('GERENTE_GERAL');
    });

    it('assigns DIRETORIA tier for R$2.000.000', async () => {
      const r = await useCase.execute({ ...VALID_PF_DTO, valorSolicitado: 2_000_000 });
      expect(r.alcadaRequerida).toBe('DIRETORIA');
    });
  });

  // ─── Document validation ──────────────────────────────────────────────────
  describe('document validation', () => {
    it('throws InvalidDocumentError for an invalid CPF', async () => {
      await expect(
        useCase.execute({ ...VALID_PF_DTO, customerDocumento: '52998224726' }) // wrong digit
      ).rejects.toThrow(InvalidDocumentError);
    });

    it('throws InvalidDocumentError for an all-same-digit CPF', async () => {
      await expect(
        useCase.execute({ ...VALID_PF_DTO, customerDocumento: '11111111111' })
      ).rejects.toThrow(InvalidDocumentError);
    });

    it('throws InvalidDocumentError for an invalid CNPJ', async () => {
      await expect(
        useCase.execute({
          ...VALID_PF_DTO,
          customerTipo: 'PJ',
          customerDocumento: '11222333000182', // wrong last digit
        })
      ).rejects.toThrow(InvalidDocumentError);
    });

    it('does NOT throw for a valid CNPJ PJ request', async () => {
      await expect(
        useCase.execute({
          ...VALID_PF_DTO,
          customerTipo: 'PJ',
          customerDocumento: VALID_CNPJ_RAW,
        })
      ).resolves.toBeDefined();
    });

    it('cleans formatting before validating document', async () => {
      await expect(
        useCase.execute({ ...VALID_PF_DTO, customerDocumento: '529.982.247-25' })
      ).resolves.toBeDefined();
    });
  });

  // ─── Sequential numbering ─────────────────────────────────────────────────
  describe('sequential numbering', () => {
    it('generates SOL-YYYY-00001 for the first request', async () => {
      const r = await useCase.execute(VALID_PF_DTO);
      expect(r.numeroSolicitacao).toMatch(/SOL-\d{4}-00001/);
    });

    it('increments number for each new request', async () => {
      const r1 = await useCase.execute(VALID_PF_DTO);
      const r2 = await useCase.execute({
        ...VALID_PF_DTO,
        customerDocumento: VALID_CNPJ_RAW,
        customerTipo: 'PJ',
      });

      const num1 = parseInt(r1.numeroSolicitacao.split('-')[2]);
      const num2 = parseInt(r2.numeroSolicitacao.split('-')[2]);
      expect(num2).toBe(num1 + 1);
    });
  });
});
