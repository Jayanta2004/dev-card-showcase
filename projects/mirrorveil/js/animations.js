const AnimationController = {
    scrollRevealObserver: null,
    parallaxElements: [],
    rafId: null,

    init() {
        this.setupScrollReveal();
        this.setupParallax();
        this.initHeroAnimations();
    },

    setupScrollReveal() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        this.scrollRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    Utils.addClass(entry.target, 'revealed');
                    this.scrollRevealObserver.unobserve(entry.target);
                }
            });
        }, options);

        const revealElements = Utils.$$('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
        revealElements.forEach(el => {
            this.scrollRevealObserver.observe(el);
            StateManager.registerScrollRevealElement(el);
        });

        const featureCards = Utils.$$('.feature-card');
        featureCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            Utils.addClass(card, 'scroll-reveal');
            this.scrollRevealObserver.observe(card);
        });

        const galleryItems = Utils.$$('.gallery-item');
        galleryItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.08}s`;
            Utils.addClass(item, 'scroll-reveal-scale');
            this.scrollRevealObserver.observe(item);
        });
    },

    setupParallax() {
        this.parallaxElements = Utils.$$('.floating-orb');

        if (this.parallaxElements.length > 0 && !Utils.prefersReducedMotion()) {
            this.startParallax();
        }
    },

    startParallax() {
        const updateParallax = () => {
            const scrollY = Utils.getScrollTop();
            const viewportHeight = Utils.getViewportHeight();

            this.parallaxElements.forEach(el => {
                const speed = parseFloat(Utils.getAttr(el, 'data-speed')) || 0.5;
                const offset = el.getBoundingClientRect().top;

                if (offset < viewportHeight && offset > -el.offsetHeight) {
                    const yPos = -(scrollY * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                }
            });

            this.rafId = Utils.raf(updateParallax);
        };

        updateParallax();
    },

    initHeroAnimations() {
        const heroContent = Utils.$('.hero-content');
        if (heroContent) {
            Utils.addClass(heroContent, 'animate-in');
        }
    },

    animateModal(modal, isOpening) {
        if (isOpening) {
            Utils.setAttr(modal, 'aria-hidden', 'false');
            Utils.addClass(modal, 'animate-fade-in');

            const modalContent = Utils.$('.modal-content', modal);
            if (modalContent) {
                Utils.addClass(modalContent, 'animate-scale-in');
            }
        } else {
            Utils.setAttr(modal, 'aria-hidden', 'true');
            Utils.removeClass(modal, 'animate-fade-in');

            const modalContent = Utils.$('.modal-content', modal);
            if (modalContent) {
                Utils.removeClass(modalContent, 'animate-scale-in');
            }
        }
    },

    animateTooltip(tooltip, isShowing) {
        if (isShowing) {
            Utils.setAttr(tooltip, 'aria-hidden', 'false');
            Utils.addClass(tooltip, 'animate-fade-in');
        } else {
            Utils.setAttr(tooltip, 'aria-hidden', 'true');
            Utils.removeClass(tooltip, 'animate-fade-in');
        }
    },

    smoothScrollTo(targetY, duration = 800) {
        const startY = Utils.getScrollTop();
        const distance = targetY - startY;
        const startTime = performance.now();

        const scroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = Utils.easeInOutCubic(progress);

            window.scrollTo(0, startY + distance * eased);

            if (progress < 1) {
                Utils.raf(scroll);
            }
        };

        Utils.raf(scroll);
    },

    scrollToElement(element, offset = 80) {
        if (!element) return;

        const elementTop = Utils.getElementOffset(element).top;
        const targetY = elementTop - offset;

        this.smoothScrollTo(targetY);
    },

    pulseElement(element, duration = 600) {
        if (!element) return;

        Utils.addClass(element, 'animate-pulse');
        setTimeout(() => {
            Utils.removeClass(element, 'animate-pulse');
        }, duration);
    },

    destroy() {
        if (this.scrollRevealObserver) {
            this.scrollRevealObserver.disconnect();
        }

        if (this.rafId) {
            Utils.caf(this.rafId);
        }
    }
};

const ScrollTracker = {
    lastScrollY: 0,
    ticking: false,

    init() {
        this.lastScrollY = Utils.getScrollTop();
        Utils.on(window, 'scroll', this.handleScroll.bind(this));
    },

    handleScroll() {
        if (!this.ticking) {
            Utils.raf(() => {
                this.update();
                this.ticking = false;
            });
            this.ticking = true;
        }
    },

    update() {
        const currentScrollY = Utils.getScrollTop();

        StateManager.updateScrollPosition(currentScrollY);

        this.updateActiveSection();
        this.updateNavbarStyle(currentScrollY);

        this.lastScrollY = currentScrollY;
    },

    updateActiveSection() {
        const sections = Utils.$$('section[id]');
        const scrollY = Utils.getScrollTop();
        const viewportHeight = Utils.getViewportHeight();

        let activeSection = 'hero';

        sections.forEach(section => {
            const sectionTop = Utils.getElementOffset(section).top;
            const sectionHeight = section.offsetHeight;

            if (scrollY >= sectionTop - viewportHeight / 3 && scrollY < sectionTop + sectionHeight - viewportHeight / 3) {
                activeSection = section.id;
            }
        });

        StateManager.updateNavigation(activeSection);
    },

    updateNavbarStyle(scrollY) {
        const navbar = Utils.$('.navbar');
        if (!navbar) return;

        if (scrollY > 100) {
            Utils.addClass(navbar, 'scrolled');
        } else {
            Utils.removeClass(navbar, 'scrolled');
        }
    }
};

if (typeof window !== 'undefined') {
    window.AnimationController = AnimationController;
    window.ScrollTracker = ScrollTracker;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AnimationController.init();
            ScrollTracker.init();
        });
    } else {
        AnimationController.init();
        ScrollTracker.init();
    }
}
