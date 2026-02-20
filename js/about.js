// Circle cursor animation
document.addEventListener("DOMContentLoaded", function () {
    const coords = { x: 0, y: 0 };
    const circles = document.querySelectorAll(".circle");

    circles.forEach(function (circle) {
        circle.x = 0;
        circle.y = 0;
    });

    window.addEventListener("mousemove", function (e) {
        coords.x = e.pageX;
        coords.y = e.pageY - window.scrollY;
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

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const themeToggle = document.getElementById('themeToggle');

    document.body.setAttribute('data-theme', savedTheme);
    if (themeToggle) themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';
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

// Theme toggle - SIMPLIFIED AND WORKING
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
    themeToggle.addEventListener('click', function () {
        const currentTheme = document.body.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.body.setAttribute('data-theme', newTheme);
        this.textContent = newTheme === 'light' ? '☀️' : '🌙';
        localStorage.setItem('theme', newTheme);
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Testimonial functionality
function addTestimonial() {
    const name = document.getElementById('username').value.trim();
    const feedback = document.getElementById('feedback').value.trim();

    if (!name || !feedback) {
        alert("Please fill both fields 😊");
        return;
    }

    const testimonialList = document.getElementById('testimonial-list');

    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `<h3>${name}</h3><p>"${feedback}"</p>`;

    testimonialList.prepend(card);

    const saved = JSON.parse(localStorage.getItem('testimonials') || '[]');
    saved.unshift({ name, feedback });
    localStorage.setItem('testimonials', JSON.stringify(saved));

    document.getElementById('username').value = '';
    document.getElementById('feedback').value = '';
}

// Load saved testimonials
window.addEventListener('load', () => {
    const saved = JSON.parse(localStorage.getItem('testimonials') || '[]');
    const testimonialList = document.getElementById('testimonial-list');

    saved.forEach(t => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.innerHTML = `<h3>${t.name}</h3><p>"${t.feedback}"</p>`;
        testimonialList.appendChild(card);
    });
});

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