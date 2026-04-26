import { describe, it, expect } from 'vitest';
import {
  createCreditRequestSchema,
  approveSchema,
  rejectSchema,
} from '@/application/validation/schemas';

// Shared valid base object
const VALID_DATA = {
  customerTipo: 'PF' as const,
  customerDocumento: '529.982.247-25', // valid CPF
  customerNome: 'Ana Ferreira',
  customerEmail: 'ana@ferreira.com.br',
  customerTelefone: '(11) 99999-0001',
  customerRenda: 8000,
  valorSolicitado: 5000,
  bandeiraId: 'bandeira-visa',
  modalidade: 'CREDITO_PESSOAL',
  finalidade: 'Compra de equipamentos para home office',
};

describe('createCreditRequestSchema', () => {
  // ─── Passing case ─────────────────────────────────────────────────────────
  describe('valid data', () => {
    it('accepts a fully valid PF request', () => {
      const result = createCreditRequestSchema.safeParse(VALID_DATA);
      expect(result.success).toBe(true);
    });

    it('accepts a fully valid PJ request', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerTipo: 'PJ',
        customerDocumento: '11.222.333/0001-81', // valid CNPJ
      });
      expect(result.success).toBe(true);
    });

    it('accepts an optional CEP in the correct format', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerCep: '01310-100',
      });
      expect(result.success).toBe(true);
    });

    it('accepts missing optional CEP (undefined)', () => {
      const result = createCreditRequestSchema.safeParse({ ...VALID_DATA });
      expect(result.success).toBe(true);
    });

    it('accepts an optional observacoes up to 1000 chars', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        observacoes: 'a'.repeat(1000),
      });
      expect(result.success).toBe(true);
    });
  });

  // ─── customerTipo ────────────────────────────────────────────────────────
  describe('customerTipo field', () => {
    it('rejects a missing customerTipo', () => {
      const { customerTipo, ...rest } = VALID_DATA;
      const result = createCreditRequestSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects an invalid tipo value', () => {
      const result = createCreditRequestSchema.safeParse({ ...VALID_DATA, customerTipo: 'ME' });
      expect(result.success).toBe(false);
    });
  });

  // ─── Document cross-field validation ──────────────────────────────────────
  describe('CPF/CNPJ cross-field validation', () => {
    it('rejects an invalid CPF for PF type', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerDocumento: '529.982.247-26', // wrong last digit
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const cpfError = result.error.issues.find((i) => i.path[0] === 'customerDocumento');
        expect(cpfError?.message).toMatch(/CPF inválido/i);
      }
    });

    it('rejects an invalid CNPJ for PJ type', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerTipo: 'PJ',
        customerDocumento: '11.222.333/0001-82', // wrong last digit
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const cnpjError = result.error.issues.find((i) => i.path[0] === 'customerDocumento');
        expect(cnpjError?.message).toMatch(/CNPJ inválido/i);
      }
    });

    it('rejects empty document', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerDocumento: '',
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── customerNome ─────────────────────────────────────────────────────────
  describe('customerNome field', () => {
    it('rejects a name shorter than 3 characters', () => {
      const result = createCreditRequestSchema.safeParse({ ...VALID_DATA, customerNome: 'AB' });
      expect(result.success).toBe(false);
    });

    it('rejects a name longer than 120 characters', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerNome: 'A'.repeat(121),
      });
      expect(result.success).toBe(false);
    });

    it('accepts a name of exactly 3 characters', () => {
      const result = createCreditRequestSchema.safeParse({ ...VALID_DATA, customerNome: 'Ana' });
      expect(result.success).toBe(true);
    });
  });

  // ─── customerEmail ────────────────────────────────────────────────────────
  describe('customerEmail field', () => {
    it('rejects a malformed email', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerEmail: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('rejects an empty email', () => {
      const result = createCreditRequestSchema.safeParse({ ...VALID_DATA, customerEmail: '' });
      expect(result.success).toBe(false);
    });

    it('accepts email with subdomain', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerEmail: 'user@mail.example.com.br',
      });
      expect(result.success).toBe(true);
    });
  });

  // ─── customerTelefone ─────────────────────────────────────────────────────
  describe('customerTelefone field', () => {
    it('accepts a valid 11-digit mobile format', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerTelefone: '(11) 99999-9999',
      });
      expect(result.success).toBe(true);
    });

    it('accepts a valid 10-digit fixed format', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerTelefone: '(11) 3333-4444',
      });
      expect(result.success).toBe(true);
    });

    it('rejects a phone without DDD parentheses', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerTelefone: '11 99999-9999',
      });
      expect(result.success).toBe(false);
    });

    it('rejects an empty phone', () => {
      const result = createCreditRequestSchema.safeParse({ ...VALID_DATA, customerTelefone: '' });
      expect(result.success).toBe(false);
    });
  });

  // ─── customerRenda ────────────────────────────────────────────────────────
  describe('customerRenda field', () => {
    it('rejects renda below minimum R$100', () => {
      const result = createCreditRequestSchema.safeParse({ ...VALID_DATA, customerRenda: 99 });
      expect(result.success).toBe(false);
    });

    it('accepts minimum valid renda R$100', () => {
      const result = createCreditRequestSchema.safeParse({ ...VALID_DATA, customerRenda: 100 });
      expect(result.success).toBe(true);
    });

    it('coerces string number to number', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerRenda: '5000' as unknown as number,
      });
      expect(result.success).toBe(true);
    });
  });

  // ─── CEP ─────────────────────────────────────────────────────────────────
  describe('customerCep field', () => {
    it('rejects a CEP without dash', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerCep: '01310100',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a CEP with wrong format', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        customerCep: '1234-123',
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── valorSolicitado ──────────────────────────────────────────────────────
  describe('valorSolicitado field', () => {
    it('rejects valor below minimum R$500', () => {
      const result = createCreditRequestSchema.safeParse({ ...VALID_DATA, valorSolicitado: 499 });
      expect(result.success).toBe(false);
    });

    it('accepts minimum valor R$500', () => {
      const result = createCreditRequestSchema.safeParse({ ...VALID_DATA, valorSolicitado: 500 });
      expect(result.success).toBe(true);
    });

    it('rejects valor above maximum R$10.000.000', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        valorSolicitado: 10_000_001,
      });
      expect(result.success).toBe(false);
    });

    it('accepts maximum valor R$10.000.000', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        valorSolicitado: 10_000_000,
      });
      expect(result.success).toBe(true);
    });
  });

  // ─── finalidade ───────────────────────────────────────────────────────────
  describe('finalidade field', () => {
    it('rejects finalidade shorter than 10 characters', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        finalidade: 'Curto',
      });
      expect(result.success).toBe(false);
    });

    it('accepts finalidade of exactly 10 characters', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        finalidade: 'Compra equ',
      });
      expect(result.success).toBe(true);
    });

    it('rejects finalidade longer than 500 characters', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        finalidade: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── observacoes ──────────────────────────────────────────────────────────
  describe('observacoes field', () => {
    it('rejects observacoes longer than 1000 characters', () => {
      const result = createCreditRequestSchema.safeParse({
        ...VALID_DATA,
        observacoes: 'a'.repeat(1001),
      });
      expect(result.success).toBe(false);
    });
  });
});

