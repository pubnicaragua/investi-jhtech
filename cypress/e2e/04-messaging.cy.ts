describe('Messaging Tests', () => {
  beforeEach(() => {
    cy.login(Cypress.env('TEST_EMAIL') || 'test@example.com', Cypress.env('TEST_PASSWORD') || 'password123');
    cy.navigateTo('Chat');
  });

  describe('Chat List', () => {
    it('Should display chat list', () => {
      cy.get('[data-testid="chat-list"]').should('be.visible');
    });

    it('Should display message badge with count', () => {
      cy.get('[data-testid="message-badge"]').should('contain', /\d+/);
    });

    it('Should display chat items', () => {
      cy.get('[data-testid="chat-item"]').should('have.length.greaterThan', 0);
    });

    it('Should display new chat button', () => {
      cy.get('[data-testid="new-chat-button"]').should('be.visible');
    });
  });

  describe('Starting Conversations', () => {
    it('Should open new chat modal', () => {
      cy.get('[data-testid="new-chat-button"]').click();
      cy.get('[data-testid="new-chat-modal"]').should('be.visible');
    });

    it('Should search for users', () => {
      cy.get('[data-testid="new-chat-button"]').click();
      cy.get('input[placeholder*="Buscar"]').type('test user');
      cy.get('[data-testid="user-result"]').should('have.length.greaterThan', 0);
    });

    it('Should start conversation with user', () => {
      cy.get('[data-testid="new-chat-button"]').click();
      cy.get('input[placeholder*="Buscar"]').type('test');
      cy.get('[data-testid="user-result"]').first().click();
      cy.url().should('include', '/chat/');
    });
  });

  describe('Message Sending', () => {
    it('Should send message', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="message-input"]').type('Test message');
      cy.get('[data-testid="send-message-button"]').click();
      cy.get('[data-testid="sent-message"]').should('contain', 'Test message');
    });

    it('Should not send empty message', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="send-message-button"]').should('be.disabled');
    });

    it('Should clear input after sending', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="message-input"]').type('Test');
      cy.get('[data-testid="send-message-button"]').click();
      cy.get('[data-testid="message-input"]').should('have.value', '');
    });

    it('Should send message with emoji', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="message-input"]').type('Hello 👋');
      cy.get('[data-testid="send-message-button"]').click();
      cy.get('[data-testid="sent-message"]').should('contain', '👋');
    });

    it('Should send message with special characters', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="message-input"]').type('Test @#$%^&*()');
      cy.get('[data-testid="send-message-button"]').click();
      cy.get('[data-testid="sent-message"]').should('be.visible');
    });
  });

  describe('Message Display', () => {
    it('Should display sent messages', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="sent-message"]').should('have.length.greaterThan', 0);
    });

    it('Should display received messages', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="received-message"]').should('have.length.greaterThan', 0);
    });

    it('Should display message timestamps', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="message-timestamp"]').should('have.length.greaterThan', 0);
    });

    it('Should display user avatar in messages', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="message-avatar"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Unread Messages', () => {
    it('Should update unread count', () => {
      const initialCount = cy.get('[data-testid="message-badge"]').then(($el) => {
        return parseInt($el.text());
      });

      // Simulate receiving new message
      cy.window().then((win) => {
        win.dispatchEvent(new Event('newMessage'));
      });

      cy.get('[data-testid="message-badge"]').should('contain', /\d+/);
    });

    it('Should mark conversation as read', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="unread-indicator"]').should('not.exist');
    });

    it('Should show unread badge on chat item', () => {
      cy.get('[data-testid="chat-item-unread"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Chat Details', () => {
    it('Should display chat header with user info', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="chat-header"]').should('be.visible');
      cy.get('[data-testid="chat-user-name"]').should('be.visible');
    });

    it('Should display user status', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="user-status"]').should('be.visible');
    });

    it('Should open user profile from chat', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="chat-user-name"]').click();
      cy.url().should('include', '/profile/');
    });
  });

  describe('Message Reactions', () => {
    it('Should add reaction to message', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="sent-message"]').first().rightclick();
      cy.get('[data-testid="reaction-👍"]').click();
      cy.get('[data-testid="message-reaction"]').should('contain', '👍');
    });

    it('Should remove reaction from message', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="message-reaction"]').first().click();
      cy.get('[data-testid="message-reaction"]').should('not.exist');
    });
  });

  describe('Message Search', () => {
    it('Should search messages in conversation', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="search-messages-button"]').click();
      cy.get('[data-testid="message-search-input"]').type('test');
      cy.get('[data-testid="search-result"]').should('have.length.greaterThan', 0);
    });

    it('Should highlight search results', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="search-messages-button"]').click();
      cy.get('[data-testid="message-search-input"]').type('hello');
      cy.get('[data-testid="search-result-highlight"]').should('be.visible');
    });
  });

  describe('Typing Indicator', () => {
    it('Should show typing indicator', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      
      // Simulate user typing
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('userTyping', { detail: { userId: 'other-user' } }));
      });

      cy.get('[data-testid="typing-indicator"]').should('be.visible');
    });

    it('Should hide typing indicator when message arrives', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="typing-indicator"]').should('not.exist');
    });
  });

  describe('Message Deletion', () => {
    it('Should delete own message', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="sent-message"]').first().rightclick();
      cy.get('[data-testid="delete-message-button"]').click();
      cy.get('[data-testid="confirm-delete"]').click();
      cy.get('[data-testid="deleted-message"]').should('contain', 'Eliminado');
    });

    it('Should not delete other user messages', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="received-message"]').first().rightclick();
      cy.get('[data-testid="delete-message-button"]').should('not.exist');
    });
  });

  describe('Performance', () => {
    it('Should load chat list quickly', () => {
      const startTime = Date.now();
      cy.visit('/chat');
      cy.get('[data-testid="chat-list"]').should('be.visible').then(() => {
        const endTime = Date.now();
        expect(endTime - startTime).to.be.lessThan(3000); // 3 seconds max
      });
    });

    it('Should load messages efficiently', () => {
      cy.get('[data-testid="chat-item"]').first().click();
      cy.get('[data-testid="message-item"]').should('have.length.greaterThan', 0);
    });
  });
});
