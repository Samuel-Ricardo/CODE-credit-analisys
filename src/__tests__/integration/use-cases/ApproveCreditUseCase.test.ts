import { describe, it, expect, beforeEach } from 'vitest';
import { ApproveCreditUseCase } from '@/application/use-cases/ApproveCreditUseCase';
import { CreditRequestNotFoundError, InsufficientApprovalTierError } from '@/domain/errors/DomainError';
import {
  InMemoryCreditRequestRepository,
  InMemoryCustomerRepository,
  InMemoryApprovalRepository,
} from '@/__tests__/helpers/in-memory-repos';
import { makeCreditRequest, makeCustomer } from '@/__tests__/helpers/factories';

describe('ApproveCreditUseCase', () => {
  let creditRepo: InMemoryCreditRequestRepository;
  let customerRepo: InMemoryCustomerRepository;
  let approvalRepo: InMemoryApprovalRepository;
  let useCase: ApproveCreditUseCase;

  beforeEach(() => {
    creditRepo = new InMemoryCreditRequestRepository();
    customerRepo = new InMemoryCustomerRepository();
    approvalRepo = new InMemoryApprovalRepository();
    useCase = new ApproveCreditUseCase(creditRepo, customerRepo, approvalRepo);
  });

  // ─── Happy path ───────────────────────────────────────────────────────────
  describe('successful approval', () => {
    it('sets request status to APROVADA', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id, valorSolicitado: 5000, alcadaRequerida: 'LIDER' });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      const result = await useCase.execute({
        creditRequestId: req.id,
        usuarioId: 'user-1',
        usuarioNome: 'Carlos Gerente',
        alcada: 'GERENTE', // GERENTE can approve LIDER
      });

      expect(result.status).toBe('APROVADA');
    });

    it('sets valorAprovado to the requested amount', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id, valorSolicitado: 8000, alcadaRequerida: 'LIDER' });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      const result = await useCase.execute({
        creditRequestId: req.id,
        usuarioId: 'user-1',
        usuarioNome: 'Gerente X',
        alcada: 'GERENTE',
      });

      expect(result.valorAprovado).toBe(8000);
    });

    it('creates an approval record in the approval repository', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id, alcadaRequerida: 'LIDER' });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      await useCase.execute({
        creditRequestId: req.id,
        usuarioId: 'user-1',
        usuarioNome: 'Gerente X',
        alcada: 'GERENTE',
      });

      expect(approvalRepo.store).toHaveLength(1);
      expect(approvalRepo.store[0].acao).toBe('APROVADO');
      expect(approvalRepo.store[0].statusNovo).toBe('APROVADA');
      expect(approvalRepo.store[0].statusAnterior).toBe('SOLICITADA');
    });

    it('updates the request in the repository', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id, alcadaRequerida: 'LIDER' });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      await useCase.execute({
        creditRequestId: req.id,
        usuarioId: 'user-1',
        usuarioNome: 'Gerente X',
        alcada: 'GERENTE',
      });

      const updated = creditRepo.store.find((r) => r.id === req.id);
      expect(updated?.status).toBe('APROVADA');
    });

    it('includes optional observacoes in the approval record', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id, alcadaRequerida: 'LIDER' });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      await useCase.execute({
        creditRequestId: req.id,
        usuarioId: 'user-1',
        usuarioNome: 'Gerente X',
        alcada: 'GERENTE',
        observacoes: 'Score excelente. Aprovado por análise completa.',
      });

      expect(approvalRepo.store[0].observacoes).toBe('Score excelente. Aprovado por análise completa.');
    });
  });

  // ─── Error cases ──────────────────────────────────────────────────────────
  describe('error handling', () => {
    it('throws CreditRequestNotFoundError when request ID does not exist', async () => {
      await expect(
        useCase.execute({
          creditRequestId: 'nonexistent-id',
          usuarioId: 'user-1',
          usuarioNome: 'Gerente X',
          alcada: 'GERENTE',
        })
      ).rejects.toThrow(CreditRequestNotFoundError);
    });

    it('throws InsufficientApprovalTierError when LIDER tries to approve GERENTE request', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({
        customerId: customer.id,
        valorSolicitado: 100_000, // → GERENTE alcada
        alcadaRequerida: 'GERENTE',
      });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      await expect(
        useCase.execute({
          creditRequestId: req.id,
          usuarioId: 'user-1',
          usuarioNome: 'Líder Y',
          alcada: 'LIDER',
        })
      ).rejects.toThrow(InsufficientApprovalTierError);
    });

    it('throws InsufficientApprovalTierError when COORDENADOR tries to approve GERENTE_GERAL request', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({
        customerId: customer.id,
        valorSolicitado: 500_000,
        alcadaRequerida: 'GERENTE_GERAL',
      });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      await expect(
        useCase.execute({
          creditRequestId: req.id,
          usuarioId: 'user-1',
          usuarioNome: 'Coord Z',
          alcada: 'COORDENADOR',
        })
      ).rejects.toThrow(InsufficientApprovalTierError);
    });

    it('does NOT throw when DIRETORIA approves any request', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({
        customerId: customer.id,
        valorSolicitado: 5_000_000,
        alcadaRequerida: 'DIRETORIA',
      });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      await expect(
        useCase.execute({
          creditRequestId: req.id,
          usuarioId: 'user-1',
          usuarioNome: 'Diretora A',
          alcada: 'DIRETORIA',
        })
      ).resolves.toBeDefined();
    });
  });
});
