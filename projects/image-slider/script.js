// Image data
const images = [
    {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        title: 'Mountain Landscape',
        description: 'Beautiful mountain view with sunset'
    },
    {
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
        title: 'Northern Lights',
        description: 'Aurora borealis over a frozen lake'
    },
    {
        url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
        title: 'Ocean Waves',
        description: 'Waves crashing on a rocky shore'
    },
    {
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
        title: 'Forest Path',
        description: 'Sunlight filtering through trees'
    },
    {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
        title: 'Snowy Peaks',
        description: 'Majestic snow-covered mountains'
    }
];

// Get DOM elements
const slider = document.getElementById('slider');
const dotsContainer = document.getElementById('dotsContainer');
const counter = document.getElementById('counter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const prevSlideBtn = document.getElementById('prevSlideBtn');
const nextSlideBtn = document.getElementById('nextSlideBtn');

// Slider state
let currentSlide = 0;
let autoplayInterval;
let isPlaying = false;

// Initialize slider
function initSlider() {
    // Create slides
    images.forEach((image, index) => {
        // Create slide element
        const slide = document.createElement('div');
        slide.className = 'slide';
        
        slide.innerHTML = `
            <img src="${image.url}" alt="${image.title}" loading="lazy">
            <div class="slide-caption">
                <div class="slide-title">${image.title}</div>
                <div>${image.description}</div>
            </div>
        `;
        
        slider.appendChild(slide);
        
        // Create dot
        const dot = document.createElement('button');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.index = index;
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dotsContainer.appendChild(dot);
    });
    
    // Update counter
    updateCounter();
    
    // Start autoplay
    startAutoplay();
}

// Go to specific slide
function goToSlide(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;
    
    currentSlide = index;
    
    // Move slider
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update dots
    updateDots();
    
    // Update counter
    updateCounter();
}

// Update dots active state
function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
        dot.setAttribute('aria-current', index === currentSlide ? 'true' : 'false');
    });
}

// Update counter
function updateCounter() {
    counter.textContent = `${currentSlide + 1} / ${images.length}`;
}

// Start autoplay
function startAutoplay() {
    if (isPlaying) return;
    
    isPlaying = true;
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    playBtn.setAttribute('aria-label', 'Autoplay is running');
    pauseBtn.setAttribute('aria-label', 'Pause autoplay');
    
    autoplayInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 3000); // Change slide every 3 seconds
}

// Stop autoplay
function stopAutoplay() {
    if (!isPlaying) return;
    
    isPlaying = false;
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    playBtn.setAttribute('aria-label', 'Start autoplay');
    pauseBtn.setAttribute('aria-label', 'Autoplay is paused');
    
    clearInterval(autoplayInterval);
}

// Initialize event listeners
function initEventListeners() {
    // Navigation buttons
    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    
    // Control buttons
    playBtn.addEventListener('click', startAutoplay);
    pauseBtn.addEventListener('click', stopAutoplay);
    prevSlideBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextSlideBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    
    // Dots navigation
    dotsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('dot')) {
            const index = parseInt(e.target.dataset.index);
            goToSlide(index);
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
        if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
        if (e.key === ' ') {
            e.preventDefault();
            if (isPlaying) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        }
        if (e.key === 'Home') goToSlide(0);
        if (e.key === 'End') goToSlide(images.length - 1);
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                goToSlide(currentSlide + 1);
            } else {
                // Swipe right - previous slide
                goToSlide(currentSlide - 1);
            }
        }
    }
}

// Initialize everything when page loads
window.addEventListener('DOMContentLoaded', () => {
    initSlider();
    initEventListeners();
    
    // Set initial button states
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    
    // Set ARIA labels
    prevBtn.setAttribute('aria-label', 'Previous slide');
    nextBtn.setAttribute('aria-label', 'Next slide');
    playBtn.setAttribute('aria-label', 'Autoplay is running');
    pauseBtn.setAttribute('aria-label', 'Pause autoplay');
    prevSlideBtn.setAttribute('aria-label', 'Previous slide');
    nextSlideBtn.setAttribute('aria-label', 'Next slide');
});