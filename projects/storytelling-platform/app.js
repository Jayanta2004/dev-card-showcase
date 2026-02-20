// Interactive Storytelling Platform - app.js
// Core logic for branching stories and UI

const storyText = document.getElementById('story-text');
const choicesDiv = document.getElementById('choices');
const restartSection = document.getElementById('restart-section');
const restartBtn = document.getElementById('restart-btn');

let currentNode = 'start';

function renderStory(nodeKey) {
  const node = stories[nodeKey];
  storyText.textContent = node.text;
  choicesDiv.innerHTML = '';
  if (node.choices && node.choices.length > 0) {
    node.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.text;
      btn.addEventListener('click', () => {
        currentNode = choice.next;
        renderStory(currentNode);
      });
      choicesDiv.appendChild(btn);
    });
    restartSection.classList.add('hidden');
  } else {
    // End node
    restartSection.classList.remove('hidden');
  }
}

restartBtn.addEventListener('click', () => {
  currentNode = 'start';
  renderStory(currentNode);
});

// Initial load
renderStory(currentNode);
