describe('Basic Cypress Test', () => {
  it('should pass a simple test', () => {
    cy.log('✅ Basic Cypress test executed');
    expect(true).to.be.true;
  });
});
