import { describe, it, expect } from 'vitest';
import { Customer } from '@/domain/entities/Customer';

const BASE_PROPS = {
  id: 'c1',
  tipo: 'PF' as const,
  documento: '52998224725',
  nomeRazaoSocial: 'João Silva',
  email: 'joao@email.com',
  telefone: '(11) 98765-4321',
  renda: 8000,
  endereco: {
    logradouro: 'Av. Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01310-100',
  },
  ativo: true,
  dataCadastro: new Date('2023-06-01'),
};

describe('Customer Entity', () => {
  describe('isPessoaFisica() / isPessoaJuridica()', () => {
    it('returns true for isPessoaFisica when tipo is PF', () => {
      const c = Customer.create({ ...BASE_PROPS, tipo: 'PF' });
      expect(c.isPessoaFisica()).toBe(true);
      expect(c.isPessoaJuridica()).toBe(false);
    });

    it('returns true for isPessoaJuridica when tipo is PJ', () => {
      const c = Customer.create({ ...BASE_PROPS, tipo: 'PJ', documento: '11222333000181' });
      expect(c.isPessoaJuridica()).toBe(true);
      expect(c.isPessoaFisica()).toBe(false);
    });
  });

  describe('documentoFormatado', () => {
    it('formats CPF correctly for PF customers', () => {
      const c = Customer.create({ ...BASE_PROPS, tipo: 'PF', documento: '52998224725' });
      expect(c.documentoFormatado).toBe('529.982.247-25');
    });

    it('formats CNPJ correctly for PJ customers', () => {
      const c = Customer.create({ ...BASE_PROPS, tipo: 'PJ', documento: '11222333000181' });
      expect(c.documentoFormatado).toBe('11.222.333/0001-81');
    });
  });

  describe('toPlain()', () => {
    it('returns a plain object with all props', () => {
      const c = Customer.create(BASE_PROPS);
      const plain = c.toPlain();
      expect(plain.id).toBe('c1');
      expect(plain.nomeRazaoSocial).toBe('João Silva');
      expect(plain.renda).toBe(8000);
    });

    it('returns a copy (not the same reference)', () => {
      const c = Customer.create(BASE_PROPS);
      const plain = c.toPlain();
      expect(plain).not.toBe(c);
    });
  });

  describe('getters', () => {
    it('exposes all expected fields', () => {
      const c = Customer.create(BASE_PROPS);
      expect(c.id).toBe('c1');
      expect(c.email).toBe('joao@email.com');
      expect(c.renda).toBe(8000);
      expect(c.ativo).toBe(true);
      expect(c.dataCadastro).toEqual(new Date('2023-06-01'));
    });
  });
});
