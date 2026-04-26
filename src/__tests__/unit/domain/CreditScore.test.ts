import { describe, it, expect } from 'vitest';
import { CreditScore } from '@/domain/entities/CreditScore';

describe('CreditScore Entity', () => {
  // ─── Bounds validation ────────────────────────────────────────────────────
  describe('constructor validation', () => {
    it('creates a CreditScore within valid range 300–850', () => {
      const score = CreditScore.create({
        id: 'sc1', customerId: 'c1', score: 700,
        risco: 'BAIXO', fatores: [], calculadoEm: new Date(),
      });
      expect(score.score).toBe(700);
    });

    it('accepts minimum valid score 300', () => {
      expect(() =>
        CreditScore.create({ id: 'sc1', customerId: 'c1', score: 300, risco: 'MUITO_ALTO', fatores: [], calculadoEm: new Date() })
      ).not.toThrow();
    });

    it('accepts maximum valid score 850', () => {
      expect(() =>
        CreditScore.create({ id: 'sc1', customerId: 'c1', score: 850, risco: 'MUITO_BAIXO', fatores: [], calculadoEm: new Date() })
      ).not.toThrow();
    });

    it('throws for score below 300', () => {
      expect(() =>
        CreditScore.create({ id: 'sc1', customerId: 'c1', score: 299, risco: 'MUITO_ALTO', fatores: [], calculadoEm: new Date() })
      ).toThrow(/Score inválido/i);
    });

    it('throws for score above 850', () => {
      expect(() =>
        CreditScore.create({ id: 'sc1', customerId: 'c1', score: 851, risco: 'MUITO_BAIXO', fatores: [], calculadoEm: new Date() })
      ).toThrow(/Score inválido/i);
    });
  });

  // ─── riskFromScore() — risk banding ──────────────────────────────────────
  describe('riskFromScore()', () => {
    it('maps score 750–850 to MUITO_BAIXO', () => {
      expect(CreditScore.riskFromScore(750)).toBe('MUITO_BAIXO');
      expect(CreditScore.riskFromScore(800)).toBe('MUITO_BAIXO');
      expect(CreditScore.riskFromScore(850)).toBe('MUITO_BAIXO');
    });

    it('maps score 650–749 to BAIXO', () => {
      expect(CreditScore.riskFromScore(650)).toBe('BAIXO');
      expect(CreditScore.riskFromScore(700)).toBe('BAIXO');
      expect(CreditScore.riskFromScore(749)).toBe('BAIXO');
    });

    it('maps score 550–649 to MEDIO', () => {
      expect(CreditScore.riskFromScore(550)).toBe('MEDIO');
      expect(CreditScore.riskFromScore(600)).toBe('MEDIO');
      expect(CreditScore.riskFromScore(649)).toBe('MEDIO');
    });

    it('maps score 450–549 to ALTO', () => {
      expect(CreditScore.riskFromScore(450)).toBe('ALTO');
      expect(CreditScore.riskFromScore(500)).toBe('ALTO');
      expect(CreditScore.riskFromScore(549)).toBe('ALTO');
    });

    it('maps score 300–449 to MUITO_ALTO', () => {
      expect(CreditScore.riskFromScore(300)).toBe('MUITO_ALTO');
      expect(CreditScore.riskFromScore(400)).toBe('MUITO_ALTO');
      expect(CreditScore.riskFromScore(449)).toBe('MUITO_ALTO');
    });

    it('boundary: 749 is BAIXO, 750 is MUITO_BAIXO', () => {
      expect(CreditScore.riskFromScore(749)).toBe('BAIXO');
      expect(CreditScore.riskFromScore(750)).toBe('MUITO_BAIXO');
    });

    it('boundary: 549 is ALTO, 550 is MEDIO', () => {
      expect(CreditScore.riskFromScore(549)).toBe('ALTO');
      expect(CreditScore.riskFromScore(550)).toBe('MEDIO');
    });
  });

  // ─── isApprovalRecommended() ──────────────────────────────────────────────
  describe('isApprovalRecommended()', () => {
    it('returns true for score >= 550', () => {
      const make = (score: number) =>
        CreditScore.create({ id: 'sc', customerId: 'c', score, risco: CreditScore.riskFromScore(score), fatores: [], calculadoEm: new Date() });

      expect(make(550).isApprovalRecommended()).toBe(true);
      expect(make(700).isApprovalRecommended()).toBe(true);
      expect(make(850).isApprovalRecommended()).toBe(true);
    });

    it('returns false for score < 550', () => {
      const make = (score: number) =>
        CreditScore.create({ id: 'sc', customerId: 'c', score, risco: CreditScore.riskFromScore(score), fatores: [], calculadoEm: new Date() });

      expect(make(549).isApprovalRecommended()).toBe(false);
      expect(make(450).isApprovalRecommended()).toBe(false);
      expect(make(300).isApprovalRecommended()).toBe(false);
    });
  });

  // ─── getPercentual() ──────────────────────────────────────────────────────
  describe('getPercentual()', () => {
    it('returns 0% for score 300', () => {
      const sc = CreditScore.create({ id: 'sc', customerId: 'c', score: 300, risco: 'MUITO_ALTO', fatores: [], calculadoEm: new Date() });
      expect(sc.getPercentual()).toBe(0);
    });

    it('returns 100% for score 850', () => {
      const sc = CreditScore.create({ id: 'sc', customerId: 'c', score: 850, risco: 'MUITO_BAIXO', fatores: [], calculadoEm: new Date() });
      expect(sc.getPercentual()).toBe(100);
    });

    it('returns ~50% for score 575', () => {
      const sc = CreditScore.create({ id: 'sc', customerId: 'c', score: 575, risco: 'MEDIO', fatores: [], calculadoEm: new Date() });
      expect(sc.getPercentual()).toBeCloseTo(50, 0);
    });
  });
});
