// ***********************************************
// Custom Cypress commands for VV Crédito E2E tests
// ***********************************************

export interface CreditFormPFOptions {
  documento?: string;
  nome?: string;
  email?: string;
  telefone?: string;
  renda?: number;
  valorSolicitado?: number;
  finalidade?: string;
  bandeira?: string;
  modalidade?: string;
}

export interface CreditFormPJOptions {
  documento?: string;
  nome?: string;
  email?: string;
  telefone?: string;
  renda?: number;
  valorSolicitado?: number;
  finalidade?: string;
  bandeira?: string;
  modalidade?: string;
}

// Fill and submit the credit request form for Pessoa Física
Cypress.Commands.add('fillCreditFormPF', (opts: CreditFormPFOptions = {}) => {
  const {
    documento = '529.982.247-25',
    nome = 'João Silva Teste',
    email = 'joao.teste@email.com.br',
    telefone = '(11) 98765-4321',
    renda = 8000,
    valorSolicitado = 45000,
    finalidade = 'Expansão do negócio para crescimento',
    bandeira = 'bandeira-visa',
    modalidade = 'CREDITO_PESSOAL',
  } = opts;

  // Select PF (default, but explicit)
  cy.get('input[type="radio"][value="PF"]').check({ force: true });

  // Document (CPF)
  cy.get('input[placeholder="000.000.000-00"]').clear().type(documento);

  // Name
  cy.get('input[placeholder="Nome do cliente"]').clear().type(nome);

  // Email
  cy.get('input[placeholder="email@exemplo.com"]').clear().type(email);

  // Telefone
  cy.get('input[placeholder="(11) 99999-9999"]').clear().type(telefone);

  // Renda
  cy.get('input[placeholder="5000"]').clear().type(String(renda));

  // Valor Solicitado
  cy.get('input[placeholder="50000"]').clear().type(String(valorSolicitado));

  // Bandeira
  cy.get('select#bandeira').select(bandeira);

  // Modalidade
  cy.get('select#modalidade').select(modalidade);

  // Finalidade
  cy.get('input[placeholder="Ex: Expansão do negócio, capital de giro..."]')
    .clear()
    .type(finalidade);
});

// Fill and submit the credit request form for Pessoa Jurídica
Cypress.Commands.add('fillCreditFormPJ', (opts: CreditFormPJOptions = {}) => {
  const {
    documento = '11.222.333/0001-81',
    nome = 'Empresa Teste Ltda.',
    email = 'financeiro@empresateste.com.br',
    telefone = '(11) 3456-7890',
    renda = 150000,
    valorSolicitado = 80000,
    finalidade = 'Capital de giro para operações sazonais',
    bandeira = 'bandeira-master',
    modalidade = 'CAPITAL_GIRO',
  } = opts;

  // Switch to PJ
  cy.get('input[type="radio"][value="PJ"]').check({ force: true });

  // Document (CNPJ) — wait for field to reset after tipo switch
  cy.get('input[placeholder="00.000.000/0001-00"]').should('be.visible').clear().type(documento);

  // Name (Razão Social)
  cy.get('input[placeholder="Razão social da empresa"]').clear().type(nome);

  // Email
  cy.get('input[placeholder="email@exemplo.com"]').clear().type(email);

  // Telefone
  cy.get('input[placeholder="(11) 99999-9999"]').clear().type(telefone);

  // Renda
  cy.get('input[placeholder="5000"]').clear().type(String(renda));

  // Valor Solicitado
  cy.get('input[placeholder="50000"]').clear().type(String(valorSolicitado));

  // Bandeira
  cy.get('select#bandeira').select(bandeira);

  // Modalidade
  cy.get('select#modalidade').select(modalidade);

  // Finalidade
  cy.get('input[placeholder="Ex: Expansão do negócio, capital de giro..."]')
    .clear()
    .type(finalidade);
});

// Navigate to a route and wait for it to be ready
Cypress.Commands.add('navigateTo', (route: string) => {
  cy.visit(route);
  cy.get('body').should('be.visible');
});

// Wait for the credit context to finish loading
Cypress.Commands.add('waitForLoad', () => {
  // The loading state renders skeleton cards; wait until they're gone
  cy.get('.animate-pulse', { timeout: 15000 }).should('not.exist');
});

// ── Type augmentation ──────────────────────────────────────────────────────
declare global {
  namespace Cypress {
    interface Chainable {
      fillCreditFormPF(opts?: CreditFormPFOptions): Chainable<void>;
      fillCreditFormPJ(opts?: CreditFormPJOptions): Chainable<void>;
      navigateTo(route: string): Chainable<void>;
      waitForLoad(): Chainable<void>;
    }
  }
}

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
