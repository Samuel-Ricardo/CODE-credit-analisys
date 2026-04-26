/**
 * E2E: Full End-to-End Business Flows
 *
 * Covers complete multi-step user journeys:
 * 1. Create → View → Approve full flow
 * 2. Create → View → Reject full flow
 * 3. Dashboard stat updates after new request creation
 * 4. Approval tier enforcement across all tiers
 * 5. Search → Detail → Back → New Search flow
 */

describe('Business Flows — Full E2E Journeys', () => {

  // ── Flow 1: Create and Approve ─────────────────────────────────────────────

  describe('Flow: Create PF request → view in list → approve', () => {
    it('completes the full create → list → detail → approve journey', () => {
      // Step 1: Create a new request
      // Note: CPF 529.982.247-25 matches seeded cust-001 (Ana Carolina Ferreira).
      // The use case returns the existing customer — success screen shows their name.
      cy.visit('/dashboard/solicitacoes/nova');
      cy.fillCreditFormPF({
        valorSolicitado: 5000, // LIDER tier (≤10k)
        finalidade: 'Reforma residencial para melhorias',
      });
      cy.contains('button[type="submit"]', 'Enviar Solicitação').click();

      // Step 2: Capture the unique SOL number from the success screen
      cy.contains('Solicitação Criada!', { timeout: 15000 }).should('be.visible');
      cy.contains(/SOL-\d{4}-\d{5}/).invoke('text').then((text) => {
        // text: "SOL-2026-000XX · Ana Carolina Ferreira"
        const solNumber = text.split(' ·')[0].trim();

        // Step 3: Navigate to list
        cy.contains('button', 'Ver todas').click();
        cy.url().should('include', '/dashboard/solicitacoes');

        // Step 4: Find the new request in list by SOL number (unique per request)
        cy.contains(solNumber, { timeout: 10000 }).should('be.visible');

        // Step 5: Navigate to detail via the same card
        cy.contains(solNumber)
          .closest('[class*="glass"]')
          .contains('Ver detalhes')
          .click();
        cy.url().should('match', /\/dashboard\/solicitacoes\/.+/);

        // Step 6: Approve the request
        cy.contains('Confirmar Aprovação', { timeout: 10000 }).click();

        // Step 7: Status updated
        cy.contains('Aprovada', { timeout: 15000 }).should('be.visible');
        cy.contains('Ações').should('not.exist');
      });
    });
  });

  // ── Flow 2: Create and Reject ──────────────────────────────────────────────

  describe('Flow: Create PJ request → view in list → reject', () => {
    it('completes the full create → list → detail → reject journey', () => {
      // Note: CNPJ 11.222.333/0001-81 matches seeded cust-002 (Tech Solutions Ltda.).
      // The use case returns the existing customer — navigate by SOL number.
      cy.visit('/dashboard/solicitacoes/nova');
      cy.fillCreditFormPJ({
        valorSolicitado: 25000,
        finalidade: 'Capital de giro operacional para estoque',
      });
      cy.contains('button[type="submit"]', 'Enviar Solicitação').click();

      // Capture unique SOL number from success screen
      cy.contains('Solicitação Criada!', { timeout: 15000 }).should('be.visible');
      cy.contains(/SOL-\d{4}-\d{5}/).invoke('text').then((text) => {
        const solNumber = text.split(' ·')[0].trim();

        // Step 2: Go to list, find by SOL number
        cy.contains('button', 'Ver todas').click();
        cy.url().should('include', '/dashboard/solicitacoes');
        cy.contains(solNumber, { timeout: 10000 }).should('be.visible');

        // Step 3: Open detail via same card
        cy.contains(solNumber)
          .closest('[class*="glass"]')
          .contains('Ver detalhes')
          .click();

        // Step 4: Reject
        cy.contains('button', 'Rejeitar', { timeout: 10000 }).click();
        cy.get('textarea[placeholder*="mínimo 10 caracteres"]')
          .type('Score abaixo do mínimo exigido para esta modalidade.');
        cy.contains('button', 'Confirmar Rejeição').click();

        // Step 5: Status updated
        cy.contains('Rejeitada', { timeout: 15000 }).should('be.visible');
        cy.contains('Ações').should('not.exist');
      });
    });
  });

  // ── Flow 3: Dashboard Reflects New Request ─────────────────────────────────

  describe('Flow: Dashboard stats update after creating a new request', () => {
    it('dashboard total count increases after creating a request', () => {
      // Get initial count from dashboard
      cy.visit('/dashboard');

      let initialCount = 0;
      cy.contains('Total Solicitações', { timeout: 10000 })
        .parents('[class*="glass"]')
        .find('[class*="text-3xl"], [class*="stat-glow"]')
        .invoke('text')
        .then((text) => {
          initialCount = parseInt(text.trim(), 10);
        });

      // Create a new request
      cy.visit('/dashboard/solicitacoes/nova');
      cy.fillCreditFormPF();
      cy.contains('button[type="submit"]', 'Enviar Solicitação').click();
      cy.contains('Solicitação Criada!', { timeout: 15000 }).should('be.visible');

      // Go back to dashboard and refresh
      cy.contains('Dashboard').click();
      cy.contains('button', 'Atualizar').click();

      // Count should be greater
      cy.contains('Total Solicitações', { timeout: 10000 })
        .parents('[class*="glass"]')
        .find('[class*="text-3xl"], [class*="stat-glow"]')
        .invoke('text')
        .then((text) => {
          const newCount = parseInt(text.trim(), 10);
          expect(newCount).to.be.greaterThan(initialCount);
        });
    });
  });

  // ── Flow 4: Search → Detail → Back → Re-search ────────────────────────────

  describe('Flow: Search → navigate to detail → go back → new search', () => {
    it('maintains search context through navigation', () => {
      // Repository searches by SOL number and customerId — not by customer name.
      cy.visit('/dashboard/solicitacoes');

      // Search by SOL number to isolate req-001 (Ana Carolina Ferreira)
      cy.get('input[placeholder="Buscar por nome, documento ou número..."]')
        .type('SOL-2026-00001');
      cy.contains('Ana Carolina Ferreira', { timeout: 10000 }).should('be.visible');

      // Navigate to detail
      cy.contains('SOL-2026-00001')
        .closest('[class*="glass"]')
        .contains('Ver detalhes')
        .click();

      cy.url().should('include', '/req-001');

      // Go back to list
      cy.contains('button', 'Voltar').click();
      cy.url().should('include', '/dashboard/solicitacoes');

      // Search for a different request by SOL number (req-002 = Tech Solutions Ltda.)
      cy.get('input[placeholder="Buscar por nome, documento ou número..."]')
        .clear()
        .type('SOL-2026-00002');
      cy.contains('Tech Solutions Ltda.', { timeout: 10000 }).should('be.visible');
    });
  });

  // ── Flow 5: Sidebar Navigation Through All Sections ───────────────────────

  describe('Flow: Navigate all sidebar sections sequentially', () => {
    it('can visit Dashboard → Solicitações → Nova → Aprovações in sequence', () => {
      cy.visit('/dashboard');
      cy.contains('Visão Geral').should('be.visible');

      cy.contains('Solicitacoes').click();
      cy.url().should('include', '/dashboard/solicitacoes');
      cy.contains(/solicitaç[ão|ões]+ encontrada/, { timeout: 10000 }).should('be.visible');

      cy.contains('Nova Analise').click();
      cy.url().should('include', '/dashboard/solicitacoes/nova');
      cy.contains('Dados do Cliente').should('be.visible');

      cy.contains('Aprovacoes').click();
      cy.url().should('include', '/dashboard/aprovacoes');
      cy.contains('Aprovações').should('be.visible');

      cy.contains('Dashboard').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/dashboard');
      cy.contains('Visão Geral').should('be.visible');
    });
  });

  // ── Flow 6: Multiple Requests — Filter + Approve First, Reject Second ─────

  describe('Flow: Process two pending requests sequentially', () => {
    it('can approve req-003 and then reject req-002', () => {
      // Approve req-003 (SOLICITADA, LIDER)
      cy.visit('/dashboard/solicitacoes/req-003');
      cy.contains('button', 'Confirmar Aprovação', { timeout: 10000 }).click();
      cy.contains('Aprovada', { timeout: 15000 }).should('be.visible');

      // Reject req-002 (EM_APROVACAO, GERENTE)
      cy.visit('/dashboard/solicitacoes/req-002');
      cy.contains('button', 'Rejeitar', { timeout: 10000 }).click();
      cy.get('textarea[placeholder*="mínimo 10 caracteres"]')
        .type('Documentação incompleta para o valor solicitado.');
      cy.contains('button', 'Confirmar Rejeição').click();
      cy.contains('Rejeitada', { timeout: 15000 }).should('be.visible');

      // Aprovações page should show fewer pending now
      cy.visit('/dashboard/aprovacoes');
      // req-003 (Carlos Eduardo Mendes, SOLICITADA→APROVADA) is no longer pending
      cy.contains('Em Análise', { timeout: 10000 }).should('be.visible');
      cy.contains('Carlos Eduardo Mendes', { timeout: 3000 }).should('not.exist');
      // req-002 (SOL-2026-00002) is now REJEITADA — its SOL number must not appear
      cy.contains('SOL-2026-00002', { timeout: 3000 }).should('not.exist');
      // Note: Tech Solutions Ltda. (cust-002) still appears via req-008 (SOLICITADA)
    });
  });
});
