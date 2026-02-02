const InteractionManager = {
    modal: null,
    modalBackdrop: null,
    modalBody: null,
    modalClose: null,
    tooltip: null,
    tooltipContent: null,

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupStateObserver();
    },

    cacheElements() {
        this.modal = Utils.$('#modal');
        this.modalBackdrop = Utils.$('#modal-backdrop');
        this.modalBody = Utils.$('#modal-body');
        this.modalClose = Utils.$('#modal-close');
        this.tooltip = Utils.$('#tooltip');
        this.tooltipContent = Utils.$('#tooltip-content');
    },

    setupEventListeners() {
        this.setupNavigationListeners();
        this.setupModalListeners();
        this.setupCardListeners();
        this.setupGalleryListeners();
        this.setupButtonListeners();
        this.setupKeyboardListeners();
    },

    setupNavigationListeners() {
        const navLinks = Utils.$$('.nav-link');
        navLinks.forEach(link => {
            Utils.on(link, 'click', (e) => {
                e.preventDefault();
                const sectionId = Utils.getAttr(link, 'data-section');
                const section = Utils.$(`#${sectionId}`);

                if (section) {
                    AnimationController.scrollToElement(section);
                }
            });
        });

        const navToggle = Utils.$('#nav-toggle');
        if (navToggle) {
            Utils.on(navToggle, 'click', () => {
                StateManager.toggleMenu();
            });
        }

        const footerLinks = Utils.$$('.footer-link');
        footerLinks.forEach(link => {
            Utils.on(link, 'click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const section = Utils.$(href);
                    if (section) {
                        AnimationController.scrollToElement(section);
                    }
                }
            });
        });
    },

    setupModalListeners() {
        if (this.modalClose) {
            Utils.on(this.modalClose, 'click', () => {
                this.closeModal();
            });
        }

        if (this.modalBackdrop) {
            Utils.on(this.modalBackdrop, 'click', () => {
                this.closeModal();
            });
        }
    },

    setupCardListeners() {
        const featureCards = Utils.$$('.feature-card');
        featureCards.forEach(card => {
            const actionButton = Utils.$('.card-action', card);

            if (actionButton) {
                Utils.on(actionButton, 'click', (e) => {
                    e.stopPropagation();
                    const modalType = Utils.getAttr(actionButton, 'data-modal');
                    this.openModal(modalType);
                });
            }

            Utils.on(card, 'click', () => {
                const actionButton = Utils.$('.card-action', card);
                if (actionButton) {
                    const modalType = Utils.getAttr(actionButton, 'data-modal');
                    this.openModal(modalType);
                }
            });

            Utils.on(card, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const actionButton = Utils.$('.card-action', card);
                    if (actionButton) {
                        const modalType = Utils.getAttr(actionButton, 'data-modal');
                        this.openModal(modalType);
                    }
                }
            });
        });
    },

    setupGalleryListeners() {
        const galleryItems = Utils.$$('.gallery-item');
        galleryItems.forEach(item => {
            Utils.on(item, 'click', () => {
                const galleryId = Utils.getAttr(item, 'data-gallery');
                const title = Utils.$('.gallery-title', item)?.textContent || 'Gallery Item';
                const caption = Utils.$('.gallery-caption', item)?.textContent || '';

                this.openGalleryModal(title, caption, galleryId);
            });

            Utils.on(item, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const galleryId = Utils.getAttr(item, 'data-gallery');
                    const title = Utils.$('.gallery-title', item)?.textContent || 'Gallery Item';
                    const caption = Utils.$('.gallery-caption', item)?.textContent || '';

                    this.openGalleryModal(title, caption, galleryId);
                }
            });
        });
    },

    setupButtonListeners() {
        const btnExplore = Utils.$('#btn-explore');
        const btnEnter = Utils.$('#btn-enter');
        const btnHeroStart = Utils.$('#btn-hero-start');
        const btnHeroLearn = Utils.$('#btn-hero-learn');

        if (btnExplore) {
            Utils.on(btnExplore, 'click', () => {
                const featuresSection = Utils.$('#features');
                AnimationController.scrollToElement(featuresSection);
            });
        }

        if (btnEnter) {
            Utils.on(btnEnter, 'click', () => {
                const gallerySection = Utils.$('#gallery');
                AnimationController.scrollToElement(gallerySection);
            });
        }

        if (btnHeroStart) {
            Utils.on(btnHeroStart, 'click', () => {
                const featuresSection = Utils.$('#features');
                AnimationController.scrollToElement(featuresSection);
            });
        }

        if (btnHeroLearn) {
            Utils.on(btnHeroLearn, 'click', () => {
                const aboutSection = Utils.$('#about');
                AnimationController.scrollToElement(aboutSection);
            });
        }
    },

    setupKeyboardListeners() {
        Utils.on(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                if (AppState.modal.isOpen) {
                    this.closeModal();
                }
            }
        });
    },

    setupStateObserver() {
        StateManager.subscribe((type, data) => {
            if (type === 'modal') {
                this.handleModalStateChange(data);
            } else if (type === 'navigation') {
                this.handleNavigationStateChange(data);
            } else if (type === 'tooltip') {
                this.handleTooltipStateChange(data);
            }
        });
    },

    openModal(contentType) {
        const content = ModalContent[contentType];
        if (!content) {
            console.error('Modal content not found:', contentType);
            return;
        }

        StateManager.updateModal(true, content);
    },

    openGalleryModal(title, caption, galleryId) {
        const content = {
            title: title,
            body: `
                <p>${caption}</p>
                <p class="text-secondary" style="margin-top: 1rem;">Gallery item #${galleryId}</p>
                <p style="margin-top: 1rem;">This is a demonstration of the modal system working perfectly despite the horizontal inversion. All interactions remain precise and intuitive.</p>
            `
        };

        StateManager.updateModal(true, content);
    },

    closeModal() {
        StateManager.updateModal(false);
    },

    handleModalStateChange(data) {
        if (!this.modal || !this.modalBody) return;

        if (data.isOpen && data.content) {
            this.modalBody.innerHTML = `
                <h2 style="margin-bottom: 1rem;">${data.content.title}</h2>
                ${data.content.body}
            `;

            AnimationController.animateModal(this.modal, true);
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                if (this.modalClose) {
                    this.modalClose.focus();
                }
            }, 100);
        } else {
            AnimationController.animateModal(this.modal, false);
            document.body.style.overflow = '';

            if (AppState.modal.previousFocus) {
                AppState.modal.previousFocus.focus();
            }
        }
    },

    handleNavigationStateChange(data) {
        const navLinks = Utils.$$('.nav-link');
        navLinks.forEach(link => {
            const section = Utils.getAttr(link, 'data-section');
            if (section === data.activeSection) {
                Utils.addClass(link, 'active');
            } else {
                Utils.removeClass(link, 'active');
            }
        });
    },

    handleTooltipStateChange(data) {
        if (!this.tooltip || !this.tooltipContent) return;

        if (data.isVisible && data.content) {
            this.tooltipContent.textContent = data.content;
            this.positionTooltip(data.target);
            AnimationController.animateTooltip(this.tooltip, true);
        } else {
            AnimationController.animateTooltip(this.tooltip, false);
        }
    },

    positionTooltip(target) {
        if (!target || !this.tooltip) return;

        const targetRect = target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();

        const left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        const top = targetRect.top - tooltipRect.height - 10;

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }
};

if (typeof window !== 'undefined') {
    window.InteractionManager = InteractionManager;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            InteractionManager.init();
        });
    } else {
        InteractionManager.init();
    }
}
