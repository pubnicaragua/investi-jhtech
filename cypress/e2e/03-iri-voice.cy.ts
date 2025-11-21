describe('IRI Voice AI Tests', () => {
  beforeEach(() => {
    cy.login(Cypress.env('TEST_EMAIL') || 'test@example.com', Cypress.env('TEST_PASSWORD') || 'password123');
    cy.navigateTo('IRI');
  });

  describe('IRI Chat Screen', () => {
    it('Should display IRI chat interface', () => {
      cy.get('[data-testid="iri-chat-screen"]').should('be.visible');
      cy.get('[data-testid="iri-header"]').should('contain', 'Irï');
    });

    it('Should display welcome message', () => {
      cy.get('[data-testid="iri-message"]').should('contain', 'Hola');
    });

    it('Should display message input', () => {
      cy.get('[data-testid="iri-input"]').should('be.visible');
      cy.get('[data-testid="send-button"]').should('be.visible');
    });

    it('Should display voice controls', () => {
      cy.get('[data-testid="voice-gender-button"]').should('be.visible');
      cy.get('[data-testid="voice-gender-text"]').should('contain', /F|M/);
    });
  });

  describe('Voice Gender Selection', () => {
    it('Should display female voice option', () => {
      cy.get('[data-testid="voice-gender-button"]').should('contain', 'F');
    });

    it('Should change to male voice', () => {
      cy.get('[data-testid="voice-gender-button"]').click();
      cy.get('[data-testid="voice-gender-text"]').should('contain', 'M');
    });

    it('Should toggle between male and female voices', () => {
      cy.get('[data-testid="voice-gender-button"]').click();
      cy.get('[data-testid="voice-gender-text"]').should('contain', 'M');
      cy.get('[data-testid="voice-gender-button"]').click();
      cy.get('[data-testid="voice-gender-text"]').should('contain', 'F');
    });
  });

  describe('Message Sending', () => {
    it('Should send message to IRI', () => {
      cy.get('[data-testid="iri-input"]').type('¿Cuál es el mejor fondo de inversión?');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      cy.get('[data-testid="user-message"]').should('contain', '¿Cuál es el mejor fondo');
    });

    it('Should display IRI response', () => {
      cy.get('[data-testid="iri-input"]').type('Hola Irï');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      cy.get('[data-testid="iri-message"]').should('be.visible');
    });

    it('Should not send empty message', () => {
      cy.get('[data-testid="send-button"]').should('be.disabled');
    });

    it('Should clear input after sending', () => {
      cy.get('[data-testid="iri-input"]').type('Test message');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      cy.get('[data-testid="iri-input"]').should('have.value', '');
    });
  });

  describe('Voice Playback', () => {
    it('Should play voice response automatically', () => {
      cy.get('[data-testid="iri-input"]').type('¿Qué es un ETF?');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      cy.get('[data-testid="voice-playing"]').should('exist');
    });

    it('Should indicate voice is playing', () => {
      cy.get('[data-testid="iri-input"]').type('Cuéntame sobre acciones');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      cy.get('[data-testid="voice-indicator"]').should('have.class', 'playing');
    });

    it('Should use selected voice gender for playback', () => {
      // Change to male voice
      cy.get('[data-testid="voice-gender-button"]').click();
      
      // Send message
      cy.get('[data-testid="iri-input"]').type('Hola');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      
      // Verify voice is playing
      cy.get('[data-testid="voice-playing"]').should('exist');
    });
  });

  describe('Conversation History', () => {
    it('Should display conversation history', () => {
      cy.get('[data-testid="iri-input"]').type('Primer mensaje');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      
      cy.get('[data-testid="iri-input"]').type('Segundo mensaje');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      
      cy.get('[data-testid="user-message"]').should('have.length.greaterThan', 1);
    });

    it('Should maintain context between messages', () => {
      cy.get('[data-testid="iri-input"]').type('¿Qué es una acción?');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      
      cy.get('[data-testid="iri-input"]').type('¿Y un bono?');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      
      // Both messages should be visible
      cy.get('[data-testid="user-message"]').should('have.length.greaterThan', 1);
    });

    it('Should clear history', () => {
      cy.get('[data-testid="iri-input"]').type('Test message');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      
      cy.get('[data-testid="clear-history-button"]').click();
      cy.get('[data-testid="confirm-button"]').click();
      
      cy.get('[data-testid="user-message"]').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    it('Should handle API errors gracefully', () => {
      // Intercept and fail the API call
      cy.intercept('POST', '**/chat/completions', { statusCode: 500 }).as('apiError');
      
      cy.get('[data-testid="iri-input"]').type('Test message');
      cy.get('[data-testid="send-button"]').click();
      
      cy.wait('@apiError');
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('Should show error when API key is missing', () => {
      cy.intercept('POST', '**/chat/completions', { statusCode: 401 }).as('authError');
      
      cy.get('[data-testid="iri-input"]').type('Test');
      cy.get('[data-testid="send-button"]').click();
      
      cy.wait('@authError');
      cy.get('[data-testid="error-message"]').should('contain', 'API');
    });

    it('Should show error when voice service fails', () => {
      cy.intercept('POST', '**/text-to-speech/**', { statusCode: 500 }).as('voiceError');
      
      cy.get('[data-testid="iri-input"]').type('Test message');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      
      cy.get('[data-testid="error-message"]').should('contain', 'voz');
    });
  });

  describe('Performance', () => {
    it('Should respond within reasonable time', () => {
      const startTime = Date.now();
      
      cy.get('[data-testid="iri-input"]').type('Hola');
      cy.get('[data-testid="send-button"]').click();
      cy.waitForLoading();
      
      cy.get('[data-testid="iri-message"]').should('be.visible').then(() => {
        const endTime = Date.now();
        expect(endTime - startTime).to.be.lessThan(15000); // 15 seconds max
      });
    });

    it('Should handle rapid messages', () => {
      cy.get('[data-testid="iri-input"]').type('Mensaje 1');
      cy.get('[data-testid="send-button"]').click();
      
      cy.get('[data-testid="iri-input"]').type('Mensaje 2');
      cy.get('[data-testid="send-button"]').click();
      
      cy.get('[data-testid="user-message"]').should('have.length', 2);
    });
  });
});
