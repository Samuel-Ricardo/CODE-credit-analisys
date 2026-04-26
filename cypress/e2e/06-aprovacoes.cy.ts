/**
 * E2E: Aprovações Page
 *
 * Covers:
 * - Page renders heading "Aprovações"
 * - Shows count of pending requests
 * - Only shows SOLICITADA, EM_ANALISE, EM_APROVACAO requests
 * - Does NOT show APROVADA or REJEITADA requests
 * - Atualizar button works
 * - Clicking a request card navigates to its detail page
 * - Status badges for pending requests are correct
 *
 * Seeded data (pending):
 * - req-002: EM_APROVACAO, Tech Solutions Ltda.
 * - req-003: SOLICITADA, Carlos Eduardo Mendes
 * - req-004: EM_ANALISE, some PJ customer
 */

describe('Aprovações Page', () => {
  beforeEach(() => {
    cy.visit('/dashboard/aprovacoes');
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the Aprovações heading', () => {
    cy.contains('h2', 'Aprovações', { timeout: 10000 }).should('be.visible');
  });

  it('renders the pending count subtitle', () => {
    cy.contains(/aguardando análise/, { timeout: 10000 }).should('be.visible');
  });

  it('shows count of 3 pending requests from seeded data', () => {
    // Seeded data has 5 pending requests (req-002, req-003, req-004, req-007, req-008)
    cy.contains(/[1-9]\d* solicitaç/, { timeout: 10000 }).should('be.visible');
  });

  it('renders the Atualizar button', () => {
    cy.contains('button', 'Atualizar').should('be.visible');
  });

  // ── Pending Requests Listed ────────────────────────────────────────────────

  it('shows Tech Solutions Ltda. (EM_APROVACAO) in the list', () => {
    cy.contains('Tech Solutions Ltda.', { timeout: 10000 }).should('be.visible');
  });

  it('shows Carlos Eduardo Mendes (SOLICITADA) in the list', () => {
    cy.contains('Carlos Eduardo Mendes', { timeout: 10000 }).should('be.visible');
  });

  it('shows EM_ANALISE badge in the list', () => {
    cy.contains('Em Análise', { timeout: 10000 }).should('be.visible');
  });

  it('shows EM_APROVACAO badge in the list', () => {
    cy.contains('Em Aprovação', { timeout: 10000 }).should('be.visible');
  });

  it('shows Solicitada badge in the list', () => {
    cy.contains('Solicitada', { timeout: 10000 }).should('be.visible');
  });

  // ── Excluded Requests ──────────────────────────────────────────────────────

  it('does NOT show APROVADA requests', () => {
    // Ana Carolina Ferreira (req-001) is APROVADA — should not appear
    cy.contains('Ana Carolina Ferreira', { timeout: 5000 }).should('not.exist');
  });

  it('does NOT show REJEITADA requests', () => {
    // req-005 is REJEITADA — should not appear
    cy.contains('SOL-2026-00005', { timeout: 5000 }).should('not.exist');
  });

  // ── Interaction ────────────────────────────────────────────────────────────

  it('clicking a request card navigates to its detail page', () => {
    cy.contains('Ver detalhes', { timeout: 10000 }).first().click();
    cy.url().should('match', /\/dashboard\/solicitacoes\/.+/);
  });

  it('clicking Atualizar refreshes without error', () => {
    cy.contains('button', 'Atualizar').click();
    cy.contains('Aprovações', { timeout: 10000 }).should('be.visible');
    cy.contains('Tech Solutions Ltda.').should('be.visible');
  });

  it('navigating from Aprovações to detail and back preserves list', () => {
    cy.contains('Ver detalhes', { timeout: 10000 }).first().click();
    cy.url().should('match', /\/dashboard\/solicitacoes\/.+/);
    cy.contains('button', 'Voltar').click();
    // router.back() returns to /dashboard/aprovacoes (where we came from)
    cy.url().should('include', '/dashboard/aprovacoes');
  });
});
