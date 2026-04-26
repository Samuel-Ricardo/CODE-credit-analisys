import { describe, it, expect } from 'vitest';
import { Money } from '@/domain/value-objects/Money';

describe('Money Value Object', () => {
  // ─── Construction ────────────────────────────────────────────────────────────
  describe('fromReais()', () => {
    it('stores value in centavos internally', () => {
      const m = Money.fromReais(100);
      expect(m.centavos).toBe(10000);
    });

    it('correctly handles fractional reais', () => {
      const m = Money.fromReais(1.99);
      expect(m.centavos).toBe(199);
    });

    it('rounds half-centavos', () => {
      // 1.995 reais = 199.5 centavos → rounds to 200
      const m = Money.fromReais(1.995);
      expect(m.centavos).toBe(200);
    });

    it('returns value as reais', () => {
      const m = Money.fromReais(250.5);
      expect(m.value).toBe(250.5);
    });
  });

  describe('fromCentavos()', () => {
    it('stores exact centavos', () => {
      const m = Money.fromCentavos(4999);
      expect(m.centavos).toBe(4999);
      expect(m.value).toBeCloseTo(49.99);
    });
  });

  describe('zero()', () => {
    it('creates a zero Money instance', () => {
      const m = Money.zero();
      expect(m.centavos).toBe(0);
      expect(m.value).toBe(0);
    });
  });

  describe('negative value', () => {
    it('throws when centavos is negative', () => {
      expect(() => Money.fromCentavos(-1)).toThrow(/inválido/i);
    });

    it('throws when reais value results in negative centavos', () => {
      expect(() => Money.fromReais(-0.01)).toThrow(/inválido/i);
    });
  });

  // ─── Arithmetic ───────────────────────────────────────────────────────────
  describe('add()', () => {
    it('adds two Money values correctly', () => {
      const a = Money.fromReais(100);
      const b = Money.fromReais(50);
      expect(a.add(b).value).toBe(150);
    });

    it('adding zero returns same amount', () => {
      const a = Money.fromReais(999);
      expect(a.add(Money.zero()).value).toBe(999);
    });
  });

  describe('subtract()', () => {
    it('subtracts two Money values correctly', () => {
      const a = Money.fromReais(200);
      const b = Money.fromReais(75.5);
      expect(a.subtract(b).value).toBeCloseTo(124.5);
    });
  });

  describe('multiply()', () => {
    it('multiplies by a positive factor', () => {
      const m = Money.fromReais(100);
      expect(m.multiply(3).value).toBe(300);
    });

    it('multiplies by a fractional factor', () => {
      const m = Money.fromReais(100);
      expect(m.multiply(0.5).value).toBe(50);
    });

    it('multiplies by zero gives zero', () => {
      const m = Money.fromReais(500);
      expect(m.multiply(0).value).toBe(0);
    });
  });

  // ─── Comparisons ─────────────────────────────────────────────────────────────
  describe('isGreaterThan()', () => {
    it('returns true when this > other', () => {
      expect(Money.fromReais(200).isGreaterThan(Money.fromReais(100))).toBe(true);
    });

    it('returns false when this < other', () => {
      expect(Money.fromReais(50).isGreaterThan(Money.fromReais(100))).toBe(false);
    });

    it('returns false when equal', () => {
      expect(Money.fromReais(100).isGreaterThan(Money.fromReais(100))).toBe(false);
    });
  });

  describe('isLessThan()', () => {
    it('returns true when this < other', () => {
      expect(Money.fromReais(10).isLessThan(Money.fromReais(50))).toBe(true);
    });

    it('returns false when this > other', () => {
      expect(Money.fromReais(100).isLessThan(Money.fromReais(50))).toBe(false);
    });

    it('returns false when equal', () => {
      expect(Money.fromReais(100).isLessThan(Money.fromReais(100))).toBe(false);
    });
  });

  describe('equals()', () => {
    it('returns true for same centavos value', () => {
      expect(Money.fromReais(100).equals(Money.fromReais(100))).toBe(true);
    });

    it('returns false for different values', () => {
      expect(Money.fromReais(100).equals(Money.fromReais(100.01))).toBe(false);
    });
  });

  // ─── Format ───────────────────────────────────────────────────────────────
  describe('format()', () => {
    it('formats as Brazilian currency', () => {
      const formatted = Money.fromReais(1234.56).format();
      expect(formatted).toContain('1.234,56');
      expect(formatted).toContain('R$');
    });

    it('formats zero correctly', () => {
      const formatted = Money.zero().format();
      expect(formatted).toContain('0,00');
    });
  });
});
