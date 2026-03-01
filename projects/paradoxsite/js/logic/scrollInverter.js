// js/logic/scrollInverter.js
export class ScrollInverter {
    constructor(container) {
        this.container = container;
        this.isScrolling = false;
        this.lastScrollTop = 0;
        this.fakeScrollPosition = 0;
        this.scrollFactor = 1.5;
        this.enabled = true;
    }

    init() {
        // We override the wheel event to create a "reverse" feel
        // Scrolling "down" visually moves content "up" 
        // Note: Because we use flex-direction: column-reverse, standard scrolling usually feels weird.
        // We intercept the scroll to normalize it.

        this.container.addEventListener('wheel', (e) => {
            if (!this.enabled) return;

            // e.deltaY > 0 is scrolling down (towards user)
            // e.deltaY < 0 is scrolling up (away from user)

            e.preventDefault();

            // In a reverse column, scrolling UP means going backwards in time (down the page)
            // Scrolling DOWN means going forward in time (up the page)
            const scrollAmount = e.deltaY * this.scrollFactor;

            // Add slight easing by using requestAnimationFrame
            this.smoothScrollBy(-scrollAmount);
        }, { passive: false });

        // Handle touch events for mobile
        let touchStart = 0;
        this.container.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].clientY;
        }, { passive: true });

        this.container.addEventListener('touchmove', (e) => {
            if (!this.enabled) return;
            e.preventDefault();
            const touchCurrent = e.touches[0].clientY;
            const delta = touchStart - touchCurrent;
            this.smoothScrollBy(delta * this.scrollFactor);
            touchStart = touchCurrent;
        }, { passive: false });
    }

    smoothScrollBy(amount) {
        this.container.scrollBy({
            top: amount,
            behavior: 'smooth'
        });
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }

    scrollToBottom() {
        // Because of flex-direction: column-reverse, bottom is scrollTop = 0
        this.container.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    scrollToTop() {
        this.container.scrollTo({
            top: this.container.scrollHeight,
            behavior: 'smooth'
        });
    }
}
