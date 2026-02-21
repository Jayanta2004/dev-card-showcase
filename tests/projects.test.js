/**
 * Tests for utility functions from js/projects.js
 *
 * Pure/testable logic is extracted inline so tests can run in a Node/jsdom
 * environment without requiring a browser or a live server.
 */

'use strict';

// ---------------------------------------------------------------------------
// Inline implementations of the testable functions from projects.js
// ---------------------------------------------------------------------------

const projectsPerPage = 12;

/**
 * sortProjects – sorts an array of project objects by title.
 */
function sortProjects(projects, order) {
  return [...projects].sort((a, b) => {
    if (order === 'az') return a.title.localeCompare(b.title);
    return b.title.localeCompare(a.title);
  });
}

/**
 * createProjectCard – returns a DOM element representing a single project.
 * Mirrors the logic in projects.js so DOM output can be verified.
 */
function createProjectCard(project, index, currentPage = 1) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.style.setProperty('--project-index', index);

  const tagsHTML = (project.tags || [])
    .map(tag => `<span class="tag">${tag}</span>`)
    .join('');

  const authorName =
    project.author && project.author.name ? project.author.name : 'Unknown Contributor';

  card.innerHTML = `
    <h2>${project.title || 'Untitled Project'}</h2>
    <p class="project-desc">${project.description || 'No description provided.'}</p>
    <div class="project-tags">${tagsHTML}</div>
    <div class="project-footer">
      <span>By ${authorName}</span>
      <div class="project-links">
        ${project.links && project.links.github ? `<a href="${project.links.github}" target="_blank"><i class="fab fa-github"></i></a>` : ''}
        ${project.links && project.links.live ? `<a href="${project.links.live}" target="_blank"><i class="fas fa-external-link-alt"></i></a>` : ''}
      </div>
    </div>`;

  return card;
}

/**
 * runFilter – filters a list of projects by search query and tech tag.
 */
function runFilter(allProjectsData, query, tech, contributorValue = '') {
  return allProjectsData.filter(project => {
    const title = (project.title || '').toLowerCase();
    const description = (project.description || '').toLowerCase();
    const tags = (project.tags || []).join(' ').toLowerCase();
    const author =
      project.author && project.author.name ? project.author.name.toLowerCase() : '';

    const matchesSearch =
      title.includes(query) ||
      description.includes(query) ||
      tags.includes(query) ||
      author.includes(query);

    const matchesTech = tech === 'all' || tags.includes(tech.toLowerCase());

    const matchesContributor = !contributorValue || author === contributorValue.toLowerCase();

    return matchesSearch && matchesTech && matchesContributor;
  });
}

// ---------------------------------------------------------------------------
// Sample data used across multiple test suites
// ---------------------------------------------------------------------------

const sampleProjects = [
  {
    title: 'Alpha Project',
    description: 'A JavaScript utility tool.',
    tags: ['JavaScript', 'Utility Tool'],
    links: { github: 'https://github.com/user/alpha', live: 'https://example.com/alpha' },
    author: { name: 'Alice', github: 'https://github.com/alice' },
  },
  {
    title: 'Beta App',
    description: 'A React dashboard for analytics.',
    tags: ['React', 'CSS', 'Dashboard'],
    links: { live: 'https://example.com/beta' },
    author: { name: 'Bob', github: 'https://github.com/bob' },
  },
  {
    title: 'Gamma Tool',
    description: 'Python script automation.',
    tags: ['Python', 'Automation'],
    links: {},
    author: { name: 'Alice', github: 'https://github.com/alice' },
  },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('sortProjects', () => {
  test('sorts projects A-Z by title', () => {
    const sorted = sortProjects(sampleProjects, 'az');
    expect(sorted[0].title).toBe('Alpha Project');
    expect(sorted[1].title).toBe('Beta App');
    expect(sorted[2].title).toBe('Gamma Tool');
  });

  test('sorts projects Z-A by title', () => {
    const sorted = sortProjects(sampleProjects, 'za');
    expect(sorted[0].title).toBe('Gamma Tool');
    expect(sorted[1].title).toBe('Beta App');
    expect(sorted[2].title).toBe('Alpha Project');
  });

  test('does not mutate the original array', () => {
    const original = [...sampleProjects];
    sortProjects(sampleProjects, 'za');
    expect(sampleProjects.map(p => p.title)).toEqual(original.map(p => p.title));
  });
});

describe('createProjectCard', () => {
  test('renders a div with class project-card', () => {
    const card = createProjectCard(sampleProjects[0], 0);
    expect(card.className).toBe('project-card');
  });

  test('displays the project title in an h2 element', () => {
    const card = createProjectCard(sampleProjects[0], 0);
    const h2 = card.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2.textContent).toBe('Alpha Project');
  });

  test('falls back to "Untitled Project" when title is missing', () => {
    const card = createProjectCard({ description: 'desc' }, 0);
    expect(card.querySelector('h2').textContent).toBe('Untitled Project');
  });

  test('falls back to "Unknown Contributor" when author is missing', () => {
    const card = createProjectCard({ title: 'No Author' }, 0);
    expect(card.innerHTML).toContain('Unknown Contributor');
  });

  test('renders a tag span for each item in the tags array', () => {
    const card = createProjectCard(sampleProjects[0], 0);
    const tags = card.querySelectorAll('.tag');
    expect(tags).toHaveLength(2);
    expect(tags[0].textContent).toBe('JavaScript');
    expect(tags[1].textContent).toBe('Utility Tool');
  });

  test('includes a GitHub link when links.github is provided', () => {
    const card = createProjectCard(sampleProjects[0], 0);
    const links = card.querySelectorAll('.project-links a');
    const hrefs = Array.from(links).map(a => a.href);
    expect(hrefs).toContain('https://github.com/user/alpha');
  });

  test('includes a live link when links.live is provided', () => {
    const card = createProjectCard(sampleProjects[0], 0);
    const links = card.querySelectorAll('.project-links a');
    const hrefs = Array.from(links).map(a => a.href);
    expect(hrefs).toContain('https://example.com/alpha');
  });

  test('renders no links when links object is empty', () => {
    const card = createProjectCard(sampleProjects[2], 0);
    const links = card.querySelectorAll('.project-links a');
    expect(links).toHaveLength(0);
  });
});

describe('runFilter', () => {
  test('returns all projects when query is empty and tech is "all"', () => {
    const result = runFilter(sampleProjects, '', 'all');
    expect(result).toHaveLength(3);
  });

  test('filters by title search query (case-insensitive)', () => {
    const result = runFilter(sampleProjects, 'alpha', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Alpha Project');
  });

  test('filters by description search query', () => {
    const result = runFilter(sampleProjects, 'dashboard', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Beta App');
  });

  test('filters by tag/tech value', () => {
    const result = runFilter(sampleProjects, '', 'react');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Beta App');
  });

  test('filters by author name', () => {
    const result = runFilter(sampleProjects, 'alice', 'all');
    expect(result).toHaveLength(2);
  });

  test('returns an empty array when no project matches', () => {
    const result = runFilter(sampleProjects, 'nonexistent', 'all');
    expect(result).toHaveLength(0);
  });

  test('filters by contributor value', () => {
    const result = runFilter(sampleProjects, '', 'all', 'Bob');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Beta App');
  });

  test('combines search query and tech filter correctly', () => {
    // "alice" matches both Alpha Project and Gamma Tool, but only Alpha has JavaScript tag
    const result = runFilter(sampleProjects, 'alice', 'javascript');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Alpha Project');
  });
});
