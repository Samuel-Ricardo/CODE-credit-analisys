import { describe, it, expect } from 'vitest';
import { maskCPF, maskCNPJ, maskPhone, maskCEP, maskMoney } from '@/lib/masks';

describe('Input Masks', () => {
  // ─── maskCPF ─────────────────────────────────────────────────────────────
  describe('maskCPF()', () => {
    it('formats a complete 11-digit CPF', () => {
      expect(maskCPF('52998224725')).toBe('529.982.247-25');
    });

    it('handles partial input (3 digits)', () => {
      expect(maskCPF('529')).toBe('529');
    });

    it('handles partial input (4 digits — first dot)', () => {
      expect(maskCPF('5299')).toBe('529.9');
    });

    it('handles partial input (7 digits)', () => {
      expect(maskCPF('5299822')).toBe('529.982.2');
    });

    it('handles partial input (9 digits)', () => {
      expect(maskCPF('529982247')).toBe('529.982.247');
    });

    it('formats 10 digits (dash shows)', () => {
      expect(maskCPF('5299822472')).toBe('529.982.247-2');
    });

    it('strips non-digit characters first', () => {
      expect(maskCPF('529.982.247-25')).toBe('529.982.247-25');
    });

    it('truncates to 11 digits max', () => {
      expect(maskCPF('529982247251234')).toBe('529.982.247-25');
    });

    it('returns empty for empty string', () => {
      expect(maskCPF('')).toBe('');
    });
  });

  // ─── maskCNPJ ────────────────────────────────────────────────────────────
  describe('maskCNPJ()', () => {
    it('formats a complete 14-digit CNPJ', () => {
      expect(maskCNPJ('11222333000181')).toBe('11.222.333/0001-81');
    });

    it('handles partial input (2 digits)', () => {
      expect(maskCNPJ('11')).toBe('11');
    });

    it('handles partial input (5 digits — first dot visible)', () => {
      expect(maskCNPJ('11222')).toBe('11.222');
    });

    it('strips existing formatting', () => {
      expect(maskCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81');
    });

    it('truncates to 14 digits max', () => {
      expect(maskCNPJ('112223330001819999')).toBe('11.222.333/0001-81');
    });

    it('returns empty for empty string', () => {
      expect(maskCNPJ('')).toBe('');
    });
  });

  // ─── maskPhone ───────────────────────────────────────────────────────────
  describe('maskPhone()', () => {
    it('formats a 10-digit phone (fixed)', () => {
      expect(maskPhone('1133334444')).toBe('(11) 3333-4444');
    });

    it('formats an 11-digit mobile phone', () => {
      expect(maskPhone('11999994444')).toBe('(11) 99999-4444');
    });

    it('returns digits unchanged for 2-digit partial input (mask requires 3+ digits)', () => {
      expect(maskPhone('11')).toBe('11');
    });

    it('strips existing formatting', () => {
      expect(maskPhone('(11) 99999-4444')).toBe('(11) 99999-4444');
    });

    it('truncates to 11 digits max', () => {
      expect(maskPhone('119999944441234')).toBe('(11) 99999-4444');
    });

    it('returns empty for empty string', () => {
      expect(maskPhone('')).toBe('');
    });
  });

  // ─── maskCEP ─────────────────────────────────────────────────────────────
  describe('maskCEP()', () => {
    it('formats a complete 8-digit CEP', () => {
      expect(maskCEP('01310100')).toBe('01310-100');
    });

    it('handles partial input (4 digits)', () => {
      expect(maskCEP('0131')).toBe('0131');
    });

    it('handles partial input (5 digits — dash shows)', () => {
      expect(maskCEP('01310')).toBe('01310');
    });

    it('formats 6+ digits with dash', () => {
      expect(maskCEP('013101')).toBe('01310-1');
    });

    it('strips existing formatting', () => {
      expect(maskCEP('01310-100')).toBe('01310-100');
    });

    it('truncates to 8 digits max', () => {
      expect(maskCEP('013101001234')).toBe('01310-100');
    });

    it('returns empty for empty string', () => {
      expect(maskCEP('')).toBe('');
    });
  });

  // ─── maskMoney ───────────────────────────────────────────────────────────
  describe('maskMoney()', () => {
    it('formats 100 as 1,00', () => {
      expect(maskMoney('100')).toBe('1,00');
    });

    it('formats 100000 as 1.000,00', () => {
      expect(maskMoney('100000')).toBe('1.000,00');
    });

    it('formats 50000 as 500,00', () => {
      expect(maskMoney('50000')).toBe('500,00');
    });

    it('returns empty for empty string', () => {
      expect(maskMoney('')).toBe('');
    });

    it('handles string with only non-digits', () => {
      expect(maskMoney('abc')).toBe('');
    });
  });
});
