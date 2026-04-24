/**
 * E2E: Solicitação Detail + Approval/Rejection Flow
 *
 * Covers:
 * - Detail page renders: customer name, status badge, score gauge, request number
 * - Approval tiers displayed (GERENTE, LIDER, etc.)
 * - Voltar button navigates back
 * - ApprovalForm visible for active requests (SOLICITADA, EM_ANALISE, EM_APROVACAO)
 * - ApprovalForm NOT visible for terminal requests (APROVADA, REJEITADA)
 * - Tab toggle: "Aprovar" (default) and "Rejeitar"
 * - Approve tab shows optional observations textarea
 * - Reject tab shows required motivoRejeicao textarea
 * - Rejection validation: motivo must be ≥10 characters
 * - Successful approval → status changes to APROVADA
 * - Successful rejection → status changes to REJEITADA, form disappears
 * - Not Found state for unknown request ID
 *
 * Seeded data used:
 * - req-001 (APROVADA)      → Ana Carolina Ferreira, R$45k  — terminal, no form
 * - req-002 (EM_APROVACAO)  → Tech Solutions Ltda., R$180k  — approval form shown
 * - req-003 (SOLICITADA)    → Carlos Eduardo Mendes, R$8.5k  — approval form shown
 * - req-005 (REJEITADA)     → some PF, R$3.2k  — terminal, no form
 */

