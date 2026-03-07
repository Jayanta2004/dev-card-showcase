const STORAGE_KEY = 'kindnessStorybookData';

const state = {
  stories: []
};

const chapterForm = document.getElementById('chapterForm');
const storySelect = document.getElementById('storySelect');
const newStoryFields = document.getElementById('newStoryFields');
const storyTitle = document.getElementById('storyTitle');
const storyTheme = document.getElementById('storyTheme');
const authorName = document.getElementById('authorName');
const illustration = document.getElementById('illustration');
const chapterText = document.getElementById('chapterText');
const storiesList = document.getElementById('storiesList');
const highlightsList = document.getElementById('highlightsList');
const badgesList = document.getElementById('badgesList');
const galleryList = document.getElementById('galleryList');
const seedDemoBtn = document.getElementById('seedDemoBtn');
const toast = document.getElementById('toast');

function uid() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    state.stories = parsed.stories || [];
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1700);
}

function badgeForCount(count) {
  if (count >= 8) return 'Gold';
  if (count >= 4) return 'Silver';
  return 'Bronze';
}

function formatTime(ts) {
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function setStats() {
  const activeStories = state.stories.filter((story) => story.status === 'active').length;
  const chapterTotal = state.stories.reduce((sum, story) => sum + story.chapters.length, 0);
  const highlights = state.stories.filter((story) => story.highlight).length;
  const contributors = new Set(state.stories.flatMap((story) => story.chapters.map((chapter) => chapter.author))).size;

  document.getElementById('activeCount').textContent = activeStories;
  document.getElementById('chapterCount').textContent = chapterTotal;
  document.getElementById('highlightCount').textContent = highlights;
  document.getElementById('contributorCount').textContent = contributors;
}

function renderStorySelect() {
  storySelect.innerHTML = '<option value="new">+ Start a new story</option>';
  state.stories
    .filter((story) => story.status === 'active')
    .forEach((story) => {
      const option = document.createElement('option');
      option.value = String(story.id);
      option.textContent = `${story.title} (${story.chapters.length} chapter${story.chapters.length > 1 ? 's' : ''})`;
      storySelect.appendChild(option);
    });
}

function renderHighlights() {
  const highlights = state.stories.filter((story) => story.highlight).slice(0, 5);
  if (!highlights.length) {
    highlightsList.innerHTML = '<p class="empty">No highlights yet. Mark meaningful stories as highlights.</p>';
    return;
  }
  highlightsList.innerHTML = highlights
    .map(
      (story) =>
        `<article class="item-card"><div class="story-title">${story.cover || '📖'} ${story.title}</div><div class="story-meta">${story.theme} · ${story.chapters.length} chapters</div></article>`
    )
    .join('');
}

function renderStories() {
  if (!state.stories.length) {
    storiesList.innerHTML = '<p class="empty">No stories yet. Start the first kindness chapter.</p>';
    return;
  }

  const ordered = [...state.stories].sort((a, b) => b.updatedAt - a.updatedAt);
  storiesList.innerHTML = ordered
    .map((story) => {
      const statusBadge = story.status === 'completed' ? '<span class="badge complete">Completed</span>' : '<span class="badge active">Active</span>';
      const highlightBadge = story.highlight ? '<span class="badge highlight">Highlight</span>' : '';
      const chapters = story.chapters
        .slice(-3)
        .map(
          (chapter) =>
            `<div class="chapter"><div class="chapter-head"><span>${chapter.illustration || '✨'} ${chapter.author}</span><span>${formatTime(chapter.createdAt)}</span></div><p>${chapter.text}</p></div>`
        )
        .join('');

      return `<article class="story-card"><div class="story-top"><div><div class="story-title">${story.cover || '📚'} ${story.title}</div><div class="story-meta">${story.theme} · ${story.chapters.length} chapters</div></div><div>${statusBadge} ${highlightBadge}</div></div>${chapters}<div class="actions"><button class="action-btn" onclick="toggleHighlight(${story.id})">${story.highlight ? 'Unhighlight' : 'Highlight'}</button><button class="action-btn" onclick="toggleComplete(${story.id})">${story.status === 'completed' ? 'Reopen' : 'Complete'}</button></div></article>`;
    })
    .join('');
}

function renderBadges() {
  const counts = {};
  state.stories.forEach((story) => {
    story.chapters.forEach((chapter) => {
      counts[chapter.author] = (counts[chapter.author] || 0) + 1;
    });
  });

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    badgesList.innerHTML = '<p class="empty">Contributor badges will appear as chapters are added.</p>';
    return;
  }

  badgesList.innerHTML = entries
    .map(([author, count]) => `<article class="item-card"><div class="story-title">${author}</div><div class="story-meta">${badgeForCount(count)} Badge · ${count} chapter${count > 1 ? 's' : ''}</div></article>`)
    .join('');
}

