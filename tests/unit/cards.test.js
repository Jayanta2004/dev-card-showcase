'use strict';

function filterCards(cards, query) {
  if (!query) return cards;
  const lowerQuery = query.toLowerCase();
  return cards.filter(card => {
    const name = (card.name || '').toLowerCase();
    const role = (card.role || '').toLowerCase();
    const message = (card.message || '').toLowerCase();
    return name.includes(lowerQuery) || role.includes(lowerQuery) || message.includes(lowerQuery);
  });
}

function filterByRole(cards, role) {
  if (role === 'all') return cards;
  return cards.filter(card => {
    const cardRole = (card.role || '').toLowerCase();
    return cardRole.includes(role.toLowerCase());
  });
}

function sortCards(cards, order) {
  const sorted = [...cards];
  switch (order) {
    case 'az':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'za':
      return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    case 'newest':
      return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    default:
      return sorted;
  }
}

const sampleCards = [
  { id: 1, name: 'Alice', role: 'Developer', message: 'Hello world!' },
  { id: 2, name: 'Bob', role: 'Contributor', message: 'My first PR!' },
  { id: 3, name: 'Charlie', role: 'Maintainer', message: 'Welcome everyone!' },
  { id: 4, name: 'David', role: 'Developer', message: 'Excited to contribute!' },
];

describe('Card Filtering', () => {
  describe('filterCards', () => {
    test('returns all cards when query is empty', () => {
      const result = filterCards(sampleCards, '');
      expect(result).toHaveLength(4);
    });

    test('filters by name (case-insensitive)', () => {
      const result = filterCards(sampleCards, 'alice');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice');
    });

    test('filters by role', () => {
      const result = filterCards(sampleCards, 'developer');
      expect(result).toHaveLength(2);
    });

    test('filters by message content', () => {
      const result = filterCards(sampleCards, 'first');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob');
    });

    test('returns empty array when no matches', () => {
      const result = filterCards(sampleCards, 'nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('filterByRole', () => {
    test('returns all cards when role is "all"', () => {
      const result = filterByRole(sampleCards, 'all');
      expect(result).toHaveLength(4);
    });

    test('filters by exact role match', () => {
      const result = filterByRole(sampleCards, 'maintainer');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Charlie');
    });

    test('returns multiple cards with same role', () => {
      const result = filterByRole(sampleCards, 'developer');
      expect(result).toHaveLength(2);
    });

    test('returns empty array for non-matching role', () => {
      const result = filterByRole(sampleCards, 'designer');
      expect(result).toHaveLength(0);
    });
  });
});

describe('Card Sorting', () => {
  describe('sortCards', () => {
    test('sorts cards A-Z by name', () => {
      const result = sortCards(sampleCards, 'az');
      expect(result[0].name).toBe('Alice');
      expect(result[3].name).toBe('David');
    });

    test('sorts cards Z-A by name', () => {
      const result = sortCards(sampleCards, 'za');
      expect(result[0].name).toBe('David');
      expect(result[3].name).toBe('Alice');
    });

    test('sorts cards by newest (highest id first)', () => {
      const result = sortCards(sampleCards, 'newest');
      expect(result[0].id).toBe(4);
      expect(result[3].id).toBe(1);
    });

    test('returns original order for default sort', () => {
      const result = sortCards(sampleCards, 'default');
      expect(result[0].id).toBe(1);
      expect(result[3].id).toBe(4);
    });

    test('does not mutate original array', () => {
      const original = [...sampleCards];
      sortCards(sampleCards, 'za');
      expect(sampleCards[0].id).toBe(original[0].id);
    });
  });
});
