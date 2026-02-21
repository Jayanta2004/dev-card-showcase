'use strict';

function checkImageAlt(html) {
  const imgRegex = /<img[^>]*>/gi;
  const imgs = html.match(imgRegex) || [];
  const issues = [];
  
  imgs.forEach((img, index) => {
    if (!img.includes('alt=')) {
      issues.push({ index, type: 'missing-alt', element: img });
    } else if (img.includes('alt=""') && !img.includes('role="presentation"')) {
      issues.push({ index, type: 'empty-alt', element: img });
    }
  });
  
  return issues;
}

function checkButtonLabels(html) {
  const buttonRegex = /<button[^>]*>[\s\S]*?<\/button>/gi;
  const buttons = html.match(buttonRegex) || [];
  const issues = [];
  
  buttons.forEach((button, index) => {
    const hasAriaLabel = button.includes('aria-label=');
    const hasText = button.replace(/<[^>]*>/g, '').trim().length > 0;
    const hasTitle = button.includes('title=');
    
    if (!hasAriaLabel && !hasText && !hasTitle) {
      issues.push({ index, type: 'no-label', element: button });
    }
  });
  
  return issues;
}

function checkFormLabels(html) {
  const inputRegex = /<input[^>]*type="[^"]*"[^>]*>/gi;
  const inputs = html.match(inputRegex) || [];
  const issues = [];
  
  inputs.forEach((input, index) => {
    const isHidden = input.includes('type="hidden"');
    const hasAriaLabel = input.includes('aria-label=');
    const hasId = /id="[^"]*"/.test(input);
    
    if (!isHidden && !hasAriaLabel && !hasId) {
      issues.push({ index, type: 'no-label', element: input });
    }
  });
  
  return issues;
}

function checkSkipLink(html) {
  return html.includes('class="skip-link"') || html.includes('href="#main-content"');
}

function checkLandmarks(html) {
  return {
    hasMain: html.includes('role="main"') || html.includes('<main'),
    hasNav: html.includes('role="navigation"') || html.includes('<nav'),
    hasFooter: html.includes('role="contentinfo"') || html.includes('<footer')
  };
}

describe('Accessibility Checks', () => {
  describe('checkImageAlt', () => {
    test('passes for images with descriptive alt text', () => {
      const html = '<img src="photo.jpg" alt="John\'s profile photo">';
      const issues = checkImageAlt(html);
      expect(issues).toHaveLength(0);
    });

    test('detects missing alt attribute', () => {
      const html = '<img src="photo.jpg">';
      const issues = checkImageAlt(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('missing-alt');
    });

    test('detects empty alt without role=presentation', () => {
      const html = '<img src="decorative.jpg" alt="">';
      const issues = checkImageAlt(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('empty-alt');
    });

    test('passes for decorative images with role=presentation', () => {
      const html = '<img src="decorative.jpg" alt="" role="presentation">';
      const issues = checkImageAlt(html);
      expect(issues).toHaveLength(0);
    });

    test('handles multiple images', () => {
      const html = '<img src="1.jpg" alt="Photo"><img src="2.jpg">';
      const issues = checkImageAlt(html);
      expect(issues).toHaveLength(1);
    });
  });

  describe('checkButtonLabels', () => {
    test('passes for buttons with visible text', () => {
      const html = '<button>Click me</button>';
      const issues = checkButtonLabels(html);
      expect(issues).toHaveLength(0);
    });

    test('passes for buttons with aria-label', () => {
      const html = '<button aria-label="Toggle menu"></button>';
      const issues = checkButtonLabels(html);
      expect(issues).toHaveLength(0);
    });

    test('passes for buttons with title', () => {
      const html = '<button title="Close"></button>';
      const issues = checkButtonLabels(html);
      expect(issues).toHaveLength(0);
    });

    test('detects buttons without any label', () => {
      const html = '<button></button>';
      const issues = checkButtonLabels(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('no-label');
    });

    test('handles icon-only buttons with aria-label', () => {
      const html = '<button aria-label="Search"><i class="fas fa-search"></i></button>';
      const issues = checkButtonLabels(html);
      expect(issues).toHaveLength(0);
    });
  });

  describe('checkFormLabels', () => {
    test('passes for inputs with aria-label', () => {
      const html = '<input type="text" aria-label="Search">';
      const issues = checkFormLabels(html);
      expect(issues).toHaveLength(0);
    });

    test('passes for inputs with id (assumes associated label)', () => {
      const html = '<input type="text" id="search">';
      const issues = checkFormLabels(html);
      expect(issues).toHaveLength(0);
    });

    test('ignores hidden inputs', () => {
      const html = '<input type="hidden" name="token">';
      const issues = checkFormLabels(html);
      expect(issues).toHaveLength(0);
    });

    test('detects inputs without labels', () => {
      const html = '<input type="text" name="query">';
      const issues = checkFormLabels(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('no-label');
    });
  });

  describe('checkSkipLink', () => {
    test('detects skip link presence', () => {
      const html = '<a href="#main-content" class="skip-link">Skip to main</a>';
      expect(checkSkipLink(html)).toBe(true);
    });

    test('returns false when no skip link', () => {
      const html = '<div>Main content</div>';
      expect(checkSkipLink(html)).toBe(false);
    });
  });

  describe('checkLandmarks', () => {
    test('detects all landmarks with roles', () => {
      const html = '<nav role="navigation"></nav><main role="main"></main><footer role="contentinfo"></footer>';
      const landmarks = checkLandmarks(html);
      expect(landmarks.hasMain).toBe(true);
      expect(landmarks.hasNav).toBe(true);
      expect(landmarks.hasFooter).toBe(true);
    });

    test('detects landmarks with semantic elements', () => {
      const html = '<nav></nav><main></main><footer></footer>';
      const landmarks = checkLandmarks(html);
      expect(landmarks.hasMain).toBe(true);
      expect(landmarks.hasNav).toBe(true);
      expect(landmarks.hasFooter).toBe(true);
    });

    test('returns false for missing landmarks', () => {
      const html = '<div></div>';
      const landmarks = checkLandmarks(html);
      expect(landmarks.hasMain).toBe(false);
    });
  });
});
