// UI Components for AI Product Brief Translator
// Modular, reusable, and styled for a beautiful UI

function createSection(title, content) {
  return `
    <section class="section-block">
      <h2>${title}</h2>
      <div>${content}</div>
    </section>
  `;
}

function createUserStoryList(stories) {
  return `
    <ol class="user-story-list">
      ${stories.map(story => `<li>${story}</li>`).join('')}
    </ol>
  `;
}

function createTaskList(tasks) {
  return `
    <ul class="task-list">
      ${tasks.map(task => `<li>${task}</li>`).join('')}
    </ul>
  `;
}

function createDesignSpecs(specs) {
  return `
    <ul class="design-spec-list">
      ${specs.map(spec => `<li>${spec}</li>`).join('')}
    </ul>
  `;
}

function createPhaseList(phases) {
  return `
    <ul class="phase-list">
      ${phases.map(phase => `<li><b>${phase.title}:</b> ${phase.desc}</li>`).join('')}
    </ul>
  `;
}

// Export for use in app.js
window.Components = {
  createSection,
  createUserStoryList,
  createTaskList,
  createDesignSpecs,
  createPhaseList
};
