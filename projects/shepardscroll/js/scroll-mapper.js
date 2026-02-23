class ScrollMapper {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scrollY = 0;
        this.prevScrollY = 0;
        this.velocity = 0;
        this.smoothVelocity = 0;
        this.progress = 0;

        // Configuration
        this.scrollFactor = 0.0005; // Sensitivity of pitch change
        this.smoothing = 0.95; // Smoothing for velocity

        this.init();
    }

    init() {
        this.container.addEventListener('scroll', () => {
            this.scrollY = this.container.scrollTop;
        });

        // Loop for smoothing and velocity calculation
        this.update();
    }

    update() {
        // Calculate raw velocity
        const rawVelocity = this.scrollY - this.prevScrollY;

        // Smooth velocity using lerp
        this.smoothVelocity = this.smoothVelocity * this.smoothing + rawVelocity * (1 - this.smoothing);

        // Update progress based on scroll position
        // We use scrollY to drive the absolute pitch, but it loops every X pixels
        this.progress = (this.scrollY * this.scrollFactor) % 1;

        this.prevScrollY = this.scrollY;

        requestAnimationFrame(() => this.update());
    }

    getProgress() {
        return this.progress;
    }

    getVelocity() {
        return this.smoothVelocity;
    }
}

window.ScrollMapper = ScrollMapper;
