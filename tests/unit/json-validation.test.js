'use strict';

function validateProject(project) {
  const errors = [];
  
  if (!project.title || typeof project.title !== 'string') {
    errors.push('Missing or invalid title');
  }
  
  if (!project.description || typeof project.description !== 'string') {
    errors.push('Missing or invalid description');
  }
  
  if (!Array.isArray(project.tags)) {
    errors.push('Tags must be an array');
  }
  
  if (project.links && typeof project.links !== 'object') {
    errors.push('Links must be an object');
  }
  
  if (project.author && typeof project.author !== 'object') {
    errors.push('Author must be an object');
  }
  
  return errors;
}

function validateProjectsArray(projects) {
  if (!Array.isArray(projects)) {
    return { valid: false, error: 'Projects must be an array' };
  }
  
  const allErrors = [];
  projects.forEach((project, index) => {
    const errors = validateProject(project);
    if (errors.length > 0) {
      allErrors.push({ index, errors });
    }
  });
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
}

function validateContributor(contributor) {
  const errors = [];
  
  if (!contributor.name || typeof contributor.name !== 'string') {
    errors.push('Missing or invalid name');
  }
  
  if (!contributor.username || typeof contributor.username !== 'string') {
    errors.push('Missing or invalid username');
  }
  
  if (!contributor.role || typeof contributor.role !== 'string') {
    errors.push('Missing or invalid role');
  }
  
  if (contributor.github && typeof contributor.github !== 'string') {
    errors.push('GitHub must be a string URL');
  }
  
  if (contributor.skills && !Array.isArray(contributor.skills)) {
    errors.push('Skills must be an array');
  }
  
  return errors;
}

function validateContributorsArray(contributors) {
  if (!Array.isArray(contributors)) {
    return { valid: false, error: 'Contributors must be an array' };
  }
  
  const allErrors = [];
  contributors.forEach((contributor, index) => {
    const errors = validateContributor(contributor);
    if (errors.length > 0) {
      allErrors.push({ index, errors });
    }
  });
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
}

describe('JSON Validation', () => {
  describe('validateProject', () => {
    test('passes for valid project', () => {
      const project = {
        title: 'Test Project',
        description: 'A test project',
        tags: ['JavaScript', 'CSS'],
        links: { github: 'https://github.com/test' },
        author: { name: 'Test User' }
      };
      expect(validateProject(project)).toHaveLength(0);
    });

    test('detects missing title', () => {
      const project = { description: 'A test' };
      const errors = validateProject(project);
      expect(errors).toContain('Missing or invalid title');
    });

    test('detects missing description', () => {
      const project = { title: 'Test' };
      const errors = validateProject(project);
      expect(errors).toContain('Missing or invalid description');
    });

    test('detects invalid tags type', () => {
      const project = { title: 'Test', description: 'Desc', tags: 'JavaScript' };
      const errors = validateProject(project);
      expect(errors).toContain('Tags must be an array');
    });

    test('allows missing optional fields', () => {
      const project = { title: 'Test', description: 'Desc', tags: [] };
      expect(validateProject(project)).toHaveLength(0);
    });
  });

  describe('validateProjectsArray', () => {
    test('passes for valid array', () => {
      const projects = [
        { title: 'A', description: 'Desc A', tags: [] },
        { title: 'B', description: 'Desc B', tags: ['CSS'] }
      ];
      const result = validateProjectsArray(projects);
      expect(result.valid).toBe(true);
    });

    test('fails for non-array', () => {
      const result = validateProjectsArray({ not: 'array' });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Projects must be an array');
    });

    test('reports errors with indices', () => {
      const projects = [
        { title: 'Valid', description: 'Desc', tags: [] },
        { description: 'No title' },
        { title: 'Also Valid', description: 'Desc', tags: [] }
      ];
      const result = validateProjectsArray(projects);
      expect(result.valid).toBe(false);
      expect(result.errors[0].index).toBe(1);
    });
  });

  describe('validateContributor', () => {
    test('passes for valid contributor', () => {
      const contributor = {
        name: 'John Doe',
        username: 'johndoe',
        role: 'Developer',
        github: 'https://github.com/johndoe',
        skills: ['JavaScript', 'React']
      };
      expect(validateContributor(contributor)).toHaveLength(0);
    });

    test('detects missing name', () => {
      const contributor = { username: 'test', role: 'Dev' };
      const errors = validateContributor(contributor);
      expect(errors).toContain('Missing or invalid name');
    });

    test('detects missing username', () => {
      const contributor = { name: 'Test', role: 'Dev' };
      const errors = validateContributor(contributor);
      expect(errors).toContain('Missing or invalid username');
    });

    test('detects missing role', () => {
      const contributor = { name: 'Test', username: 'test' };
      const errors = validateContributor(contributor);
      expect(errors).toContain('Missing or invalid role');
    });

    test('detects invalid skills type', () => {
      const contributor = { name: 'Test', username: 'test', role: 'Dev', skills: 'JavaScript' };
      const errors = validateContributor(contributor);
      expect(errors).toContain('Skills must be an array');
    });
  });

  describe('validateContributorsArray', () => {
    test('passes for valid array', () => {
      const contributors = [
        { name: 'A', username: 'a', role: 'Dev' },
        { name: 'B', username: 'b', role: 'Contributor' }
      ];
      const result = validateContributorsArray(contributors);
      expect(result.valid).toBe(true);
    });

    test('fails for non-array', () => {
      const result = validateContributorsArray('not an array');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Contributors must be an array');
    });
  });
});
