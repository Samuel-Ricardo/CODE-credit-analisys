/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Example custom command
// Cypress.Commands.add('login', (email, password) => { ... })

export {}
// ***********************************************
// Custom commands para o projeto VV_AnaliseCredito
// ***********************************************

/**
 * Limpa localStorage e força o seed de dados mock.
 * Chame antes de cada teste que precisa de estado limpo.
 */
Cypress.Commands.add('resetStorage', () => {
  cy.clearLocalStorage();
  // Remove a chave para forçar re-seed na próxima visita
  cy.window().then((win) => {
    win.localStorage.removeItem('vv_solicitacoes');
  });
});

/**
 * Navega para uma página e aguarda o hydration do Next.js.
 */
Cypress.Commands.add('visitAndWait', (path: string) => {
  cy.visit(path);
  // Aguarda o conteúdo principal estar visível
  cy.get('body').should('not.be.empty');
  cy.get('[data-testid="app-shell"], main, #__next').should('exist');
});

/**
 * Preenche o formulário de Nova Solicitação com dados padrão de teste.
 * Retorna o valor usado para validações posteriores.
 */
Cypress.Commands.add('preencherFormSolicitacao', (opts?: {
  clienteNome?: string;
  valor?: number;
  finalidade?: string;
  bandeira?: string;
}) => {
  const clienteNome = opts?.clienteNome ?? 'Distribuidora Brasil';
  const valor = opts?.valor ?? 25000;
  const finalidade = opts?.finalidade ?? 'Capital de Giro';
  const bandeira = opts?.bandeira ?? 'Visa';

  // Cliente (Autocomplete MUI)
  cy.get('input[placeholder*="cliente" i], input[id*="cliente" i], .MuiAutocomplete-input')
    .first()
    .click()
    .type(clienteNome.substring(0, 8));
  cy.get('.MuiAutocomplete-popper li, [role="option"]').first().click();

  // Valor solicitado
  cy.get('input[type="number"], input[placeholder*="valor" i], input[id*="valor" i]')
    .first()
    .clear()
    .type(String(valor));

  // Finalidade
  cy.contains('Finalidade').closest('[class*="MuiFormControl"]')
    .find('input, [role="combobox"]').click();
  cy.contains('[role="option"], li', finalidade).click();

  // Bandeira
  cy.contains('Bandeira').closest('[class*="MuiFormControl"]')
    .find('input, [role="combobox"]').click();
  cy.contains('[role="option"], li', bandeira).click();
});

/**
 * Seleciona uma solicitação pendente na página de análise
 * e dispara a análise de crédito.
 */
Cypress.Commands.add('executarAnalise', () => {
  cy.get('[role="combobox"], select')
    .filter(':visible')
    .first()
    .click({ force: true });
  cy.get('[role="option"], option').filter(':visible').first().click({ force: true });
  cy.contains('button', /iniciar|analisar|processar/i).click();
});

// Tipagem TypeScript das custom commands
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      resetStorage(): Chainable<void>;
      visitAndWait(path: string): Chainable<void>;
      preencherFormSolicitacao(opts?: {
        clienteNome?: string;
        valor?: number;
        finalidade?: string;
        bandeira?: string;
      }): Chainable<void>;
      executarAnalise(): Chainable<void>;
    }
  }
}
