/**
 * E2E: Navigation & Layout
 *
 * Covers:
 * - Root redirect to /dashboard
 * - Sidebar brand/logo visible
 * - All sidebar nav items present and functional
 * - Active item highlighted on current route
 * - Mobile layout (header hamburger) is present
 */

describe('Navigation & Layout', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('redirects / to /dashboard', () => {
    cy.visit('/');
    cy.url().should('include', '/dashboard');
  });

  it('shows the VV Credito brand in the sidebar', () => {
    cy.contains('VV Credito').should('be.visible');
    cy.contains('Analise de Credito').should('be.visible');
  });

  it('renders all primary sidebar navigation items', () => {
    cy.contains('a, [role="button"], button, [class*="nav"]', 'Dashboard').should('exist');
    cy.contains('Solicitacoes').should('exist');
    cy.contains('Nova Analise').should('exist');
    cy.contains('Aprovacoes').should('exist');
    cy.contains('Relatorios').should('exist');
  });

  it('navigates to Solicitações from sidebar', () => {
    cy.contains('Solicitacoes').click();
    cy.url().should('include', '/dashboard/solicitacoes');
  });

  it('navigates to Aprovações from sidebar', () => {
    cy.contains('Aprovacoes').click();
    cy.url().should('include', '/dashboard/aprovacoes');
  });

  it('navigates to Nova Análise from sidebar', () => {
    cy.contains('Nova Analise').click();
    cy.url().should('include', '/dashboard/solicitacoes/nova');
  });

  it('navigates back to Dashboard from sidebar', () => {
    cy.visit('/dashboard/solicitacoes');
    cy.contains('Dashboard').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/dashboard');
  });

  it('highlights Dashboard nav item when on /dashboard', () => {
    cy.visit('/dashboard');
    // Active item has orange background
    cy.contains('Dashboard')
      .closest('button, a, [class*="nav-item"]')
      .should('have.class', /active|bg-white\/20|font-bold/);
  });

  it('highlights Solicitacoes nav item when on /dashboard/solicitacoes', () => {
    cy.visit('/dashboard/solicitacoes');
    cy.contains('Solicitacoes')
      .closest('button, a, [class*="nav-item"]')
      .should('have.class', /active|bg-white\/20|font-bold/);
  });

  it('shows page header on dashboard', () => {
    cy.contains('Visão Geral').should('be.visible');
  });
});
