// ***********************************************************
// This file is processed and loaded automatically before
// your test files. This is a great place to put global
// configuration and behavior that modifies Cypress.
// ***********************************************************
import './commands';

// Clear all localStorage before each test to ensure isolation.
// The repositories auto-seed from mock data when storage is empty.
beforeEach(() => {
  cy.clearLocalStorage();
});
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')
// ***********************************************************
// Support file carregado antes de cada spec E2E
// ***********************************************************
import './commands';

// Ignora erros de hidratação do React no Next.js (não são erros de app)
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('Hydration') ||
    err.message.includes('hydrating') ||
    err.message.includes('Minified React error')
  ) {
    return false;
  }
  return true;
});

// Garante viewport consistente
beforeEach(() => {
  cy.viewport(1440, 900);
});
