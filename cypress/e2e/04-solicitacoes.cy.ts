/**
 * E2E: Solicitações — List Page
 *
 * Covers:
 * - List renders with seeded mock requests
 * - Nova Solicitação button present and working
 * - Search by name filters results
 * - Search by request number filters results
 * - Filter by status filters results
 * - Clear filters restores full list
 * - Status badges displayed with correct labels
 * - Clicking a request card navigates to detail page
 * - Request card shows: customer name, document, amount, status badge
 * - Empty state shown when no results match search/filter
 * - Result count displayed
 */

describe('Solicitações — List Page', () => {
  beforeEach(() => {
    cy.visit('/dashboard/solicitacoes');
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the search input', () => {
    cy.get('input[placeholder="Buscar por nome, documento ou número..."]').should('be.visible');
  });

  it('renders the status filter select', () => {
    cy.get('select').should('be.visible');
    cy.get('select option').should('have.length.gte', 2);
  });

  it('renders the Nova Solicitação button', () => {
    cy.contains('button', 'Nova Solicitação').should('be.visible');
  });

  it('Nova Solicitação button navigates to the form', () => {
    cy.contains('button', 'Nova Solicitação').click();
    cy.url().should('include', '/dashboard/solicitacoes/nova');
  });

  it('displays request cards from seeded mock data', () => {
    // At least 1 request card should be visible
    cy.get('[class*="glass"]', { timeout: 10000 })
      .filter(':has([class*="badge"])')
      .should('have.length.gte', 1);
  });

  it('shows the result count label', () => {
    cy.contains(/solicitaç[ão|ões]+ encontrada/, { matchCase: false }).should('be.visible');
  });

  it('shows result count greater than 0 with seeded data', () => {
    cy.contains(/\d+ solicitaç/, { timeout: 10000 }).invoke('text').then((text) => {
      const count = parseInt(text.trim(), 10);
      expect(count).to.be.greaterThan(0);
    });
  });

  // ── Status Badges ──────────────────────────────────────────────────────────

  it('renders APROVADA status badge', () => {
    cy.contains('Aprovada').should('exist');
  });

  it('renders SOLICITADA status badge', () => {
    cy.contains('Solicitada').should('exist');
  });

  it('renders EM_APROVACAO status badge', () => {
    cy.contains('Em Aprovação').should('exist');
  });

  it('renders EM_ANALISE status badge', () => {
    cy.contains('Em Análise').should('exist');
  });

  it('renders REJEITADA status badge', () => {
    cy.contains('Rejeitada').should('exist');
  });

  // ── Request Card Details ───────────────────────────────────────────────────

  it('request card shows customer name (Ana Carolina Ferreira)', () => {
    cy.contains('Ana Carolina Ferreira').should('be.visible');
  });

  it('request card shows request number (SOL-2026-00001)', () => {
    cy.contains('SOL-2026-00001').should('be.visible');
  });

  it('request card shows formatted currency amount', () => {
    cy.contains(/R\$\s*[\d.,]+/).should('exist');
  });

  it('request card shows Ver detalhes / action button', () => {
    cy.contains('Ver detalhes').should('exist');
  });

  // ── Search Functionality ───────────────────────────────────────────────────

  it('search by customer name filters the list', () => {
    cy.get('input[placeholder="Buscar por nome, documento ou número..."]')
      .type('Ana Carolina');

    cy.contains('Ana Carolina Ferreira', { timeout: 10000 }).should('be.visible');
    // Other customers should not appear (filtered out)
    cy.contains('Tech Solutions', { timeout: 3000 }).should('not.exist');
  });

  it('search by request number filters the list', () => {
    cy.get('input[placeholder="Buscar por nome, documento ou número..."]')
      .type('SOL-2026-00001');

    cy.contains('SOL-2026-00001', { timeout: 10000 }).should('be.visible');
    cy.contains('SOL-2026-00002', { timeout: 3000 }).should('not.exist');
  });

  it('searching with no match shows empty state', () => {
    cy.get('input[placeholder="Buscar por nome, documento ou número..."]')
      .type('XXXXXXNOTFOUNDXXXXXX');

    cy.contains('Nenhuma solicitação', { timeout: 10000, matchCase: false }).should('be.visible');
  });

  it('clearing search restores full list', () => {
    cy.get('input[placeholder="Buscar por nome, documento ou número..."]')
      .type('Ana Carolina');
    cy.contains('Ana Carolina Ferreira', { timeout: 10000 }).should('be.visible');

    cy.get('input[placeholder="Buscar por nome, documento ou número..."]').clear();
    // After clearing, other requests should reappear
    cy.contains('Tech Solutions', { timeout: 10000 }).should('be.visible');
  });

  // ── Status Filter ──────────────────────────────────────────────────────────

  it('filtering by APROVADA shows only approved requests', () => {
    cy.get('select').select('APROVADA');

    cy.contains('Aprovada', { timeout: 10000 }).should('be.visible');
    // Requests in other statuses should not appear
    cy.contains('Solicitada', { timeout: 3000 }).should('not.exist');
    cy.contains('Em Análise', { timeout: 3000 }).should('not.exist');
  });

  it('filtering by SOLICITADA shows only submitted requests', () => {
    cy.get('select').select('SOLICITADA');

    cy.contains('Solicitada', { timeout: 10000 }).should('be.visible');
    cy.contains('Aprovada', { timeout: 3000 }).should('not.exist');
  });

  it('filtering by REJEITADA shows only rejected requests', () => {
    cy.get('select').select('REJEITADA');

    cy.contains('Rejeitada', { timeout: 10000 }).should('be.visible');
    cy.contains('Aprovada', { timeout: 3000 }).should('not.exist');
  });

  it('selecting Todos os status restores full list', () => {
    cy.get('select').select('APROVADA');
    cy.contains('Aprovada', { timeout: 10000 }).should('be.visible');

    cy.get('select').select('');
    cy.contains('Rejeitada', { timeout: 10000 }).should('be.visible');
    cy.contains('Aprovada').should('be.visible');
  });

  // ── Navigation to Detail ───────────────────────────────────────────────────

  it('clicking a request card navigates to detail page', () => {
    cy.contains('Ver detalhes').first().click();
    cy.url().should('match', /\/dashboard\/solicitacoes\/.+/);
  });

  it('clicking Ana Carolina Ferreira request navigates to detail', () => {
    cy.contains('Ana Carolina Ferreira')
      .closest('[class*="glass"]')
      .contains('Ver detalhes')
      .click();
    cy.url().should('include', '/dashboard/solicitacoes/req-001');
  });
});
