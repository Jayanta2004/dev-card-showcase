// =========================================
// CURSOR TRAIL ANIMATION
// =========================================
let circles = [];
let mouse = { x: 0, y: 0 };

const cursor = {
    delay: 18,
    _x: 0,
    _y: 0,
    endX: window.innerWidth / 2,
    endY: window.innerHeight / 2,
    cursorVisible: true,
    cursorEnlarged: false,
    $dot: document.querySelector('.cursor-dot'),
    $outline: document.querySelector('.cursor-dot-outline'),

    init: function() {
        this.dotSize = this.$dot.offsetWidth;
        this.outlineSize = this.$outline.offsetWidth;

        this.setupEventListeners();
        this.animateDotOutline();
    },

    setupEventListeners: function() {
        const self = this;

        document.querySelectorAll('a, button').forEach(function(el) {
            el.addEventListener('mouseover', function() {
                self.cursorEnlarged = true;
                self.toggleCursorSize();
            });
            el.addEventListener('mouseout', function() {
                self.cursorEnlarged = false;
                self.toggleCursorSize();
            });
        });

        document.addEventListener('mousedown', function() {
            self.cursorEnlarged = true;
            self.toggleCursorSize();
        });
        document.addEventListener('mouseup', function() {
            self.cursorEnlarged = false;
            self.toggleCursorSize();
        });

        document.addEventListener('mousemove', function(e) {
            self.cursorVisible = true;
            self.toggleCursorVisibility();

            self.endX = e.pageX;
            self.endY = e.pageY;
            self.$dot.style.top = self.endY + 'px';
            self.$dot.style.left = self.endX + 'px';
        });

        document.addEventListener('mouseenter', function(e) {
            self.cursorVisible = true;
            self.toggleCursorVisibility();
            self.$dot.style.opacity = 1;
            self.$outline.style.opacity = 1;
        });

        document.addEventListener('mouseleave', function(e) {
            self.cursorVisible = false;
            self.toggleCursorVisibility();
            self.$dot.style.opacity = 0;
            self.$outline.style.opacity = 0;
        });
    },

    animateDotOutline: function() {
        const self = this;

        self._x += (self.endX - self._x) / self.delay;
        self._y += (self.endY - self._y) / self.delay;
        self.$outline.style.top = self._y + 'px';
        self.$outline.style.left = self._x + 'px';

        requestAnimationFrame(this.animateDotOutline.bind(self));
    },

    toggleCursorSize: function() {
        const self = this;

        if (self.cursorEnlarged) {
            self.$dot.style.transform = 'translate(-50%, -50%) scale(0.75)';
            self.$outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        } else {
            self.$dot.style.transform = 'translate(-50%, -50%) scale(1)';
            self.$outline.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    },

    toggleCursorVisibility: function() {
        const self = this;

        if (self.cursorVisible) {
            self.$dot.style.opacity = 1;
            self.$outline.style.opacity = 1;
        } else {
            self.$dot.style.opacity = 0;
            self.$outline.style.opacity = 0;
        }
    }
};

// =========================================
// THEME TOGGLE FUNCTIONALITY
// =========================================
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.classList.toggle('theme-dark', currentTheme === 'dark');
    updateThemeIcon();

    themeToggle.addEventListener('click', function() {
        const isDark = body.classList.toggle('theme-dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon();
    });

    function updateThemeIcon() {
        const isDark = body.classList.contains('theme-dark');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// =========================================
// MOBILE NAVIGATION
// =========================================
function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// =========================================
// SCROLL TO TOP FUNCTIONALITY
// =========================================
function initScrollToTop() {
    const scrollToTopBtn = document.querySelector('.scroll-to-top');

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =========================================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// =========================================
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// =========================================
// TABLE OF CONTENTS HIGHLIGHTING
// =========================================
function initTOCHighlighting() {
    const tocLinks = document.querySelectorAll('.toc a');
    const sections = document.querySelectorAll('.terms-content h2');

    function highlightTOC() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightTOC);
    highlightTOC(); // Initial call
}

// =========================================
// INITIALIZATION
// =========================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cursor trail
    cursor.init();

    // Initialize theme toggle
    initThemeToggle();

    // Initialize mobile navigation
    initMobileNav();

    // Initialize scroll to top
    initScrollToTop();

    // Initialize smooth scrolling
    initSmoothScrolling();

    // Initialize TOC highlighting
    initTOCHighlighting();

    // Add loading animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// =========================================
// LOADING ANIMATION
// =========================================
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});