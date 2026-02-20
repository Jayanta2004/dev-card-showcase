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


document.addEventListener("navbarLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;

    if (!themeToggle) return;

    function setTheme(theme) {
        body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
    }

    function toggleTheme() {
        const currentTheme = body.getAttribute("data-theme") || "dark";
        setTheme(currentTheme === "dark" ? "light" : "dark");
    }

    setTheme(localStorage.getItem("theme") || "dark");
    themeToggle.addEventListener("click", toggleTheme);
});

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
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

// Contact Form functionality
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    
    // Character counter for message
    const messageInput = document.getElementById('messageText');
    const charCount = document.getElementById('charCount');
    const charCounter = document.getElementById('charCounter');
    
    if (messageInput && charCount) {
        messageInput.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCount.textContent = currentLength;
            
            if (currentLength >= 450) {
                charCounter.classList.add('warning');
            } else {
                charCounter.classList.remove('warning', 'error');
            }
            
            if (currentLength >= 500) {
                charCounter.classList.add('error');
            }
        });
    }

    // Form submission
    window.submitContact = function(event) {
        event.preventDefault();

        // Basic validation
        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('messageText').value;

        if (!name || !email || !message) {
            alert('Please fill in all required fields.');
            return;
        }

        // Show loading state
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<i class="fas fa-spinner"></i> Sending...';

        // Simulate API call
        setTimeout(() => {
            // Reset button
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = originalBtnContent;
            
            // Show success message
            successMessage.classList.add('show');
            
            // Reset form
            contactForm.reset();
            if (charCount) charCount.textContent = '0';
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 5000);
            
        }, 1500);
    };
}

// Scroll to top functionality
const scrollToTopBtn = document.getElementById("scrollToTop");

window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add("show");
    } else {
        scrollToTopBtn.classList.remove("show");
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
