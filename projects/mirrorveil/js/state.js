const AppState = {
    modal: {
        isOpen: false,
        currentContent: null,
        previousFocus: null
    },
    
    tooltip: {
        isVisible: false,
        currentTarget: null,
        content: ''
    },
    
    navigation: {
        activeSection: 'hero',
        isMenuOpen: false,
        scrollPosition: 0
    },
    
    gallery: {
        selectedItem: null,
        items: []
    },
    
    animations: {
        scrollRevealElements: [],
        parallaxElements: []
    },
    
    observers: []
};

const StateManager = {
    subscribe(callback) {
        AppState.observers.push(callback);
        return () => {
            const index = AppState.observers.indexOf(callback);
            if (index > -1) {
                AppState.observers.splice(index, 1);
            }
        };
    },
    
    notify(type, data) {
        AppState.observers.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('Observer error:', error);
            }
        });
    },
    
    updateModal(isOpen, content = null) {
        const previousState = AppState.modal.isOpen;
        AppState.modal.isOpen = isOpen;
        AppState.modal.currentContent = content;
        
        if (isOpen && !previousState) {
            AppState.modal.previousFocus = document.activeElement;
        }
        
        this.notify('modal', { isOpen, content });
    },
    
    updateTooltip(isVisible, content = '', target = null) {
        AppState.tooltip.isVisible = isVisible;
        AppState.tooltip.content = content;
        AppState.tooltip.currentTarget = target;
        
        this.notify('tooltip', { isVisible, content, target });
    },
    
    updateNavigation(activeSection) {
        if (activeSection && activeSection !== AppState.navigation.activeSection) {
            AppState.navigation.activeSection = activeSection;
            this.notify('navigation', { activeSection });
        }
    },
    
    updateScrollPosition(position) {
        AppState.navigation.scrollPosition = position;
        this.notify('scroll', { position });
    },
    
    toggleMenu() {
        AppState.navigation.isMenuOpen = !AppState.navigation.isMenuOpen;
        this.notify('menu', { isOpen: AppState.navigation.isMenuOpen });
    },
    
    selectGalleryItem(item) {
        AppState.gallery.selectedItem = item;
        this.notify('gallery', { selectedItem: item });
    },
    
    registerScrollRevealElement(element) {
        if (!AppState.animations.scrollRevealElements.includes(element)) {
            AppState.animations.scrollRevealElements.push(element);
        }
    },
    
    registerParallaxElement(element) {
        if (!AppState.animations.parallaxElements.includes(element)) {
            AppState.animations.parallaxElements.push(element);
        }
    },
    
    getState() {
        return { ...AppState };
    },
    
    reset() {
        AppState.modal.isOpen = false;
        AppState.modal.currentContent = null;
        AppState.tooltip.isVisible = false;
        AppState.navigation.isMenuOpen = false;
        this.notify('reset', {});
    }
};

const ModalContent = {
    reflection: {
        title: 'Total Reflection',
        body: `
            <h3>Complete Horizontal Inversion</h3>
            <p>Every single element on this page is mirrored using <code>transform: scaleX(-1)</code> applied to the body element. This creates a permanent, unbreakable reflection of reality.</p>
            <p>There are no toggles, no escape hatches, no accessibility overrides. The inversion is intentional, permanent, and absolute.</p>
            <p>To read this comfortably, you might need to use a real mirror. That's the point.</p>
        `
    },
    
    interaction: {
        title: 'Perfect Interaction',
        body: `
            <h3>Coordinate System Adjustments</h3>
            <p>Despite the horizontal flip, all mouse interactions work perfectly. Click zones are precise, hover states are accurate, and tooltips position correctly.</p>
            <p>This is achieved through careful coordinate transformations in the JavaScript layer, ensuring that the inverted visual presentation doesn't break the underlying interaction logic.</p>
            <p>Try clicking around - everything just works.</p>
        `
    },
    
    design: {
        title: 'Elite Design',
        body: `
            <h3>Visual Excellence Through the Mirror</h3>
            <p>Glassmorphism effects with backdrop blur, vibrant HSL-based gradients, smooth 60fps animations, and carefully crafted micro-interactions.</p>
            <p>The design maintains its beauty and coherence even when horizontally flipped, proving that great design transcends orientation.</p>
            <p>Every color, shadow, and transition has been meticulously chosen to create a premium experience.</p>
        `
    },
    
    architecture: {
        title: 'Clean Architecture',
        body: `
            <h3>Modular Code Organization</h3>
            <p>The codebase is split into multiple focused files:</p>
            <ul>
                <li><strong>CSS:</strong> layout.css, typography.css, animations.css, theme.css</li>
                <li><strong>JavaScript:</strong> state.js, interactions.js, animations.js, utils.js</li>
            </ul>
            <p>State management is centralized, interactions are separated from animations, and utilities provide reusable helpers throughout the codebase.</p>
        `
    },
    
    motion: {
        title: 'Fluid Motion',
        body: `
            <h3>Performance-Optimized Animations</h3>
            <p>All animations use GPU-accelerated transforms and opacity changes. Scroll-triggered animations use Intersection Observer for efficiency.</p>
            <p>Parallax effects, stagger animations, and micro-interactions are all carefully timed and eased for a premium feel.</p>
            <p>The result: buttery smooth 60fps motion throughout the entire experience.</p>
        `
    },
    
    experience: {
        title: 'Unique Experience',
        body: `
            <h3>A Digital Experiment</h3>
            <p>Mirrorveil is more than a website - it's an artistic statement about perception, adaptation, and the malleability of digital interfaces.</p>
            <p>By forcing users to physically adapt (perhaps using a mirror), it challenges our assumptions about how we interact with technology.</p>
            <p>It's absurd, technically impressive, and strangely beautiful.</p>
        `
    }
};

if (typeof window !== 'undefined') {
    window.AppState = AppState;
    window.StateManager = StateManager;
    window.ModalContent = ModalContent;
}
