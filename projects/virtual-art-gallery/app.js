// Virtual Art Gallery
// Artwork upload, themed galleries, sharing

const uploadForm = document.getElementById('upload-form');
const artUploadEl = document.getElementById('art-upload');
const artTitleEl = document.getElementById('art-title');
const artThemeEl = document.getElementById('art-theme');
const galleryEl = document.getElementById('gallery');
const themeFilterEl = document.getElementById('theme-filter');
const shareBtn = document.getElementById('share-btn');
const shareLinkEl = document.getElementById('share-link');

let artworks = [];
let themes = new Set();

// Upload artwork
uploadForm.addEventListener('submit', e => {
    e.preventDefault();
    const file = artUploadEl.files[0];
    const title = artTitleEl.value.trim();
    const theme = artThemeEl.value.trim();
    if (file && title && theme) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            artworks.push({
                img: evt.target.result,
                title,
                theme
            });
            themes.add(theme);
            renderGallery();
            renderThemeFilter();
        };
        reader.readAsDataURL(file);
        artTitleEl.value = '';
        artThemeEl.value = '';
        artUploadEl.value = '';
    }
});

// Render gallery
function renderGallery() {
    galleryEl.innerHTML = '';
    const selectedTheme = themeFilterEl.value;
    artworks.forEach(art => {
        if (selectedTheme === 'all' || art.theme === selectedTheme) {
            const div = document.createElement('div');
            div.className = 'artwork';
            const img = document.createElement('img');
            img.src = art.img;
            div.appendChild(img);
            const title = document.createElement('div');
            title.className = 'title';
            title.textContent = art.title;
            div.appendChild(title);
            const theme = document.createElement('div');
            theme.className = 'theme';
            theme.textContent = art.theme;
            div.appendChild(theme);
            galleryEl.appendChild(div);
        }
    });
}

// Theme filter
function renderThemeFilter() {
    themeFilterEl.innerHTML = '<option value="all">All Themes</option>';
    Array.from(themes).forEach(theme => {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme;
        themeFilterEl.appendChild(option);
    });
}
themeFilterEl.onchange = renderGallery;

// Share gallery
shareBtn.onclick = () => {
    // Mock share link
    shareLinkEl.textContent = 'https://virtual-art-gallery.example.com/user123/gallery';
};

renderGallery();
renderThemeFilter();
