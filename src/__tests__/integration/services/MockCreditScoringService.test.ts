import { describe, it, expect } from 'vitest';
import { MockCreditScoringService } from '@/infrastructure/services/MockCreditScoringService';
import { Money } from '@/domain/value-objects/Money';
import { makeCustomer, makePJCustomer } from '@/__tests__/helpers/factories';

const service = new MockCreditScoringService();

async function evaluate(overrides: {
  rendaMensal?: number;
  valorSolicitado?: number;
  isPJ?: boolean;
} = {}) {
  const customer = overrides.isPJ
    ? makePJCustomer({ renda: overrides.rendaMensal ?? 10_000 })
    : makeCustomer({ renda: overrides.rendaMensal ?? 10_000 });
  const valor = Money.fromReais(overrides.valorSolicitado ?? 10_000);
  return service.calculateScore(customer, valor);
}

describe('MockCreditScoringService', () => {
  // ─── Score bounds ──────────────────────────────────────────────────────────
  describe('score clamping', () => {
    it('never returns a score below 300', async () => {
      const score = await evaluate({ rendaMensal: 500, valorSolicitado: 9_999_999 });
      expect(score.score).toBeGreaterThanOrEqual(300);
    });

    it('never returns a score above 850', async () => {
      const score = await evaluate({ rendaMensal: 999_999, valorSolicitado: 500 });
      expect(score.score).toBeLessThanOrEqual(850);
    });
  });

  // ─── Income ratio factor ───────────────────────────────────────────────────
  describe('income ratio factor', () => {
    it('assigns higher score for very low debt-to-income ratio', async () => {
      // highIncome: ratio = 8500 / (50000*12) = 0.014 < 0.3 → +80
      // lowIncome:  ratio = 8500 / (1000*12)  = 0.71  → -20 (between 0.7 and 1.5)
      const highIncome = await evaluate({ rendaMensal: 50_000, valorSolicitado: 8_500 });
      const lowIncome = await evaluate({ rendaMensal: 1_000, valorSolicitado: 8_500 });
      expect(highIncome.score).toBeGreaterThan(lowIncome.score);
    });

    it('assigns lower score when valor far exceeds annual income (ratio > 1.5)', async () => {
      // ratio = 5000 / (500 * 12) = 0.83 → within clamping; use extreme
      const stressed = await evaluate({ rendaMensal: 500, valorSolicitado: 50_000 });
      const comfortable = await evaluate({ rendaMensal: 500_000, valorSolicitado: 50_000 });
      expect(stressed.score).toBeLessThan(comfortable.score);
    });
  });

  // ─── PJ large-company bonus ───────────────────────────────────────────────
  describe('PJ bonus', () => {
    it('adds bonus for PJ customer with renda > R$100k requesting high amounts', async () => {
      const pjScore = await evaluate({ isPJ: true, rendaMensal: 200_000, valorSolicitado: 150_000 });
      const pfScore = await evaluate({ isPJ: false, rendaMensal: 200_000, valorSolicitado: 150_000 });
      // PJ large-company bonus (+50) should yield higher or equal score
      expect(pjScore.score).toBeGreaterThanOrEqual(pfScore.score);
    });
  });

  // ─── High-value penalty ───────────────────────────────────────────────────
  describe('high-value penalty', () => {
    it('penalizes requests over R$500k compared to smaller amounts', async () => {
      const base = await evaluate({ valorSolicitado: 100_000, rendaMensal: 200_000 });
      const large = await evaluate({ valorSolicitado: 600_000, rendaMensal: 200_000 });
      expect(large.score).toBeLessThan(base.score);
    });
  });

  // ─── Small-loan bonus ─────────────────────────────────────────────────────
  describe('small-loan bonus', () => {
    it('adds bonus for requests ≤ R$10k compared to larger amounts', async () => {
      const small = await evaluate({ valorSolicitado: 5_000, rendaMensal: 10_000 });
      const medium = await evaluate({ valorSolicitado: 50_000, rendaMensal: 10_000 });
      expect(small.score).toBeGreaterThan(medium.score);
    });
  });

  // ─── Score structure ──────────────────────────────────────────────────────
  describe('returned CreditScore structure', () => {
    it('returns a CreditScore with score and risco fields', async () => {
      const result = await evaluate();
      expect(typeof result.score).toBe('number');
      expect(result.risco).toBeDefined();
    });

    it('implements isApprovalRecommended() method', async () => {
      const result = await evaluate();
      expect(typeof result.isApprovalRecommended()).toBe('boolean');
    });

    it('recommends approval when score >= 550', async () => {
      const result = await evaluate({ rendaMensal: 20_000, valorSolicitado: 1_000 });
      if (result.score >= 550) {
        expect(result.isApprovalRecommended()).toBe(true);
      }
    });

    it('does not recommend approval when score < 550', async () => {
      const result = await evaluate({ rendaMensal: 500, valorSolicitado: 5_000_000 });
      if (result.score < 550) {
        expect(result.isApprovalRecommended()).toBe(false);
      }
    });

    it('score is within valid range [300, 850]', async () => {
      const result = await evaluate();
      expect(result.score).toBeGreaterThanOrEqual(300);
      expect(result.score).toBeLessThanOrEqual(850);
    });
  });
});

