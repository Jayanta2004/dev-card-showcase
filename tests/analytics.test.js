/**
 * Tests for utility functions from js/analytics.js
 *
 * The functions tested here are extracted from analytics.js and adapted
 * for a Node/Jest environment. DOM-dependent logic is tested using jsdom.
 */

'use strict';

// ---------------------------------------------------------------------------
// Inline implementations of the pure/testable functions from analytics.js
// ---------------------------------------------------------------------------

/**
 * buildContributorGrowth – groups commits by calendar day and returns sorted
 * label/data arrays.
 */
function buildContributorGrowth(commits) {
  const map = {};
  commits.forEach(c => {
    let dateStr =
      c.date ||
      (c.commit && c.commit.author && c.commit.author.date) ||
      (c.commit && c.commit.committer && c.commit.committer.date);
    if (dateStr) {
      const day = new Date(dateStr).toISOString().split('T')[0];
      map[day] = (map[day] || 0) + 1;
    }
  });
  const sortedDates = Object.keys(map).sort();
  const labels = sortedDates;
  const data = labels.map(d => map[d]);
  return { labels, data };
}

/**
 * buildLanguageData – converts a language-bytes object into chart-ready
 * labels and percentage values.
 */
function buildLanguageData(languages) {
  const labels = Object.keys(languages);
  const values = Object.values(languages);
  const total = values.reduce((a, b) => a + b, 0);
  return {
    labels,
    datasets: [
      {
        data: values.map(v => Math.round((v / total) * 100)),
        backgroundColor: ['#667eea', '#764ba2', '#4facfe', '#00cdac', '#f093fb'],
      },
    ],
  };
}

/**
 * getCache / setCache – localStorage-backed caching helpers.
 */
function getCache(key, maxAge = 5 * 60 * 1000) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  const { data, time } = JSON.parse(cached);
  if (Date.now() - time > maxAge) return null;
  return data;
}

function setCache(key, data) {
  try {
    if (key === 'commits' && Array.isArray(data)) {
      const summary = data.map(c => ({
        date: c.date || (c.commit && c.commit.author && c.commit.author.date),
      }));
      localStorage.setItem(key, JSON.stringify({ data: summary, time: Date.now() }));
    } else {
      localStorage.setItem(key, JSON.stringify({ data, time: Date.now() }));
    }
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn('Cache quota exceeded for', key, '- skipping cache.');
    } else {
      throw e;
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildContributorGrowth', () => {
  test('returns empty arrays when no commits are provided', () => {
    const result = buildContributorGrowth([]);
    expect(result.labels).toEqual([]);
    expect(result.data).toEqual([]);
  });

  test('groups commits on the same day into a single entry', () => {
    const commits = [
      { date: '2024-03-15T10:00:00Z' },
      { date: '2024-03-15T18:30:00Z' },
      { date: '2024-03-16T09:00:00Z' },
    ];
    const result = buildContributorGrowth(commits);
    expect(result.labels).toEqual(['2024-03-15', '2024-03-16']);
    expect(result.data).toEqual([2, 1]);
  });

  test('reads date from nested commit.author.date field', () => {
    const commits = [
      { commit: { author: { date: '2024-04-01T00:00:00Z' } } },
    ];
    const result = buildContributorGrowth(commits);
    expect(result.labels).toEqual(['2024-04-01']);
    expect(result.data).toEqual([1]);
  });

  test('returns labels sorted chronologically', () => {
    const commits = [
      { date: '2024-05-20T00:00:00Z' },
      { date: '2024-05-18T00:00:00Z' },
      { date: '2024-05-19T00:00:00Z' },
    ];
    const result = buildContributorGrowth(commits);
    expect(result.labels).toEqual(['2024-05-18', '2024-05-19', '2024-05-20']);
  });

  test('ignores commits that have no date information', () => {
    const commits = [{ sha: 'abc123' }, { date: '2024-06-01T00:00:00Z' }];
    const result = buildContributorGrowth(commits);
    expect(result.labels).toEqual(['2024-06-01']);
    expect(result.data).toEqual([1]);
  });
});

describe('buildLanguageData', () => {
  test('converts language bytes to percentage values', () => {
    const languages = { JavaScript: 800, CSS: 200 };
    const result = buildLanguageData(languages);
    expect(result.labels).toEqual(['JavaScript', 'CSS']);
    expect(result.datasets[0].data).toEqual([80, 20]);
  });

  test('percentages sum to 100 for two equal languages', () => {
    const languages = { HTML: 500, JavaScript: 500 };
    const result = buildLanguageData(languages);
    const total = result.datasets[0].data.reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  test('returns empty arrays for an empty language object', () => {
    const result = buildLanguageData({});
    expect(result.labels).toEqual([]);
    expect(result.datasets[0].data).toEqual([]);
  });

  test('handles a single language (100 percent)', () => {
    const languages = { TypeScript: 1000 };
    const result = buildLanguageData(languages);
    expect(result.datasets[0].data).toEqual([100]);
  });
});

describe('getCache and setCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('getCache returns null when key is not in localStorage', () => {
    expect(getCache('nonexistent')).toBeNull();
  });

  test('setCache stores data and getCache retrieves it', () => {
    const payload = { total: 42, active: true };
    setCache('repoInfo', payload);
    const result = getCache('repoInfo');
    expect(result).toEqual(payload);
  });

  test('getCache returns null when the cached entry has expired', () => {
    const payload = { count: 10 };
    // Store with a timestamp 10 minutes in the past
    const expiredTime = Date.now() - 10 * 60 * 1000;
    localStorage.setItem('oldKey', JSON.stringify({ data: payload, time: expiredTime }));
    expect(getCache('oldKey', 5 * 60 * 1000)).toBeNull();
  });

  test('setCache stores only date summaries for commits key', () => {
    const commits = [
      { date: '2024-01-01T00:00:00Z', sha: 'abc', message: 'init' },
      { commit: { author: { date: '2024-01-02T00:00:00Z' } }, sha: 'def' },
    ];
    setCache('commits', commits);
    const raw = JSON.parse(localStorage.getItem('commits'));
    // Should only contain date fields, not sha or message
    expect(raw.data[0]).toHaveProperty('date');
    expect(raw.data[0]).not.toHaveProperty('sha');
    expect(raw.data[0]).not.toHaveProperty('message');
  });
});
