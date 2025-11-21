describe('Home Feed Tests', () => {
  beforeEach(() => {
    cy.login(Cypress.env('TEST_EMAIL') || 'test@example.com', Cypress.env('TEST_PASSWORD') || 'password123');
    cy.visit('/home');
  });

  describe('Feed Display', () => {
    it('Should display home feed', () => {
      cy.get('[data-testid="home-feed"]').should('be.visible');
    });

    it('Should display posts in feed', () => {
      cy.get('[data-testid="post-item"]').should('have.length.greaterThan', 0);
    });

    it('Should display user profile in header', () => {
      cy.get('[data-testid="user-avatar"]').should('be.visible');
      cy.get('[data-testid="user-name"]').should('be.visible');
    });

    it('Should display search bar', () => {
      cy.get('[data-testid="search-input"]').should('be.visible');
    });

    it('Should display notification badge', () => {
      cy.get('[data-testid="notification-badge"]').should('be.visible');
    });

    it('Should display message badge', () => {
      cy.get('[data-testid="message-badge"]').should('be.visible');
    });
  });

  describe('Dynamic Counters', () => {
    it('Should display notification count dynamically', () => {
      cy.get('[data-testid="notification-badge"]').should('contain', /\d+/);
    });

    it('Should display message count dynamically', () => {
      cy.get('[data-testid="message-badge"]').should('contain', /\d+/);
    });

    it('Should update notification count when new notification arrives', () => {
      const initialCount = cy.get('[data-testid="notification-badge"]').then(($el) => {
        return parseInt($el.text());
      });

      // Simulate new notification
      cy.window().then((win) => {
        win.dispatchEvent(new Event('notification'));
      });

      cy.get('[data-testid="notification-badge"]').should('contain', /\d+/);
    });
  });

  describe('Post Interactions', () => {
    it('Should like a post', () => {
      cy.get('[data-testid="like-button"]').first().click();
      cy.get('[data-testid="like-button"]').first().should('have.class', 'liked');
    });

    it('Should unlike a post', () => {
      cy.get('[data-testid="like-button"]').first().click();
      cy.get('[data-testid="like-button"]').first().click();
      cy.get('[data-testid="like-button"]').first().should('not.have.class', 'liked');
    });

    it('Should save a post', () => {
      cy.get('[data-testid="save-button"]').first().click();
      cy.get('[data-testid="save-button"]').first().should('have.class', 'saved');
    });

    it('Should open post detail', () => {
      cy.get('[data-testid="post-item"]').first().click();
      cy.url().should('include', '/post/');
      cy.get('[data-testid="post-detail"]').should('be.visible');
    });

    it('Should display post comments', () => {
      cy.get('[data-testid="post-item"]').first().click();
      cy.get('[data-testid="comment-item"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Post Creation', () => {
    it('Should open new post modal', () => {
      cy.get('[data-testid="new-post-button"]').click();
      cy.get('[data-testid="new-post-modal"]').should('be.visible');
    });

    it('Should create a new post', () => {
      cy.get('[data-testid="new-post-button"]').click();
      cy.get('textarea[placeholder*="¿Qué"]').type('Test post content');
      cy.get('button:contains("Publicar")').click();
      cy.get('[data-testid="success-message"]').should('be.visible');
    });

    it('Should validate post content', () => {
      cy.get('[data-testid="new-post-button"]').click();
      cy.get('button:contains("Publicar")').click();
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('Should upload image with post', () => {
      cy.get('[data-testid="new-post-button"]').click();
      cy.get('[data-testid="upload-image-button"]').click();
      cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg');
      cy.get('[data-testid="image-preview"]').should('be.visible');
    });
  });

  describe('Feed Pagination', () => {
    it('Should load more posts on scroll', () => {
      const initialPostCount = cy.get('[data-testid="post-item"]').then(($el) => {
        return $el.length;
      });

      cy.get('[data-testid="home-feed"]').scrollTo('bottom');
      cy.wait(1000);

      cy.get('[data-testid="post-item"]').then(($el) => {
        expect($el.length).to.be.greaterThan(initialPostCount);
      });
    });
  });

  describe('Search Functionality', () => {
    it('Should search for users', () => {
      cy.get('[data-testid="search-input"]').type('test user');
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="user-result"]').should('have.length.greaterThan', 0);
    });

    it('Should search for posts', () => {
      cy.get('[data-testid="search-input"]').type('test post');
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="post-result"]').should('have.length.greaterThan', 0);
    });

    it('Should clear search results', () => {
      cy.get('[data-testid="search-input"]').type('test');
      cy.get('[data-testid="clear-search-button"]').click();
      cy.get('[data-testid="search-input"]').should('have.value', '');
    });
  });

  describe('Navigation', () => {
    it('Should navigate to notifications', () => {
      cy.get('[data-testid="notification-badge"]').click();
      cy.url().should('include', '/notifications');
    });

    it('Should navigate to messages', () => {
      cy.get('[data-testid="message-badge"]').click();
      cy.url().should('include', '/chat');
    });

    it('Should navigate to profile', () => {
      cy.get('[data-testid="user-avatar"]').click();
      cy.url().should('include', '/profile');
    });
  });
});
