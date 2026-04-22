describe('Home Page', () => {
  it('successfully loads', () => {
    cy.visit('/')
    cy.contains('h1', 'Welcome to Credit Analysis')
  })

  it('has correct page title', () => {
    cy.visit('/')
    cy.title().should('exist')
  })
})
