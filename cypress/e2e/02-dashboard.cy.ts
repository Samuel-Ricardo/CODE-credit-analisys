/**
 * E2E: Dashboard Page
 *
 * Covers:
 * - Stats cards (total, pendentes, taxa aprovação)
 * - Charts section visible
 * - Recent requests list
 * - Action buttons (Nova Solicitação, Atualizar)
 * - Loading skeleton then real content
 */

describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('renders the page heading', () => {
    cy.contains('Visão Geral').should('be.visible');
  });

  it('shows the current date below the heading', () => {
    // Date is rendered below the h2 heading
    const year = new Date().getFullYear().toString();
    cy.contains(year).should('exist');
  });

  it('renders the Nova Solicitação action button', () => {
    cy.contains('button', 'Nova Solicitação').should('be.visible');
  });

  it('renders the Atualizar button', () => {
    cy.contains('button', 'Atualizar').should('be.visible');
  });

  it('navigates to nova solicitação form on button click', () => {
    cy.contains('button', 'Nova Solicitação').click();
    cy.url().should('include', '/dashboard/solicitacoes/nova');
  });

  it('renders stats cards after data loads', () => {
    // Stats cards rendered by StatsCards component — each shows a label
    cy.contains('Total de Solicitações', { timeout: 10000 }).should('be.visible');
    cy.contains('Pendentes').should('be.visible');
    cy.contains('Taxa de Aprovação').should('be.visible');
  });

  it('stats cards show numeric values from seeded mock data', () => {
    // Seeded data has 6 requests total (2 APROVADA, 1 EM_APROVACAO, 1 SOLICITADA, 1 EM_ANALISE, 1 REJEITADA)
    cy.contains('Total de Solicitações', { timeout: 10000 })
      .parents('[class*="glass"]')
      .find('[class*="text-3xl"], [class*="font-bold"]')
      .invoke('text')
      .then((text) => {
        const count = parseInt(text.trim(), 10);
        expect(count).to.be.greaterThan(0);
      });
  });

  it('renders the volume chart section', () => {
    // The chart wrappers are rendered (recharts or placeholder)
    cy.contains('Volume por Dia', { timeout: 10000 }).should('exist');
  });

  it('renders the score distribution chart section', () => {
    cy.contains('Distribuição de Score', { timeout: 10000 }).should('exist');
  });

  it('renders recent requests section', () => {
    cy.contains('Solicitações Recentes', { timeout: 10000 }).should('exist');
  });

  it('shows request entries in recent requests list', () => {
    cy.contains('Solicitações Recentes', { timeout: 10000 })
      .parents('[class*="glass"]')
      .within(() => {
        // At least one request entry should be visible
        cy.get('[class*="badge"]').should('have.length.gte', 1);
      });
  });

  it('clicking Atualizar re-triggers load without error', () => {
    cy.contains('button', 'Atualizar').click();
    // After click it should still show content (no error state)
    cy.contains('Visão Geral').should('be.visible');
  });
});
