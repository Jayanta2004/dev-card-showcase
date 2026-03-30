// AI Product Brief Translator - Frontend Logic


// Import UI components
const { createSection, createUserStoryList, createTaskList, createDesignSpecs, createPhaseList } = window.Components;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('briefForm');
  const output = document.getElementById('output');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const brief = document.getElementById('brief').value.trim();
    if (!brief) return;
    output.classList.add('active');
    output.innerHTML = '<div class="loader"></div><p style="text-align:center;">Translating your idea into a roadmap...</p>';
    setTimeout(() => {
      output.innerHTML = generateFakeAIOutput(brief);
      addCopyButtons();
    }, 1800);
  });
});

function generateFakeAIOutput(brief) {
  // Simulated AI output with modular UI components
  const phases = [
    { title: 'Phase 1', desc: 'Requirement Gathering & Research' },
    { title: 'Phase 2', desc: 'User Story Mapping & Task Breakdown' },
    { title: 'Phase 3', desc: 'Design Specification & Wireframes' },
    { title: 'Phase 4', desc: 'Development Sprints' },
    { title: 'Phase 5', desc: 'Testing & Feedback' },
    { title: 'Phase 6', desc: 'Launch & Iteration' }
  ];
  const userStories = [
    'As a founder, I want to input a product idea so that I can get a clear roadmap.',
    'As a designer, I want to see design specs generated from the brief so I can start prototyping.',
    'As a developer, I want tasks broken down from user stories so I can plan sprints.'
  ];
  const designSpecs = [
    'Modern, intuitive UI for brief input and results display',
    'Responsive layout for desktop and mobile',
    'Clear separation of roadmap, user stories, and tasks'
  ];
  const tasks = [
    'Set up project structure',
    'Implement brief input form',
    'Integrate AI (or mock) for roadmap generation',
    'Display results in organized sections',
    'Polish UI/UX'
  ];

  return `
    ${createSection('Project Roadmap', createPhaseList(phases) + copyButton('roadmap'))}
    ${createSection('User Stories', createUserStoryList(userStories) + copyButton('userstories'))}
    ${createSection('Design Specs', createDesignSpecs(designSpecs) + copyButton('designspecs'))}
    ${createSection('Tasks', createTaskList(tasks) + copyButton('tasks'))}
    <div style="margin-top:18px; color:#888; font-size:0.98em;">(Demo output for: <i>${brief}</i>)</div>
  `;
}

function copyButton(type) {
  return `<button class="copy-btn" data-copy="${type}">Copy</button>`;
}

function addCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const section = e.target.closest('.section-block');
      if (!section) return;
      const text = section.innerText.replace('Copy', '').trim();
      navigator.clipboard.writeText(text);
      e.target.innerText = 'Copied!';
      setTimeout(() => { e.target.innerText = 'Copy'; }, 1200);
    });
  });
}
