import { describe, it, expect, beforeEach } from 'vitest';
import { ListCreditRequestsUseCase } from '@/application/use-cases/ListCreditRequestsUseCase';
import {
  InMemoryCreditRequestRepository,
  InMemoryCustomerRepository,
} from '@/__tests__/helpers/in-memory-repos';
import { makeCreditRequest, makeCustomer } from '@/__tests__/helpers/factories';

describe('ListCreditRequestsUseCase', () => {
  let creditRepo: InMemoryCreditRequestRepository;
  let customerRepo: InMemoryCustomerRepository;
  let useCase: ListCreditRequestsUseCase;

  beforeEach(() => {
    creditRepo = new InMemoryCreditRequestRepository();
    customerRepo = new InMemoryCustomerRepository();
    useCase = new ListCreditRequestsUseCase(creditRepo, customerRepo);
  });

  // ─── Basic listing ────────────────────────────────────────────────────────
  describe('basic listing', () => {
    it('returns empty items when no requests exist', async () => {
      const result = await useCase.execute();
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('returns all requests with customer info hydrated', async () => {
      const customer = makeCustomer({ nomeRazaoSocial: 'João Teste' });
      const req = makeCreditRequest({ customerId: customer.id });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      const result = await useCase.execute();

      expect(result.items).toHaveLength(1);
      expect(result.items[0].customerNome).toBe('João Teste');
      expect(result.items[0].id).toBe(req.id);
    });

    it('falls back to "—" when customer is not found', async () => {
      const req = makeCreditRequest({ customerId: 'unknown-customer' });
      creditRepo.store.push(req);

      const result = await useCase.execute();

      expect(result.items[0].customerNome).toBe('—');
      expect(result.items[0].customerDocumento).toBe('—');
    });

    it('caches customer lookups for multiple requests from same customer', async () => {
      const customer = makeCustomer();
      const req1 = makeCreditRequest({ customerId: customer.id, id: 'r1' });
      const req2 = makeCreditRequest({ customerId: customer.id, id: 'r2' });
      customerRepo.store.push(customer);
      creditRepo.store.push(req1, req2);

      const result = await useCase.execute();

      expect(result.items).toHaveLength(2);
      expect(result.items[0].customerNome).toBe(result.items[1].customerNome);
    });
  });

  // ─── Filtering ────────────────────────────────────────────────────────────
  describe('status filtering', () => {
    it('filters by a single status', async () => {
      const customer = makeCustomer();
      const approved = makeCreditRequest({ customerId: customer.id, status: 'APROVADA', id: 'r1' });
      const pending = makeCreditRequest({ customerId: customer.id, status: 'SOLICITADA', id: 'r2' });
      customerRepo.store.push(customer);
      creditRepo.store.push(approved, pending);

      const result = await useCase.execute({ filters: { status: ['APROVADA'] } });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('APROVADA');
    });

    it('filters by multiple statuses', async () => {
      const customer = makeCustomer();
      creditRepo.store.push(
        makeCreditRequest({ customerId: customer.id, status: 'SOLICITADA', id: 'r1' }),
        makeCreditRequest({ customerId: customer.id, status: 'EM_ANALISE', id: 'r2' }),
        makeCreditRequest({ customerId: customer.id, status: 'APROVADA', id: 'r3' }),
      );
      customerRepo.store.push(customer);

      const result = await useCase.execute({
        filters: { status: ['SOLICITADA', 'EM_ANALISE'] },
      });

      expect(result.items).toHaveLength(2);
      expect(result.items.every((r) => ['SOLICITADA', 'EM_ANALISE'].includes(r.status))).toBe(true);
    });

    it('returns empty when no requests match the status filter', async () => {
      const customer = makeCustomer();
      creditRepo.store.push(makeCreditRequest({ customerId: customer.id, status: 'APROVADA' }));
      customerRepo.store.push(customer);

      const result = await useCase.execute({ filters: { status: ['REJEITADA'] } });
      expect(result.items).toHaveLength(0);
    });
  });

  // ─── Pagination ───────────────────────────────────────────────────────────
  describe('pagination', () => {
    beforeEach(() => {
      const customer = makeCustomer();
      customerRepo.store.push(customer);
      for (let i = 0; i < 25; i++) {
        creditRepo.store.push(makeCreditRequest({ customerId: customer.id, id: `r${i}` }));
      }
    });

    it('returns default page size of 20', async () => {
      const result = await useCase.execute();
      expect(result.items).toHaveLength(20);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('returns correct items for page 2', async () => {
      const result = await useCase.execute({ filters: { page: 2, limit: 20 } });
      expect(result.items).toHaveLength(5);
      expect(result.page).toBe(2);
    });

    it('respects custom limit', async () => {
      const result = await useCase.execute({ filters: { limit: 5 } });
      expect(result.items).toHaveLength(5);
      expect(result.limit).toBe(5);
    });
  });

  // ─── Risk computation ─────────────────────────────────────────────────────
  describe('risk level computation', () => {
    it('computes risco from scoreCredito when present', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id, scoreCredito: 750 });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      const result = await useCase.execute();
      expect(result.items[0].risco).toBe('MUITO_BAIXO');
    });

    it('leaves risco undefined when no score exists', async () => {
      const customer = makeCustomer();
      const req = makeCreditRequest({ customerId: customer.id, scoreCredito: null });
      customerRepo.store.push(customer);
      creditRepo.store.push(req);

      const result = await useCase.execute();
      expect(result.items[0].risco).toBeUndefined();
    });
  });
});
