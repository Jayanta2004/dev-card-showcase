// AI-Powered Art Critique Platform JavaScript
// Handles artwork upload, gallery display, AI critique (mocked), export/import, accessibility, and sharing

const artUploadForm = document.getElementById('art-upload-form');
const gallery = document.getElementById('gallery');
const critiqueFeedback = document.getElementById('critique-feedback');
const shareBtn = document.getElementById('share-btn');
const shareLink = document.getElementById('share-link');
let artworks = [];
let critiques = [];
let accessibilityEnabled = false;

artUploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('art-upload');
    const title = document.getElementById('art-title').value;
    const artist = document.getElementById('art-artist').value;
    const file = fileInput.files[0];
    if (file && title && artist) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            const imgSrc = ev.target.result;
            const artwork = { title, artist, imgSrc };
            artworks.push(artwork);
            renderGallery();
            generateCritique(artwork);
        };
        reader.readAsDataURL(file);
        artUploadForm.reset();
    }
});

function renderGallery() {
    gallery.innerHTML = '';
    artworks.forEach((art, idx) => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `<img src="${art.imgSrc}" alt="${art.title}"><br><strong>${art.title}</strong><br><em>${art.artist}</em>`;
        div.addEventListener('click', () => showCritique(idx));
        gallery.appendChild(div);
    });
}

function generateCritique(artwork) {
    // Mocked AI critique logic
    const feedback = mockAICritique(artwork);
    critiques.push({ artwork, feedback });
    critiqueFeedback.innerHTML = `<p><strong>${artwork.title}</strong> by <em>${artwork.artist}</em><br>${feedback}</p>`;
}

function showCritique(idx) {
    const critique = critiques[idx];
    if (critique) {
        critiqueFeedback.innerHTML = `<p><strong>${critique.artwork.title}</strong> by <em>${critique.artwork.artist}</em><br>${critique.feedback}</p>`;
    }
}

function mockAICritique(artwork) {
    // Simple random feedback generator
    const feedbacks = [
        'Excellent use of color and composition.',
        'The perspective is engaging and dynamic.',
        'Consider refining the details for more impact.',
        'The mood is well conveyed through texture.',
        'Try experimenting with lighting for depth.',
        'Great balance between abstract and realism.',
        'The subject is expressive and unique.',
        'Contrast could be improved for clarity.',
        'Impressive technique and brushwork.',
        'The theme is thought-provoking.'
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
}

// Export/import critique data
function exportCritiqueData() {
    const dataStr = JSON.stringify(critiques);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'critique-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importCritiqueData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                critiques = imported;
                renderGallery();
                if (critiques.length > 0) showCritique(0);
            }
        } catch (err) {
            alert('Invalid critique data file.');
        }
    };
    reader.readAsText(file);
}

// Accessibility features
function toggleAccessibility() {
    accessibilityEnabled = !accessibilityEnabled;
    document.body.style.fontSize = accessibilityEnabled ? '20px' : '16px';
    document.body.style.background = accessibilityEnabled ? '#fffbe6' : '#f7f6fb';
}

// Sharing gallery
shareBtn.addEventListener('click', function() {
    const url = window.location.href;
    shareLink.innerHTML = `<p>Share this link: <a href="${url}">${url}</a></p>`;
});

// UI event bindings
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-input');
    const accessibilityBtn = document.getElementById('accessibility-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportCritiqueData);
    if (importInput) importInput.addEventListener('change', e => importCritiqueData(e.target.files[0]));
    if (accessibilityBtn) accessibilityBtn.addEventListener('click', toggleAccessibility);
});
