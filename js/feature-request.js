// Cursor Trail functionality - ORIGINAL STYLE
document.addEventListener("DOMContentLoaded", function () {
    const coords = { x: 0, y: 0 };
    const circles = document.querySelectorAll(".circle");

    circles.forEach(function (circle) {
        circle.x = 0;
        circle.y = 0;
        circle.style.pointerEvents = "none"; // Ensure circles don't interfere
        // Set theme-specific color
        circle.style.background = "var(--cursor-trail-color)";
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

            // Update circle color based on current theme
            const isDark = document.body.classList.contains('theme-dark');
            circle.style.background = isDark
                ? 'rgba(56, 189, 248, 0.6)'
                : 'rgba(2, 132, 199, 0.5)';
        });

        requestAnimationFrame(animateCircles);
    }

    animateCircles();
});

const themeToggle = document.getElementById("themeToggle");

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";

if (savedTheme === "dark") {
    document.body.classList.add("theme-dark");
    themeToggle.textContent = "🌙";
} else {
    themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("theme-dark");

    themeToggle.textContent = isDark ? "🌙" : "☀️";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Navbar toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', function () {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        if (!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('active');
        if (navLinks) navLinks.classList.remove('active');
    });
});

// Character counter for textarea
const featureDescription = document.getElementById('featureDescription');
const charCounter = document.getElementById('charCounter');
const charCount = document.getElementById('charCount');

if (featureDescription && charCounter && charCount) {
    featureDescription.addEventListener('input', () => {
        const length = featureDescription.value.length;
        charCount.textContent = length;
    
        // Update counter color based on length
        if (length > 900) {
            charCounter.classList.add('warning');
            charCounter.classList.remove('error');
        } else if (length >= 1000) {
            charCounter.classList.add('error');
            charCounter.classList.remove('warning');
        } else {
            charCounter.classList.remove('warning', 'error');
        }
    });
}

// Form submission
async function submitFeatureRequest(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<i class="fas fa-spinner"></i> Submitting...';

    // Get form data
    const formData = {
        title: document.getElementById('featureTitle').value,
        description: document.getElementById('featureDescription').value,
        useCases: document.getElementById('useCases').value,
        priority: document.getElementById('priorityLevel').value,
        category: document.getElementById('category').value,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        page: window.location.href
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Store feature request locally (in a real app, this would be sent to a server)
    const requests = JSON.parse(localStorage.getItem('featureRequests') || '[]');
    requests.push(formData);
    localStorage.setItem('featureRequests', JSON.stringify(requests));

    // Show success message
    successMessage.classList.add('show');

    // Reset button
    submitBtn.classList.remove('loading');
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';

    // Reset form
    document.getElementById('featureRequestForm').reset();
    if (charCount) charCount.textContent = '0';
    if (charCounter) charCounter.classList.remove('warning', 'error');

    // Hide success message after 4 seconds
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 4000);

    // Log to console (for demo purposes)
    console.log('Feature Request submitted:', formData);
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', () => {
    const scrollBtn = document.getElementById('scrollToTop');
    if (window.pageYOffset > 300) {
        scrollBtn.classList.add('show');
    } else {
        scrollBtn.classList.remove('show');
    }
});

// Add some visual effects on page load
document.addEventListener('DOMContentLoaded', () => {
    // Animate container entrance
    const container = document.querySelector('.feature-request-container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
    
        setTimeout(() => {
            container.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }

    // Add focus styles to inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'translateY(-2px)';
        });

        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter to submit
    if (e.ctrlKey && e.key === 'Enter') {
        const btn = document.getElementById('submitBtn');
        if (btn) btn.click();
    }

    // Escape to clear form
    if (e.key === 'Escape') {
        const form = document.getElementById('featureRequestForm');
        if (form && confirm('Clear all form fields?')) {
            form.reset();
        }
    }
});