// ─── approveSchema ──────────────────────────────────────────────────────────
describe('approveSchema', () => {
  it('accepts empty observacoes', () => {
    expect(approveSchema.safeParse({}).success).toBe(true);
  });

  it('accepts observacoes up to 500 chars', () => {
    expect(approveSchema.safeParse({ observacoes: 'a'.repeat(500) }).success).toBe(true);
  });

  it('rejects observacoes over 500 chars', () => {
    expect(approveSchema.safeParse({ observacoes: 'a'.repeat(501) }).success).toBe(false);
  });
});

// ─── rejectSchema ────────────────────────────────────────────────────────────
describe('rejectSchema', () => {
  it('accepts a valid motivoRejeicao of 10+ chars', () => {
    expect(rejectSchema.safeParse({ motivoRejeicao: 'Score abaixo do mínimo permitido.' }).success).toBe(true);
  });

  it('rejects motivoRejeicao shorter than 10 chars', () => {
    const result = rejectSchema.safeParse({ motivoRejeicao: 'Curto' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/10 caracteres/i);
    }
  });

  it('rejects an empty motivoRejeicao', () => {
    expect(rejectSchema.safeParse({ motivoRejeicao: '' }).success).toBe(false);
  });

  it('rejects motivoRejeicao longer than 500 chars', () => {
    expect(rejectSchema.safeParse({ motivoRejeicao: 'a'.repeat(501) }).success).toBe(false);
  });

  it('rejects missing motivoRejeicao', () => {
    expect(rejectSchema.safeParse({}).success).toBe(false);
  });
});
