// Interactive Story Builder JavaScript
// Handles story creation, branching, collaboration, export/import, accessibility, and sharing

const storyCreateForm = document.getElementById('story-create-form');
const storyBranches = document.getElementById('story-branches');
const storyGallery = document.getElementById('story-gallery');
const collaborators = document.getElementById('collaborators');
const shareBtn = document.getElementById('share-btn');
const shareLink = document.getElementById('share-link');
let stories = [];
let currentStory = null;
let accessibilityEnabled = false;

storyCreateForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('story-title').value;
    const intro = document.getElementById('story-intro').value;
    if (title && intro) {
        currentStory = {
            title,
            intro,
            branches: [],
            collaborators: ['You']
        };
        stories.push(currentStory);
        renderBranches();
        renderGallery();
        renderCollaborators();
        storyCreateForm.reset();
    }
});

function renderBranches() {
    storyBranches.innerHTML = '';
    if (!currentStory) return;
    const div = document.createElement('div');
    div.className = 'branch';
    div.innerHTML = `<strong>${currentStory.title}</strong><br>${currentStory.intro}`;
    storyBranches.appendChild(div);
    currentStory.branches.forEach((branch, idx) => {
        const branchDiv = document.createElement('div');
        branchDiv.className = 'branch';
        branchDiv.innerHTML = `<strong>Branch ${idx + 1}</strong><br>${branch.text}`;
        branchDiv.addEventListener('click', () => addBranch(idx));
        storyBranches.appendChild(branchDiv);
    });
    const addBranchBtn = document.createElement('button');
    addBranchBtn.textContent = 'Add Branch';
    addBranchBtn.onclick = () => addBranch();
    storyBranches.appendChild(addBranchBtn);
}

function addBranch(idx) {
    const branchText = prompt('Enter branch narrative:');
    if (branchText) {
        currentStory.branches.push({ text: branchText, branches: [] });
        renderBranches();
        renderGallery();
    }
}

function renderGallery() {
    storyGallery.innerHTML = '';
    stories.forEach((story, idx) => {
        const div = document.createElement('div');
        div.className = 'story-item';
        div.innerHTML = `<strong>${story.title}</strong><br>${story.intro}<br>Branches: ${story.branches.length}`;
        div.addEventListener('click', () => {
            currentStory = story;
            renderBranches();
            renderCollaborators();
        });
        storyGallery.appendChild(div);
    });
}

function renderCollaborators() {
    collaborators.innerHTML = '';
    if (!currentStory) return;
    let html = `<p>Collaborators: ${currentStory.collaborators.join(', ')}</p>`;
    collaborators.innerHTML = html;
}

// Export/import story data
function exportStoryData() {
    const dataStr = JSON.stringify(stories);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'story-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importStoryData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                stories = imported;
                renderGallery();
                if (stories.length > 0) {
                    currentStory = stories[0];
                    renderBranches();
                    renderCollaborators();
                }
            }
        } catch (err) {
            alert('Invalid story data file.');
        }
    };
    reader.readAsText(file);
}

// Accessibility features
function toggleAccessibility() {
    accessibilityEnabled = !accessibilityEnabled;
    document.body.style.fontSize = accessibilityEnabled ? '20px' : '16px';
    document.body.style.background = accessibilityEnabled ? '#fffbe6' : '#f5f7fa';
}

// Sharing story
document.getElementById('share-btn').addEventListener('click', function() {
    const url = window.location.href;
    shareLink.innerHTML = `<p>Share this link: <a href="${url}">${url}</a></p>`;
});

// UI event bindings
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-input');
    const accessibilityBtn = document.getElementById('accessibility-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportStoryData);
    if (importInput) importInput.addEventListener('change', e => importStoryData(e.target.files[0]));
    if (accessibilityBtn) accessibilityBtn.addEventListener('click', toggleAccessibility);
});
