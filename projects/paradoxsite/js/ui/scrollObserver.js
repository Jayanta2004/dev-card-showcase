// js/ui/scrollObserver.js

export class ScrollObserver {
    constructor(selector) {
        this.selector = selector;
        this.observer = null;
    }

    init() {
        if (this.observer) {
            this.observer.disconnect();
        }

        const options = {
            root: document.querySelector('.reverse-scroll-container'),
            rootMargin: '0px',
            threshold: 0.1 // 10% visible
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Slight delay for organic feel
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, Math.random() * 200);
                    // Unobserve after revealing to prevent re-triggering animation on scroll up/down
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observe all current nodes
        document.querySelectorAll(this.selector).forEach(el => {
            if (!el.classList.contains('visible')) {
                this.observer.observe(el);
            }
        });
    }
}
