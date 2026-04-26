import { describe, it, expect } from 'vitest';
import { CreditRequest, ApprovalTier } from '@/domain/entities/CreditRequest';
import { Money } from '@/domain/value-objects/Money';

describe('CreditRequest Entity', () => {
  // ─── Approval Tier (Business Rule RN — Alçadas) ────────────────────────────
  describe('determineApprovalTier() — regras de alçada', () => {
    it('assigns LIDER for values up to R$10.000', () => {
      expect(CreditRequest.determineApprovalTier(10_000)).toBe('LIDER');
    });

    it('assigns LIDER for values below R$10.000', () => {
      expect(CreditRequest.determineApprovalTier(1_000)).toBe('LIDER');
      expect(CreditRequest.determineApprovalTier(5_000)).toBe('LIDER');
    });

    it('assigns COORDENADOR for R$10.001 to R$50.000', () => {
      expect(CreditRequest.determineApprovalTier(10_001)).toBe('COORDENADOR');
      expect(CreditRequest.determineApprovalTier(50_000)).toBe('COORDENADOR');
    });

    it('assigns GERENTE for R$50.001 to R$200.000', () => {
      expect(CreditRequest.determineApprovalTier(50_001)).toBe('GERENTE');
      expect(CreditRequest.determineApprovalTier(200_000)).toBe('GERENTE');
    });

    it('assigns GERENTE_GERAL for R$200.001 to R$1.000.000', () => {
      expect(CreditRequest.determineApprovalTier(200_001)).toBe('GERENTE_GERAL');
      expect(CreditRequest.determineApprovalTier(1_000_000)).toBe('GERENTE_GERAL');
    });

    it('assigns DIRETORIA for values above R$1.000.000', () => {
      expect(CreditRequest.determineApprovalTier(1_000_001)).toBe('DIRETORIA');
      expect(CreditRequest.determineApprovalTier(5_000_000)).toBe('DIRETORIA');
    });
  });

  // ─── canBeApprovedBy() ────────────────────────────────────────────────────
  describe('canBeApprovedBy() — hierarquia de alçadas', () => {
    function makeReq(alcada: ApprovalTier) {
      return CreditRequest.create({
        id: 'r1',
        numeroSolicitacao: 'SOL-2025-00001',
        customerId: 'c1',
        valorSolicitado: Money.fromReais(5000),
        bandeiraId: 'visa',
        modalidade: 'CREDITO_PESSOAL',
        finalidade: 'Compra de equipamentos',
        status: 'SOLICITADA',
        alcadaRequerida: alcada,
        dataInclusao: new Date(),
      });
    }

    it('allows LIDER to approve a LIDER request', () => {
      expect(makeReq('LIDER').canBeApprovedBy('LIDER')).toBe(true);
    });

    it('allows COORDENADOR to approve a LIDER request', () => {
      expect(makeReq('LIDER').canBeApprovedBy('COORDENADOR')).toBe(true);
    });

    it('allows DIRETORIA to approve any request', () => {
      expect(makeReq('LIDER').canBeApprovedBy('DIRETORIA')).toBe(true);
      expect(makeReq('GERENTE_GERAL').canBeApprovedBy('DIRETORIA')).toBe(true);
    });

    it('denies LIDER from approving a COORDENADOR request', () => {
      expect(makeReq('COORDENADOR').canBeApprovedBy('LIDER')).toBe(false);
    });

    it('denies COORDENADOR from approving a GERENTE request', () => {
      expect(makeReq('GERENTE').canBeApprovedBy('COORDENADOR')).toBe(false);
    });

    it('denies GERENTE from approving a DIRETORIA request', () => {
      expect(makeReq('DIRETORIA').canBeApprovedBy('GERENTE')).toBe(false);
    });
  });

  // ─── isActive() ──────────────────────────────────────────────────────────
  describe('isActive()', () => {
    const activeStatuses = ['RASCUNHO', 'SOLICITADA', 'EM_ANALISE', 'EM_APROVACAO'] as const;
    const terminalStatuses = ['APROVADA', 'REJEITADA', 'CANCELADA'] as const;

    activeStatuses.forEach((s) => {
      it(`returns true for status ${s}`, () => {
        const req = CreditRequest.create({
          id: 'r1', numeroSolicitacao: 'SOL-2025-00001',
          customerId: 'c1', valorSolicitado: Money.fromReais(1000),
          bandeiraId: 'visa', modalidade: 'CREDITO_PESSOAL',
          finalidade: 'Pagamento de contas', status: s,
          alcadaRequerida: 'LIDER', dataInclusao: new Date(),
        });
        expect(req.isActive()).toBe(true);
      });
    });

    terminalStatuses.forEach((s) => {
      it(`returns false for status ${s}`, () => {
        const req = CreditRequest.create({
          id: 'r1', numeroSolicitacao: 'SOL-2025-00001',
          customerId: 'c1', valorSolicitado: Money.fromReais(1000),
          bandeiraId: 'visa', modalidade: 'CREDITO_PESSOAL',
          finalidade: 'Pagamento de contas', status: s,
          alcadaRequerida: 'LIDER', dataInclusao: new Date(),
        });
        expect(req.isActive()).toBe(false);
      });
    });
  });

  // ─── withStatus() — immutability ──────────────────────────────────────────
  describe('withStatus()', () => {
    it('returns a NEW instance (immutable update)', () => {
      const req = CreditRequest.create({
        id: 'r1', numeroSolicitacao: 'SOL-1', customerId: 'c1',
        valorSolicitado: Money.fromReais(5000), bandeiraId: 'visa',
        modalidade: 'CREDITO_PESSOAL', finalidade: 'Compra de estoque',
        status: 'SOLICITADA', alcadaRequerida: 'LIDER', dataInclusao: new Date(),
      });

      const approved = req.withStatus('APROVADA', {
        valorAprovado: Money.fromReais(5000),
        dataConclusao: new Date(),
      });

      expect(approved).not.toBe(req);
      expect(approved.status).toBe('APROVADA');
      expect(req.status).toBe('SOLICITADA'); // original unchanged
    });

    it('copies extra props correctly', () => {
      const req = CreditRequest.create({
        id: 'r2', numeroSolicitacao: 'SOL-2', customerId: 'c2',
        valorSolicitado: Money.fromReais(10000), bandeiraId: 'master',
        modalidade: 'CAPITAL_GIRO', finalidade: 'Capital de giro',
        status: 'SOLICITADA', alcadaRequerida: 'COORDENADOR', dataInclusao: new Date(),
      });

      const rejected = req.withStatus('REJEITADA', {
        motivoRejeicao: 'Score abaixo do mínimo',
      });

      expect(rejected.status).toBe('REJEITADA');
      expect(rejected.motivoRejeicao).toBe('Score abaixo do mínimo');
      expect(rejected.valorSolicitado.value).toBe(10000); // other props preserved
    });
  });
});
