describe('Authentication Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login Flow', () => {
    it('Should display login form', () => {
      cy.get('input[placeholder*="email"]').should('be.visible');
      cy.get('input[placeholder*="password"]').should('be.visible');
      cy.get('button:contains("Iniciar sesión")').should('be.visible');
    });

    it('Should show validation errors for empty fields', () => {
      cy.get('button:contains("Iniciar sesión")').click();
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('Should show error for invalid email', () => {
      cy.get('input[placeholder*="email"]').type('invalid-email');
      cy.get('input[placeholder*="password"]').type('password123');
      cy.get('button:contains("Iniciar sesión")').click();
      cy.get('[data-testid="error-message"]').should('contain', 'email');
    });

    it('Should successfully login with valid credentials', () => {
      cy.get('input[placeholder*="email"]').type(Cypress.env('TEST_EMAIL') || 'test@example.com');
      cy.get('input[placeholder*="password"]').type(Cypress.env('TEST_PASSWORD') || 'password123');
      cy.get('button:contains("Iniciar sesión")').click();
      cy.url().should('include', '/home');
      cy.get('[data-testid="home-feed"]').should('be.visible');
    });

    it('Should show error for invalid credentials', () => {
      cy.get('input[placeholder*="email"]').type('test@example.com');
      cy.get('input[placeholder*="password"]').type('wrongpassword');
      cy.get('button:contains("Iniciar sesión")').click();
      cy.get('[data-testid="error-message"]').should('be.visible');
    });
  });

  describe('Signup Flow', () => {
    it('Should navigate to signup page', () => {
      cy.get('a:contains("Crear cuenta")').click();
      cy.url().should('include', '/signup');
    });

    it('Should display signup form fields', () => {
      cy.get('a:contains("Crear cuenta")').click();
      cy.get('input[placeholder*="nombre"]').should('be.visible');
      cy.get('input[placeholder*="email"]').should('be.visible');
      cy.get('input[placeholder*="password"]').should('be.visible');
      cy.get('input[placeholder*="confirmar"]').should('be.visible');
    });

    it('Should show validation error for password mismatch', () => {
      cy.get('a:contains("Crear cuenta")').click();
      cy.get('input[placeholder*="nombre"]').type('Test User');
      cy.get('input[placeholder*="email"]').type('newuser@example.com');
      cy.get('input[placeholder*="password"]').type('password123');
      cy.get('input[placeholder*="confirmar"]').type('password456');
      cy.get('button:contains("Crear cuenta")').click();
      cy.get('[data-testid="error-message"]').should('contain', 'contraseña');
    });
  });

  describe('Logout Flow', () => {
    it('Should logout successfully', () => {
      cy.login(Cypress.env('TEST_EMAIL') || 'test@example.com', Cypress.env('TEST_PASSWORD') || 'password123');
      cy.get('[data-testid="menu-button"]').click();
      cy.get('button:contains("Cerrar sesión")').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Password Recovery', () => {
    it('Should display forgot password link', () => {
      cy.get('a:contains("¿Olvidaste tu contraseña?")').should('be.visible');
    });

    it('Should navigate to password recovery page', () => {
      cy.get('a:contains("¿Olvidaste tu contraseña?")').click();
      cy.url().should('include', '/forgot-password');
    });

    it('Should send recovery email', () => {
      cy.get('a:contains("¿Olvidaste tu contraseña?")').click();
      cy.get('input[placeholder*="email"]').type('test@example.com');
      cy.get('button:contains("Enviar")').click();
      cy.get('[data-testid="success-message"]').should('be.visible');
    });
  });
});
