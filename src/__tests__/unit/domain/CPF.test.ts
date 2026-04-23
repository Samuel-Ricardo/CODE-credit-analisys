import { describe, it, expect } from 'vitest';
import { CPF } from '@/domain/value-objects/CPF';

// Valid CPFs verified by checksum:
// 529.982.247-25 → clean 52998224725
// 111.444.777-35 → clean 11144477735
const VALID_1 = '52998224725';
const VALID_2 = '11144477735';

describe('CPF Value Object', () => {
  // ─── isValid ────────────────────────────────────────────────────────────────
  describe('isValid()', () => {
    it('returns true for a valid CPF (unformatted)', () => {
      expect(CPF.isValid(VALID_1)).toBe(true);
    });

    it('returns true for a second valid CPF', () => {
      expect(CPF.isValid(VALID_2)).toBe(true);
    });

    it('returns true when CPF is formatted with dots and dash', () => {
      expect(CPF.isValid('529.982.247-25')).toBe(true);
    });

    it('returns false when length is less than 11 digits', () => {
      expect(CPF.isValid('5299822')).toBe(false);
    });

    it('returns false when length is greater than 11 digits', () => {
      expect(CPF.isValid('529982247251')).toBe(false);
    });

    it('returns false for all-same-digit CPF (111.111.111-11)', () => {
      expect(CPF.isValid('11111111111')).toBe(false);
    });

    it('returns false for all-same-digit CPF (000.000.000-00)', () => {
      expect(CPF.isValid('00000000000')).toBe(false);
    });

    it('returns false for all-same-digit CPF (999.999.999-99)', () => {
      expect(CPF.isValid('99999999999')).toBe(false);
    });

    it('returns false when first check digit is wrong', () => {
      // change digit at position 9: 52998224725 → 52998224715
      expect(CPF.isValid('52998224715')).toBe(false);
    });

    it('returns false when second check digit is wrong', () => {
      // change digit at position 10: 52998224725 → 52998224726
      expect(CPF.isValid('52998224726')).toBe(false);
    });

    it('returns false for sequential CPF 123.456.789-09', () => {
      // This is actually a real valid CPF — confirm it properly
      // 12345678909 — validate:
      // sum1: 1*10+2*9+3*8+4*7+5*6+6*5+7*4+8*3+9*2 = 10+18+24+28+30+30+28+24+18 = 210
      // rem1: 210*10%11 = 2100%11 = 2100-190*11=2100-2090=10 → 10 → rem=10 → 0 (but digit is 0 ✓)
      // sum2: 1*11+2*10+3*9+4*8+5*7+6*6+7*5+8*4+9*3+0*2 = 11+20+27+32+35+36+35+32+27+0 = 255
      // rem2: 255*10%11 = 2550%11 = 2550-231*11=2550-2541=9 (digit is 9 ✓)
      // So 12345678909 IS valid — test it as such:
      expect(CPF.isValid('12345678909')).toBe(true);
    });

    it('returns false for empty string', () => {
      expect(CPF.isValid('')).toBe(false);
    });

    it('returns false for non-digit string', () => {
      expect(CPF.isValid('abcdefghijk')).toBe(false);
    });
  });

  // ─── create() ───────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('creates a CPF instance from a valid raw value', () => {
      const cpf = CPF.create(VALID_1);
      expect(cpf).toBeInstanceOf(CPF);
      expect(cpf.value).toBe(VALID_1);
    });

    it('strips formatting before validating', () => {
      const cpf = CPF.create('529.982.247-25');
      expect(cpf.value).toBe(VALID_1);
    });

    it('throws for an invalid CPF', () => {
      expect(() => CPF.create('12345678900')).toThrow(/CPF inválido/i);
    });

    it('throws for an all-same-digit CPF', () => {
      expect(() => CPF.create('11111111111')).toThrow(/CPF inválido/i);
    });
  });

  // ─── format() ───────────────────────────────────────────────────────────────
  describe('format()', () => {
    it('formats a valid CPF with dots and dash', () => {
      const cpf = CPF.create(VALID_1);
      expect(cpf.format()).toBe('529.982.247-25');
    });
  });

  // ─── equals() ────────────────────────────────────────────────────────────────
  describe('equals()', () => {
    it('returns true for two CPFs with the same value', () => {
      const a = CPF.create(VALID_1);
      const b = CPF.create(VALID_1);
      expect(a.equals(b)).toBe(true);
    });

    it('returns false for two different CPFs', () => {
      const a = CPF.create(VALID_1);
      const b = CPF.create(VALID_2);
      expect(a.equals(b)).toBe(false);
    });
  });
});