describe('Solicitação Detail — Approval & Rejection Flow', () => {
  // ── Detail Page Rendering ──────────────────────────────────────────────────

  describe('Detail rendering for an APROVADA request (req-001)', () => {
    beforeEach(() => {
      cy.visit('/dashboard/solicitacoes/req-001');
    });

    it('renders the customer name', () => {
      cy.contains('Ana Carolina Ferreira', { timeout: 10000 }).should('be.visible');
    });

    it('renders the request number', () => {
      cy.contains('SOL-2026-00001').should('be.visible');
    });

    it('renders the APROVADA status badge', () => {
      cy.contains('Aprovada').should('be.visible');
    });

    it('renders the requested value', () => {
      cy.contains(/R\$\s*45[.,]000/).should('exist');
    });

    it('renders the score gauge (SVG)', () => {
      cy.get('svg', { timeout: 10000 }).should('exist');
    });

    it('does NOT render the approval form for APROVADA status', () => {
      cy.contains('Ações', { timeout: 10000 }).should('not.exist');
      cy.contains('button', 'Aprovar').should('not.exist');
      cy.contains('button', 'Rejeitar').should('not.exist');
    });

    it('renders the Voltar button', () => {
      cy.contains('button', 'Voltar').should('be.visible');
    });

    it('Voltar button navigates back to list', () => {
      cy.contains('button', 'Voltar').click();
      cy.url().should('not.include', '/req-001');
    });
  });

  // ── REJEITADA — Terminal Status ────────────────────────────────────────────

  describe('Detail rendering for a REJEITADA request (req-005)', () => {
    beforeEach(() => {
      cy.visit('/dashboard/solicitacoes/req-005');
    });

    it('renders the REJEITADA status badge', () => {
      cy.contains('Rejeitada', { timeout: 10000 }).should('be.visible');
    });

    it('does NOT render the approval form for REJEITADA status', () => {
      cy.contains('Ações', { timeout: 10000 }).should('not.exist');
    });

    it('shows the rejection motivo', () => {
      cy.contains('Score de crédito insuficiente').should('be.visible');
    });
  });

  // ── EM_APROVACAO — Approval Form Visible ──────────────────────────────────

  describe('ApprovalForm for an EM_APROVACAO request (req-002)', () => {
    beforeEach(() => {
      cy.visit('/dashboard/solicitacoes/req-002');
    });

    it('renders Tech Solutions customer name', () => {
      cy.contains('Tech Solutions Ltda.', { timeout: 10000 }).should('be.visible');
    });

    it('renders EM_APROVACAO status badge', () => {
      cy.contains('Em Aprovação').should('be.visible');
    });

    it('renders the Ações section heading', () => {
      cy.contains('Ações', { timeout: 10000 }).should('be.visible');
    });

    it('renders the Aprovar tab button (active by default)', () => {
      cy.contains('button', 'Aprovar', { timeout: 10000 }).should('be.visible');
    });

    it('renders the Rejeitar tab button', () => {
      cy.contains('button', 'Rejeitar', { timeout: 10000 }).should('be.visible');
    });

    it('Approve tab is active by default (orange background)', () => {
      cy.contains('button', 'Aprovar')
        .should('have.class', 'bg-orange-500');
    });

    it('shows Observações textarea in Approve tab', () => {
      cy.get('textarea[placeholder="Comentários sobre a aprovação..."]').should('be.visible');
    });

    it('shows Confirmar Aprovação submit button in Approve tab', () => {
      cy.contains('button', 'Confirmar Aprovação').should('be.visible');
    });

    it('switches to Reject tab on click', () => {
      cy.contains('button', 'Rejeitar').click();
      cy.get('textarea[placeholder*="mínimo 10 caracteres"]').should('be.visible');
    });

    it('shows Confirmar Rejeição button in Reject tab', () => {
      cy.contains('button', 'Rejeitar').click();
      cy.contains('button', 'Confirmar Rejeição').should('be.visible');
    });

    it('shows validation error for motivo shorter than 10 chars', () => {
      cy.contains('button', 'Rejeitar').click();
      cy.get('textarea[placeholder*="mínimo 10 caracteres"]').type('Curto');
      cy.contains('button', 'Confirmar Rejeição').click();
      cy.contains('10 caracteres', { matchCase: false }).should('be.visible');
    });

    it('shows character counter for observações', () => {
      cy.get('textarea[placeholder="Comentários sobre a aprovação..."]').type('obs');
      cy.contains('/500 caracteres').should('be.visible');
    });

    it('shows character counter for motivo rejeição', () => {
      cy.contains('button', 'Rejeitar').click();
      cy.get('textarea[placeholder*="mínimo 10 caracteres"]').type('motivo');
      cy.contains('/500 caracteres').should('be.visible');
    });
  });

  // ── Successful Approval Flow ───────────────────────────────────────────────

  describe('Approval flow for a SOLICITADA request (req-003)', () => {
    beforeEach(() => {
      cy.visit('/dashboard/solicitacoes/req-003');
    });

    it('renders the approval form for SOLICITADA status', () => {
      cy.contains('Ações', { timeout: 10000 }).should('be.visible');
    });

    it('successfully approves a request and updates status to APROVADA', () => {
      // Confirm Approval (no observations required)
      cy.contains('button', 'Confirmar Aprovação', { timeout: 10000 }).click();

      // Status should update to APROVADA
      cy.contains('Aprovada', { timeout: 15000 }).should('be.visible');
      // Approval form should disappear after approval
      cy.contains('Ações', { timeout: 10000 }).should('not.exist');
    });

    it('approval with optional observations succeeds', () => {
      cy.get('textarea[placeholder="Comentários sobre a aprovação..."]', { timeout: 10000 })
        .type('Aprovação com observação de teste para verificação do fluxo.');
      cy.contains('button', 'Confirmar Aprovação').click();
      cy.contains('Aprovada', { timeout: 15000 }).should('be.visible');
    });
  });

  // ── Successful Rejection Flow ──────────────────────────────────────────────

  describe('Rejection flow for a SOLICITADA request (req-003)', () => {
    beforeEach(() => {
      cy.visit('/dashboard/solicitacoes/req-003');
      // Switch to reject tab
      cy.contains('button', 'Rejeitar', { timeout: 10000 }).click();
    });

    it('rejects empty motivo with validation error', () => {
      cy.contains('button', 'Confirmar Rejeição').click();
      // Zod .min(10) fires for empty string: 'Informe o motivo com pelo menos 10 caracteres'
      cy.contains('10 caracteres', { matchCase: false }).should('be.visible');
    });

    it('rejects motivo with < 10 chars with validation error', () => {
      cy.get('textarea[placeholder*="mínimo 10 caracteres"]').type('Curto');
      cy.contains('button', 'Confirmar Rejeição').click();
      cy.contains('10 caracteres', { matchCase: false }).should('be.visible');
    });

    it('successfully rejects with motivo ≥ 10 chars and updates status', () => {
      cy.get('textarea[placeholder*="mínimo 10 caracteres"]')
        .type('Score insuficiente para a modalidade solicitada neste período.');
      cy.contains('button', 'Confirmar Rejeição').click();

      // Status updates to REJEITADA
      cy.contains('Rejeitada', { timeout: 15000 }).should('be.visible');
      // Approval form disappears
      cy.contains('Ações', { timeout: 5000 }).should('not.exist');
    });

    it('motivo of exactly 10 chars passes validation', () => {
      cy.get('textarea[placeholder*="mínimo 10 caracteres"]').type('1234567890');
      cy.contains('button', 'Confirmar Rejeição').click();
      cy.contains('Rejeitada', { timeout: 15000 }).should('be.visible');
    });
  });

  // ── Not Found State ────────────────────────────────────────────────────────

  describe('Not Found state for unknown request ID', () => {
    beforeEach(() => {
      cy.visit('/dashboard/solicitacoes/non-existent-id-xyz');
    });

    it('shows not found message', () => {
      cy.contains('não encontrada', { timeout: 10000, matchCase: false }).should('be.visible');
    });

    it('shows Voltar button on not found page', () => {
      cy.contains('button', 'Voltar', { timeout: 10000 }).should('be.visible');
    });
  });

  // ── Approval Tier Display ──────────────────────────────────────────────────

  describe('Approval tier information on detail page', () => {
    it('shows GERENTE tier for req-002 (R$180k)', () => {
      cy.visit('/dashboard/solicitacoes/req-002');
      cy.contains('Gerente', { timeout: 10000 }).should('be.visible');
    });

    it('shows LIDER tier for req-003 (R$8.5k)', () => {
      cy.visit('/dashboard/solicitacoes/req-003');
      cy.contains('Líder', { timeout: 10000 }).should('be.visible');
    });

    it('shows GERENTE GERAL tier for req-004 (R$750k)', () => {
      cy.visit('/dashboard/solicitacoes/req-004');
      cy.contains('Gerente Geral', { timeout: 10000 }).should('be.visible');
    });
  });
});
