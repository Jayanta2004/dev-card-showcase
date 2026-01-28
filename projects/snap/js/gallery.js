/**
 * gallery.js
 * Handles data fetching and DOM rendering for the gallery grid.
 */

import { setImages, openImage, addImages, toggleFavorite, loadFavorites, getState, subscribe } from './state.js';

// Mock Data Generation
const IMAGE_COUNT = 30;
const COLLECTIONS = ['nature', 'architecture', 'people', 'tech', 'abstract'];

/**
 * Generates an array of mock image objects.
 */
function generateMockData() {
    return Array.from({ length: IMAGE_COUNT }).map((_, index) => {
        const id = index + 100; // Random starting ID
        const width = [600, 800, 1000][Math.floor(Math.random() * 3)];
        const height = [800, 1000, 1200][Math.floor(Math.random() * 3)];
        const type = COLLECTIONS[Math.floor(Math.random() * COLLECTIONS.length)];

        return {
            id: `img-${id}`,
            url: `https://picsum.photos/id/${id}/${width}/${height}`,
            thumb: `https://picsum.photos/id/${id}/400/600`, // Lower res for grid
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Collection #${index + 1}`,
            author: `Photographer ${index + 1}`,
            category: type,
            width,
            height
        };
    });
}

/**
 * Creates a single gallery item DOM element.
 */
function createGalleryItem(image, index) {
    const state = getState();
    const isFav = state.favorites.has(image.id);

    const item = document.createElement('div');
    item.className = 'gallery-item loading';
    item.dataset.index = index;
    item.dataset.id = image.id;
    item.tabIndex = 0;
    item.role = 'button';
    item.ariaLabel = `View ${image.title}`;

    const img = document.createElement('img');
    img.className = 'gallery-img';
    img.dataset.src = image.thumb;
    img.alt = image.title;
    img.draggable = false;

    img.onload = () => {
        item.classList.remove('loading');
    };

    const overlay = document.createElement('div');
    overlay.className = 'item-overlay';

    const title = document.createElement('h3');
    title.className = 'item-title';
    title.textContent = image.title;

    const author = document.createElement('p');
    author.className = 'item-author';
    author.textContent = `by ${image.author}`;

    // Fav Button
    const favBtn = document.createElement('button');
    favBtn.className = `fav-btn ${isFav ? 'active' : ''}`;
    favBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
    favBtn.ariaLabel = "Toggle Favorite";
    favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(image.id);
    });

    overlay.appendChild(title);
    overlay.appendChild(author);
    overlay.appendChild(favBtn);

    item.appendChild(img);
    item.appendChild(overlay);

    return item;
}

/**
 * Helper to render grid
 */
function renderGrid(container, images) {
    const fragment = document.createDocumentFragment();
    images.forEach((img, idx) => {
        const node = createGalleryItem(img, idx);
        fragment.appendChild(node);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

/**
 * Renders the gallery grid.
 */
export async function initGallery(container) {
    loadFavorites();

    container.innerHTML = '<div class="loading-spinner" style="margin: 50px auto;"></div>';

    await new Promise(resolve => setTimeout(resolve, 800));

    const images = generateMockData();
    setImages(images);

    renderGrid(container, images);
    setupLazyLoading(container);
}

/**
 * Filter gallery items by search query.
 */
export function filterGallery(query) {
    const items = document.querySelectorAll('.gallery-item');
    const lowerQuery = query.toLowerCase();

    items.forEach(item => {
        const title = item.querySelector('.item-title')?.textContent.toLowerCase() || '';
        if (title.includes(lowerQuery)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

/**
 * Sets up IntersectionObserver for lazy loading images.
 */
function setupLazyLoading(container) {
    const observerOptions = {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    }, observerOptions);

    const images = container.querySelectorAll('img[data-src]');
    images.forEach(img => imageObserver.observe(img));
}

/**
 * Handle File Uploads
 */
export function handleFileUpload(files) {
    const newImages = Array.from(files).map((file, index) => {
        return {
            id: `upload-${Date.now()}-${index}`,
            url: URL.createObjectURL(file),
            thumb: URL.createObjectURL(file), // Use same URL for thumb
            title: file.name.split('.')[0],
            author: 'You',
            category: 'user-upload',
            width: 800,
            height: 600
        };
    });

    addImages(newImages);
}

// Subscribe to state changes
subscribe((state, changedKey) => {
    const container = document.getElementById('gallery-grid');
    if (!container) return; // Guard for non-gallery pages

    if (changedKey === 'images' || changedKey === 'favorites' || changedKey === 'sort') {
        let displayImages = [...state.images];

        // Filter Favs Only? (If implemented)
        // For now just sort by favs if selected

        // Apply Sort
        if (state.sortOrder === 'az') {
            displayImages.sort((a, b) => a.title.localeCompare(b.title));
        } else if (state.sortOrder === 'za') {
            displayImages.sort((a, b) => b.title.localeCompare(a.title));
        } else if (state.sortOrder === 'fav') {
            displayImages.sort((a, b) => {
                const aFav = state.favorites.has(a.id) ? 1 : 0;
                const bFav = state.favorites.has(b.id) ? 1 : 0;
                return bFav - aFav;
            });
        }

        renderGrid(container, displayImages);
        setupLazyLoading(container);
    }
});
