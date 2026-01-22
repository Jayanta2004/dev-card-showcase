
document.addEventListener("DOMContentLoaded", function () {
    const coords = { x: 0, y: 0 };
    const circles = document.querySelectorAll(".circle");

    circles.forEach(function (circle) {
        circle.x = 0;
        circle.y = 0;
    });

    window.addEventListener("mousemove", function (e) {
        coords.x = e.pageX;
        coords.y = e.pageY - window.scrollY; // Adjust for vertical scroll position
    });

    function animateCircles() {
        let x = coords.x;
        let y = coords.y;
        circles.forEach(function (circle, index) {
            circle.style.left = `${x - 12}px`;
            circle.style.top = `${y - 12}px`;
            circle.style.transform = `scale(${(circles.length - index) / circles.length})`;
            const nextCircle = circles[index + 1] || circles[0];
            circle.x = x;
            circle.y = y;
            x += (nextCircle.x - x) * 0.3;
            y += (nextCircle.y - y) * 0.3;
        });

        requestAnimationFrame(animateCircles);
    }

    animateCircles();
});


// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'light' ? '☀️' : '🌙';

    // Save preference
    localStorage.setItem('theme', newTheme);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Scroll progress indicator
const progressIndicator = document.getElementById('progressIndicator');
const progressDots = document.querySelectorAll('.progress-dot');
const sections = ['overview', 'core-guidelines', 'card-format', 'quick-reference'];

// Show progress indicator on scroll
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // Show/hide progress indicator
    if (scrollY > 300) {
        progressIndicator.style.display = 'block';
        setTimeout(() => {
            progressIndicator.style.opacity = '1';
        }, 10);
    } else {
        progressIndicator.style.opacity = '0';
        setTimeout(() => {
            progressIndicator.style.display = 'none';
        }, 300);
    }

    // Update active dot based on scroll position
    sections.forEach((sectionId, index) => {
        const section = document.getElementById(sectionId);
        if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
                progressDots.forEach(dot => dot.classList.remove('active'));
                progressDots[index].classList.add('active');
            }
        }
    });
});

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Checklist functionality
function toggleCheckbox(element) {
    element.classList.toggle('checked');

    // Check if all checkboxes are checked
    const checkboxes = document.querySelectorAll('.checklist-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.classList.contains('checked'));

    if (allChecked) {
        showCompletionMessage();
    }
}

function showCompletionMessage() {
    const checklist = document.getElementById('checklist');
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
            text-align: center;
            animation: fadeIn 0.5s ease;
        ">
            <i class="fas fa-check-circle" style="color: var(--guideline-success); font-size: 2rem; margin-bottom: 10px;"></i>
            <h3 style="color: var(--guideline-success); margin: 0 0 10px 0;">Checklist Complete! 🎉</h3>
            <p style="color: var(--text-secondary); margin: 0;">You're ready to submit your project!</p>
        </div>
    `;

    // Remove existing message if present
    const existingMessage = checklist.querySelector('.completion-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    message.classList.add('completion-message');
    checklist.appendChild(message);
}

// Enhanced hover effects for guideline items
document.querySelectorAll('.guideline-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-8px) scale(1.02)';
    });

    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0) scale(1)';
    });
});

// Add keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }

    // Navigate checklist with arrow keys
    if (e.target.classList.contains('checklist-checkbox') &&
        (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        toggleCheckbox(e.target);
    }
});

// Initialize tooltips for tech tags
document.querySelectorAll('.tech-tag').forEach(tag => {
    tag.addEventListener('mouseenter', (e) => {
        const rect = e.target.getBoundingClientRect();
        const tooltip = document.createElement('div');
        tooltip.textContent = 'Click to copy tag';
        tooltip.style.cssText = `
            position: fixed;
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            white-space: nowrap;
            z-index: 10000;
            border: 1px solid var(--border-primary);
            box-shadow: var(--shadow-md);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.top - 40}px`;
        tooltip.id = 'tag-tooltip';
        document.body.appendChild(tooltip);

        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
    });

    tag.addEventListener('mouseleave', () => {
        const tooltip = document.getElementById('tag-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.remove(), 200);
        }
    });

    // Copy tag on click
    tag.addEventListener('click', (e) => {
        const tagText = e.target.textContent;
        navigator.clipboard.writeText(tagText).then(() => {
            const originalText = e.target.innerHTML;
            e.target.innerHTML = '<i class="fas fa-check"></i> Copied!';
            e.target.style.background = 'linear-gradient(135deg, var(--guideline-success) 0%, var(--guideline-success) 100%)';
            e.target.style.color = 'white';

            setTimeout(() => {
                e.target.innerHTML = originalText;
                e.target.style.background = '';
                e.target.style.color = '';
            }, 2000);
        });
    });
});
