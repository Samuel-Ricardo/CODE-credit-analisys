import { describe, it, expect, beforeEach } from 'vitest';
import { RejectCreditUseCase } from '@/application/use-cases/RejectCreditUseCase';
import { CreditRequestNotFoundError } from '@/domain/errors/DomainError';
import {
  InMemoryCreditRequestRepository,
  InMemoryCustomerRepository,
  InMemoryApprovalRepository,
} from '@/__tests__/helpers/in-memory-repos';
import { makeCreditRequest, makeCustomer } from '@/__tests__/helpers/factories';

describe('RejectCreditUseCase', () => {
  let creditRepo: InMemoryCreditRequestRepository;
  let customerRepo: InMemoryCustomerRepository;
  let approvalRepo: InMemoryApprovalRepository;
  let useCase: RejectCreditUseCase;

  beforeEach(() => {
    creditRepo = new InMemoryCreditRequestRepository();
    customerRepo = new InMemoryCustomerRepository();
    approvalRepo = new InMemoryApprovalRepository();
    useCase = new RejectCreditUseCase(creditRepo, customerRepo, approvalRepo);
  });

  // ─── Happy path ───────────────────────────────────────────────────────────
  describe('successful rejection', () => {
    it('sets request status to REJEITADA', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      const result = await useCase.execute({
        creditRequestId: req.id,
        usuarioId: 'user-1',
        usuarioNome: 'Gerente X',
        alcada: 'GERENTE',
        motivoRejeicao: 'Score de crédito abaixo do mínimo exigido pela política.',
      });

      expect(result.status).toBe('REJEITADA');
    });

    it('creates an approval record with acao REJEITADO', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      await useCase.execute({
        creditRequestId: req.id,
        usuarioId: 'user-1',
        usuarioNome: 'Gerente X',
        alcada: 'GERENTE',
        motivoRejeicao: 'Score abaixo do mínimo.',
      });

      expect(approvalRepo.store).toHaveLength(1);
      expect(approvalRepo.store[0].acao).toBe('REJEITADO');
    });

    it('records the motivoRejeicao in the approval observacoes', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      const motivo = 'Renda insuficiente para o valor solicitado.';
      await useCase.execute({
        creditRequestId: req.id,
        usuarioId: 'user-1',
        usuarioNome: 'Gerente X',
        alcada: 'GERENTE',
        motivoRejeicao: motivo,
      });

      expect(approvalRepo.store[0].observacoes).toBe(motivo);
    });

    it('records statusAnterior and statusNovo correctly', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id, status: 'EM_ANALISE' });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      await useCase.execute({
        creditRequestId: req.id,
        usuarioId: 'user-1',
        usuarioNome: 'Gerente X',
        alcada: 'GERENTE',
        motivoRejeicao: 'Documentação incompleta.',
      });

      expect(approvalRepo.store[0].statusAnterior).toBe('EM_ANALISE');
      expect(approvalRepo.store[0].statusNovo).toBe('REJEITADA');
    });

    it('saves motivoRejeicao to the updated request', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      const motivo = 'Alto índice de inadimplência no histórico.';
      await useCase.execute({
        creditRequestId: req.id,
        usuarioId: 'user-1',
        usuarioNome: 'Gerente X',
        alcada: 'GERENTE',
        motivoRejeicao: motivo,
      });

      const updated = creditRepo.store.find((r) => r.id === req.id);
      expect(updated?.motivoRejeicao).toBe(motivo);
      expect(updated?.status).toBe('REJEITADA');
    });

    it('sets dataConclusao on rejection', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      const before = new Date();
      await useCase.execute({
        creditRequestId: req.id,
        usuarioId: 'user-1',
        usuarioNome: 'Gerente X',
        alcada: 'GERENTE',
        motivoRejeicao: 'Histórico negativo.',
      });
      const after = new Date();

      const updated = creditRepo.store.find((r) => r.id === req.id);
      expect(updated?.dataConclusao).toBeDefined();
      expect(updated?.dataConclusao!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(updated?.dataConclusao!.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  // ─── Error cases ──────────────────────────────────────────────────────────
  describe('error handling', () => {
    it('throws CreditRequestNotFoundError when request does not exist', async () => {
      await expect(
        useCase.execute({
          creditRequestId: 'non-existent-id',
          usuarioId: 'user-1',
          usuarioNome: 'Gerente X',
          alcada: 'GERENTE',
          motivoRejeicao: 'Análise negativa.',
        })
      ).rejects.toThrow(CreditRequestNotFoundError);
    });

    it('throws with error code CREDIT_REQUEST_NOT_FOUND', async () => {
      try {
        await useCase.execute({
          creditRequestId: 'ghost-id',
          usuarioId: 'user-1',
          usuarioNome: 'Gerente X',
          alcada: 'GERENTE',
          motivoRejeicao: 'Análise negativa.',
        });
      } catch (e: unknown) {
        expect((e as { code: string }).code).toBe('CREDIT_REQUEST_NOT_FOUND');
      }
    });
  });
});
