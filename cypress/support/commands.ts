// Custom Cypress Commands for Investí App

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.get('input[placeholder*="email"]').type(email);
  cy.get('input[placeholder*="password"]').type(password);
  cy.get('button:contains("Iniciar sesión")').click();
  cy.url().should('include', '/home');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="menu-button"]').click();
  cy.get('button:contains("Cerrar sesión")').click();
  cy.url().should('include', '/login');
});

// Navigate to screen
Cypress.Commands.add('navigateTo', (screenName: string) => {
  cy.get(`[data-testid="nav-${screenName}"]`).click();
  cy.url().should('include', screenName.toLowerCase());
});

// Wait for loading
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should('not.exist');
});

// Check notification badge
Cypress.Commands.add('checkNotificationBadge', (count: number) => {
  cy.get('[data-testid="notification-badge"]').should('contain', count);
});

// Check message badge
Cypress.Commands.add('checkMessageBadge', (count: number) => {
  cy.get('[data-testid="message-badge"]').should('contain', count);
});

// Create post
Cypress.Commands.add('createPost', (content: string) => {
  cy.get('[data-testid="new-post-input"]').click();
  cy.get('textarea[placeholder*="¿Qué"]').type(content);
  cy.get('button:contains("Publicar")').click();
  cy.waitForLoading();
});

// Like post
Cypress.Commands.add('likePost', (postIndex: number = 0) => {
  cy.get('[data-testid="like-button"]').eq(postIndex).click();
});

// Comment on post
Cypress.Commands.add('commentOnPost', (postIndex: number, comment: string) => {
  cy.get('[data-testid="comment-button"]').eq(postIndex).click();
  cy.get('textarea[placeholder*="comentario"]').type(comment);
  cy.get('button:contains("Enviar")').click();
});

// Send message
Cypress.Commands.add('sendMessage', (recipientName: string, message: string) => {
  cy.get('[data-testid="new-chat-button"]').click();
  cy.get('input[placeholder*="Buscar"]').type(recipientName);
  cy.get('[data-testid="user-item"]').first().click();
  cy.get('input[placeholder*="Escribe"]').type(message);
  cy.get('[data-testid="send-message-button"]').click();
});

// Search users
Cypress.Commands.add('searchUsers', (query: string) => {
  cy.get('[data-testid="search-input"]').type(query);
  cy.get('[data-testid="search-results"]').should('be.visible');
});

// Follow user
Cypress.Commands.add('followUser', (userName: string) => {
  cy.searchUsers(userName);
  cy.get('[data-testid="user-item"]').first().click();
  cy.get('button:contains("Seguir")').click();
});

// Check IRI voice response
Cypress.Commands.add('checkIRIVoiceResponse', () => {
  cy.get('[data-testid="iri-message"]').should('be.visible');
  cy.get('[data-testid="voice-playing"]').should('exist');
});

// Change voice gender
Cypress.Commands.add('changeVoiceGender', (gender: 'M' | 'F') => {
  cy.get('[data-testid="voice-gender-button"]').click();
  cy.get(`button:contains("${gender}")}`).click();
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      navigateTo(screenName: string): Chainable<void>;
      waitForLoading(): Chainable<void>;
      checkNotificationBadge(count: number): Chainable<void>;
      checkMessageBadge(count: number): Chainable<void>;
      createPost(content: string): Chainable<void>;
      likePost(postIndex?: number): Chainable<void>;
      commentOnPost(postIndex: number, comment: string): Chainable<void>;
      sendMessage(recipientName: string, message: string): Chainable<void>;
      searchUsers(query: string): Chainable<void>;
      followUser(userName: string): Chainable<void>;
      checkIRIVoiceResponse(): Chainable<void>;
      changeVoiceGender(gender: 'M' | 'F'): Chainable<void>;
    }
  }
}
