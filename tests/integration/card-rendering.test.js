'use strict';

function createCardElement(card) {
  const div = document.createElement('div');
  div.className = 'card';
  div.setAttribute('data-name', card.name || '');
  div.setAttribute('data-role', card.role || '');
  
  div.innerHTML = `
    <img src="${card.image || 'images/user.png'}" alt="${card.name || 'User'}'s profile photo" class="card-img">
    <h2>${card.name || 'Unknown'}</h2>
    <span class="role">${card.role || 'Contributor'}</span>
    <p>"${card.message || 'Hello!'}"</p>
    <a href="${card.github || '#'}" class="card-btn" target="_blank">GitHub</a>
  `;
  
  return div;
}

function renderCards(container, cards) {
  container.innerHTML = '';
  cards.forEach((card, index) => {
    const element = createCardElement(card);
    element.style.setProperty('--card-index', index);
    container.appendChild(element);
  });
}

describe('Card Rendering Integration', () => {
  let container;
  
  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'card-container';
    document.body.appendChild(container);
  });
  
  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('createCardElement', () => {
    test('creates a div with card class', () => {
      const card = createCardElement({ name: 'Test User' });
      expect(card.className).toBe('card');
    });

    test('includes profile image with alt text', () => {
      const card = createCardElement({ name: 'John Doe', image: 'images/john.jpg' });
      const img = card.querySelector('img');
      expect(img).not.toBeNull();
      expect(img.alt).toBe("John Doe's profile photo");
    });

    test('displays name in h2 element', () => {
      const card = createCardElement({ name: 'Jane Doe' });
      const h2 = card.querySelector('h2');
      expect(h2.textContent).toBe('Jane Doe');
    });

    test('displays role in span element', () => {
      const card = createCardElement({ name: 'Test', role: 'Developer' });
      const roleSpan = card.querySelector('.role');
      expect(roleSpan.textContent).toBe('Developer');
    });

    test('displays message in p element', () => {
      const card = createCardElement({ name: 'Test', message: 'Hello world!' });
      const p = card.querySelector('p');
      expect(p.textContent).toBe('"Hello world!"');
    });

    test('includes GitHub link', () => {
      const card = createCardElement({ name: 'Test', github: 'https://github.com/test' });
      const link = card.querySelector('a.card-btn');
      expect(link.href).toBe('https://github.com/test');
      expect(link.target).toBe('_blank');
    });

    test('sets data attributes for filtering', () => {
      const card = createCardElement({ name: 'Alice', role: 'Developer' });
      expect(card.getAttribute('data-name')).toBe('Alice');
      expect(card.getAttribute('data-role')).toBe('Developer');
    });

    test('uses default values for missing properties', () => {
      const card = createCardElement({});
      expect(card.querySelector('h2').textContent).toBe('Unknown');
      expect(card.querySelector('.role').textContent).toBe('Contributor');
    });
  });

  describe('renderCards', () => {
    test('renders multiple cards to container', () => {
      const cards = [
        { name: 'Alice', role: 'Developer' },
        { name: 'Bob', role: 'Contributor' }
      ];
      renderCards(container, cards);
      expect(container.children).toHaveLength(2);
    });

    test('clears existing content before rendering', () => {
      container.innerHTML = '<div class="old-content"></div>';
      renderCards(container, [{ name: 'New' }]);
      expect(container.querySelector('.old-content')).toBeNull();
      expect(container.querySelector('.card')).not.toBeNull();
    });

    test('sets card index CSS variable', () => {
      const cards = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
      renderCards(container, cards);
      expect(container.children[2].style.getPropertyValue('--card-index')).toBe('2');
    });
  });
});
