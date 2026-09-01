describe('Home Page', () => {
  it('successfully loads the home page', () => {
    // Visit the home page
    cy.visit('/');
    
    // Check if the body exists
    cy.get('body').should('exist');
    
    // Add more specific assertions based on your home page content
    // e.g., cy.contains('h1', 'Welcome');
  });
});
