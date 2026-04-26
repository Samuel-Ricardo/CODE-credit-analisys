// NOTE: Field names use the actual DashboardStatsDTO interface:
// - solicitacoesPendentes (not solicitacoesAtivas)
// - solicitacoesPorStatus (array, not statusCounts object)
// - distribuicaoScore (array with `range` field)
// - volumePorDia (array with `solicitacoes` field)
import { describe, it, expect, beforeEach } from 'vitest';
import { GetDashboardStatsUseCase } from '@/application/use-cases/GetDashboardStatsUseCase';
import { InMemoryCreditRequestRepository } from '@/__tests__/helpers/in-memory-repos';
import { makeCreditRequest, makeCustomer } from '@/__tests__/helpers/factories';

describe('GetDashboardStatsUseCase', () => {
  let creditRepo: InMemoryCreditRequestRepository;
  let useCase: GetDashboardStatsUseCase;

  beforeEach(() => {
    creditRepo = new InMemoryCreditRequestRepository();
    useCase = new GetDashboardStatsUseCase(creditRepo);
  });

  // ─── Empty state ──────────────────────────────────────────────────────────
  it('returns zeroed stats when there are no requests', async () => {
    const stats = await useCase.execute();
    expect(stats.totalSolicitacoes).toBe(0);
    expect(stats.taxaAprovacao).toBe(0);
    expect(stats.solicitacoesPendentes).toBe(0);
  });

  // ─── Taxa de aprovação ────────────────────────────────────────────────────
  describe('taxaAprovacao calculation', () => {
    it('calculates taxaAprovacao excluding RASCUNHO from denominator', async () => {
      const customer = makeCustomer();

      // 2 approved, 1 rejected, 1 rascunho → taxa = 2 / 3 * 100 ≈ 66.67
      creditRepo.store.push(
        makeCreditRequest({ customerId: customer.id, status: 'APROVADA', id: 'r1' }),
        makeCreditRequest({ customerId: customer.id, status: 'APROVADA', id: 'r2' }),
        makeCreditRequest({ customerId: customer.id, status: 'REJEITADA', id: 'r3' }),
        makeCreditRequest({ customerId: customer.id, status: 'RASCUNHO', id: 'r4' }),
      );

      const stats = await useCase.execute();

      expect(stats.taxaAprovacao).toBeCloseTo(66.67, 1);
    });

    it('returns 100% when all non-draft requests are approved', async () => {
      const customer = makeCustomer();
      creditRepo.store.push(
        makeCreditRequest({ customerId: customer.id, status: 'APROVADA', id: 'r1' }),
        makeCreditRequest({ customerId: customer.id, status: 'APROVADA', id: 'r2' }),
        makeCreditRequest({ customerId: customer.id, status: 'RASCUNHO', id: 'r3' }),
      );

      const stats = await useCase.execute();
      expect(stats.taxaAprovacao).toBe(100);
    });

    it('returns 0% when all non-draft requests are rejected', async () => {
      const customer = makeCustomer();
      creditRepo.store.push(
        makeCreditRequest({ customerId: customer.id, status: 'REJEITADA', id: 'r1' }),
        makeCreditRequest({ customerId: customer.id, status: 'REJEITADA', id: 'r2' }),
      );

      const stats = await useCase.execute();
      expect(stats.taxaAprovacao).toBe(0);
    });

    it('returns 0 or NaN when only RASCUNHO requests exist (division by zero)', async () => {
      const customer = makeCustomer();
      creditRepo.store.push(
        makeCreditRequest({ customerId: customer.id, status: 'RASCUNHO', id: 'r1' }),
      );

      // all.length is 1 (RASCUNHO exists), denominator is 0 → 0/0 = NaN
      const stats = await useCase.execute();
      const taxa = stats.taxaAprovacao;
      expect(taxa === 0 || isNaN(taxa)).toBe(true);
    });
  });

  // ─── totalSolicitacoes ────────────────────────────────────────────────────
  describe('totalSolicitacoes', () => {
    it('counts all requests regardless of status', async () => {
      const customer = makeCustomer();
      creditRepo.store.push(
        makeCreditRequest({ customerId: customer.id, status: 'APROVADA', id: 'r1' }),
        makeCreditRequest({ customerId: customer.id, status: 'SOLICITADA', id: 'r2' }),
        makeCreditRequest({ customerId: customer.id, status: 'RASCUNHO', id: 'r3' }),
      );

      const stats = await useCase.execute();
      expect(stats.totalSolicitacoes).toBe(3);
    });
  });

  // ─── solicitacoesPendentes ─────────────────────────────────────────────────
  describe('solicitacoesPendentes', () => {
    it('counts only SOLICITADA | EM_ANALISE | EM_APROVACAO statuses', async () => {
      const customer = makeCustomer();
      creditRepo.store.push(
        makeCreditRequest({ customerId: customer.id, status: 'SOLICITADA', id: 'r1' }),
        makeCreditRequest({ customerId: customer.id, status: 'EM_ANALISE', id: 'r2' }),
        makeCreditRequest({ customerId: customer.id, status: 'EM_APROVACAO', id: 'r3' }),
        makeCreditRequest({ customerId: customer.id, status: 'APROVADA', id: 'r4' }),
        makeCreditRequest({ customerId: customer.id, status: 'REJEITADA', id: 'r5' }),
        makeCreditRequest({ customerId: customer.id, status: 'CANCELADA', id: 'r6' }),
        makeCreditRequest({ customerId: customer.id, status: 'RASCUNHO', id: 'r7' }),
      );

      const stats = await useCase.execute();
      expect(stats.solicitacoesPendentes).toBe(3);
    });
  });

  // ─── solicitacoesPorStatus ─────────────────────────────────────────────────
  describe('solicitacoesPorStatus', () => {
    it('returns an array covering all status types', async () => {
      const stats = await useCase.execute();
      expect(Array.isArray(stats.solicitacoesPorStatus)).toBe(true);
      expect(stats.solicitacoesPorStatus.length).toBeGreaterThanOrEqual(7);
    });

    it('provides correct count for APROVADA and SOLICITADA', async () => {
      const customer = makeCustomer();
      creditRepo.store.push(
        makeCreditRequest({ customerId: customer.id, status: 'APROVADA', id: 'r1' }),
        makeCreditRequest({ customerId: customer.id, status: 'APROVADA', id: 'r2' }),
        makeCreditRequest({ customerId: customer.id, status: 'SOLICITADA', id: 'r3' }),
      );

      const stats = await useCase.execute();
      const aprovadaEntry = stats.solicitacoesPorStatus.find((s) => s.status === 'APROVADA');
      expect(aprovadaEntry?.count).toBe(2);
      const solicitadaEntry = stats.solicitacoesPorStatus.find((s) => s.status === 'SOLICITADA');
      expect(solicitadaEntry?.count).toBe(1);
    });

    it('includes label and color for each entry', async () => {
      const stats = await useCase.execute();
      stats.solicitacoesPorStatus.forEach((entry) => {
        expect(typeof entry.label).toBe('string');
        expect(typeof entry.color).toBe('string');
      });
    });
  });

  // ─── distribuicaoScore ────────────────────────────────────────────────────
  describe('distribuicaoScore', () => {
    it('returns 5 score range buckets', async () => {
      const stats = await useCase.execute();
      expect(stats.distribuicaoScore).toHaveLength(5);
    });

    it('counts scores in correct range buckets', async () => {
      const customer = makeCustomer();
      creditRepo.store.push(
        makeCreditRequest({ customerId: customer.id, scoreCredito: 800, id: 'r1' }), // 750-850
        makeCreditRequest({ customerId: customer.id, scoreCredito: 700, id: 'r2' }), // 650-749
        makeCreditRequest({ customerId: customer.id, scoreCredito: 600, id: 'r3' }), // 550-649
        makeCreditRequest({ customerId: customer.id, scoreCredito: 500, id: 'r4' }), // 450-549
        makeCreditRequest({ customerId: customer.id, scoreCredito: 350, id: 'r5' }), // 300-449
      );

      const stats = await useCase.execute();
      const highBucket = stats.distribuicaoScore.find((b) => b.range === '750–850');
      expect(highBucket?.count).toBe(1);
      const lowBucket = stats.distribuicaoScore.find((b) => b.range === '300–449');
      expect(lowBucket?.count).toBe(1);
    });
  });

  // ─── volumePorDia ──────────────────────────────────────────────────────────
  describe('volumePorDia', () => {
    it('returns 7 day entries', async () => {
      const stats = await useCase.execute();
      expect(stats.volumePorDia).toHaveLength(7);
    });

    it('each entry has data, solicitacoes, aprovacoes, valor fields', async () => {
      const stats = await useCase.execute();
      stats.volumePorDia.forEach((entry) => {
        expect(typeof entry.data).toBe('string');
        expect(typeof entry.solicitacoes).toBe('number');
        expect(typeof entry.aprovacoes).toBe('number');
        expect(typeof entry.valor).toBe('number');
      });
    });

    it('counts today\'s requests in the last volume entry', async () => {
      const customer = makeCustomer();
      const today = new Date();
      creditRepo.store.push(
        makeCreditRequest({ customerId: customer.id, dataInclusao: today }),
      );

      const stats = await useCase.execute();
      const todayEntry = stats.volumePorDia.at(-1)!;
      expect(todayEntry.solicitacoes).toBeGreaterThanOrEqual(1);
    });
  });
});