function renderGallery() {
  const completed = state.stories.filter((story) => story.status === 'completed');
  if (!completed.length) {
    galleryList.innerHTML = '<p class="empty">Completed storybooks will appear here.</p>';
    return;
  }

  galleryList.innerHTML = completed
    .map(
      (story) =>
        `<article class="item-card"><div class="story-title">${story.cover || '📘'} ${story.title}</div><div class="story-meta">${story.chapters.length} chapters · Last update ${formatTime(story.updatedAt)}</div></article>`
    )
    .join('');
}

function renderAll() {
  setStats();
  renderStorySelect();
  renderHighlights();
  renderStories();
  renderBadges();
  renderGallery();
}

function createStory(title, theme, cover, firstChapter) {
  state.stories.push({
    id: uid(),
    title,
    theme,
    cover,
    status: 'active',
    highlight: false,
    chapters: [firstChapter],
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
}

function addChapter(storyId, chapter) {
  const story = state.stories.find((entry) => entry.id === storyId);
  if (!story) return;
  story.chapters.push(chapter);
  story.updatedAt = Date.now();
}

window.toggleHighlight = function toggleHighlight(storyId) {
  const story = state.stories.find((entry) => entry.id === storyId);
  if (!story) return;
  story.highlight = !story.highlight;
  save();
  renderAll();
  showToast(story.highlight ? 'Story highlighted' : 'Story removed from highlights');
};

window.toggleComplete = function toggleComplete(storyId) {
  const story = state.stories.find((entry) => entry.id === storyId);
  if (!story) return;
  story.status = story.status === 'completed' ? 'active' : 'completed';
  story.updatedAt = Date.now();
  save();
  renderAll();
  showToast(story.status === 'completed' ? 'Moved to completed gallery' : 'Story reopened');
};

chapterForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const chapter = {
    id: uid(),
    author: authorName.value.trim(),
    illustration: illustration.value.trim(),
    text: chapterText.value.trim(),
    createdAt: Date.now()
  };

  if (!chapter.author || !chapter.text) {
    showToast('Please add your name and chapter text');
    return;
  }

  if (storySelect.value === 'new') {
    const title = storyTitle.value.trim();
    const theme = storyTheme.value.trim();
    if (!title || !theme) {
      showToast('Add story title and theme to start a new one');
      return;
    }
    createStory(title, theme, chapter.illustration || '📖', chapter);
    showToast('New story started');
  } else {
    addChapter(Number(storySelect.value), chapter);
    showToast('Chapter added to existing story');
  }

  chapterText.value = '';
  illustration.value = '';
  save();
  renderAll();
});

storySelect.addEventListener('change', () => {
  const isNew = storySelect.value === 'new';
  newStoryFields.style.display = isNew ? 'grid' : 'none';
});

seedDemoBtn.addEventListener('click', () => {
  if (state.stories.length) {
    showToast('Demo story is available only on an empty board');
    return;
  }

  createStory('The Umbrella Chain', 'Helping Strangers', '☔', {
    id: uid(),
    author: 'Aarav',
    illustration: '☔',
    text: 'When it started raining near the bus stop, I offered my umbrella to a student so they could run to class dry.',
    createdAt: Date.now() - 120000
  });

  addChapter(state.stories[0].id, {
    id: uid(),
    author: 'Mira',
    illustration: '🤝',
    text: 'I saw that and shared my raincoat with another person waiting for a cab. They smiled and did the same for someone else.',
    createdAt: Date.now() - 60000
  });

  state.stories[0].highlight = true;
  save();
  renderAll();
  showToast('Demo story added');
});

load();
renderAll();
newStoryFields.style.display = 'grid';
