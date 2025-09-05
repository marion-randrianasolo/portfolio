describe('Home page', () => {
  it('should display the heading', () => {
    cy.visit('/');
    cy.contains('Mes projets');
  });
});