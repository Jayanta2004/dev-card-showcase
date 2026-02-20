// Collaborative Story Builder App
// Data Models
let stories = JSON.parse(localStorage.getItem('collabStories') || '[]');
if (stories.length === 0) {
  stories = [{
    id: 1,
    title: 'The Adventure Begins',
    parent: null,
    text: 'Once upon a time, in a small village, a mysterious event occurred.',
    votes: 3,
    children: []
  }];
}

function saveStories() {
  localStorage.setItem('collabStories', JSON.stringify(stories));
}

function getRootStory() {
  return stories.find(s => s.parent === null);
}

function getStoryById(id) {
  return stories.find(s => s.id === id);
}

function getChildren(parentId) {
  return stories.filter(s => s.parent === parentId);
}

function renderCurrentStory() {
  const main = document.getElementById('main-content');
  let story = getRootStory();
  let path = [story];
  while (story.children && story.children.length) {
    // Find the child with the most votes
    let next = getStoryById(story.children.sort((a, b) => getStoryById(b).votes - getStoryById(a).votes)[0]);
    if (!next) break;
    path.push(next);
    story = next;
  }
  main.innerHTML = `
    <h2 class="section-title">Current Story</h2>
    <div class="card">
      ${path.map(s => `<p>${s.text}</p>`).join('<hr>')}
    </div>
    <button class="action" onclick="renderBranches(${story.id})">View Branches</button>
    <button class="action" onclick="renderContribute(${story.id})">Contribute Next</button>
  `;
}

function renderBranches(parentId) {
  const main = document.getElementById('main-content');
  const branches = getChildren(parentId);
  main.innerHTML = `
    <h2 class="section-title">Branches</h2>
    <ul class="branch-list">
      ${branches.length ? branches.map(b => `
        <li>
          <div>${b.text}</div>
          <div>Votes: ${b.votes}</div>
          <button class="action" onclick="voteBranch(${b.id})">Vote</button>
          <button class="action" onclick="renderBranches(${b.id})">View Further Branches</button>
        </li>
      `).join('') : '<li>No branches yet. Be the first to contribute!</li>'}
    </ul>
    <button class="action" onclick="renderContribute(${parentId})">Contribute a Branch</button>
    <button class="action" onclick="renderCurrentStory()">Back to Story</button>
  `;
}

function voteBranch(id) {
  const branch = getStoryById(id);
  branch.votes++;
  saveStories();
  renderBranches(branch.parent);
}

function renderContribute(parentId) {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Contribute to the Story</h2>
    <form id="contribute-form">
      <label>Your Sentence or Paragraph
        <textarea id="contrib-text" rows="3" required></textarea>
      </label>
      <button class="action" type="submit">Submit</button>
      <button class="action" type="button" onclick="renderBranches(${parentId})">Cancel</button>
    </form>
  `;
  document.getElementById('contribute-form').onsubmit = function(e) {
    e.preventDefault();
    const text = document.getElementById('contrib-text').value;
    const newId = Date.now();
    stories.push({
      id: newId,
      title: '',
      parent: parentId,
      text,
      votes: 0,
      children: []
    });
    // Add to parent's children
    const parent = getStoryById(parentId);
    parent.children.push(newId);
    saveStories();
    renderBranches(parentId);
  };
}

document.getElementById('nav-story').onclick = renderCurrentStory;
document.getElementById('nav-branch').onclick = function() {
  renderBranches(getRootStory().id);
};
document.getElementById('nav-contribute').onclick = function() {
  renderContribute(getRootStory().id);
};

// Initial load
renderCurrentStory();
