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

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('theme-dark');
    themeToggle.textContent = '🌙';
} else {
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('theme-dark');
    const isDark = body.classList.contains('theme-dark');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Character counters
function setupCharCounter(textareaId, counterId, countId, maxLength) {
    const textarea = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    const count = document.getElementById(countId);

    textarea.addEventListener('input', () => {
        const currentLength = textarea.value.length;
        count.textContent = currentLength;
        if (currentLength > maxLength * 0.9) {
            counter.style.color = 'var(--error)';
        } else {
            counter.style.color = 'var(--text-muted)';
        }
    });
}

setupCharCounter('bugDescription', 'descCharCounter', 'descCharCount', 1000);
setupCharCounter('stepsToReproduce', 'stepsCharCounter', 'stepsCharCount', 500);

// File upload handling
const fileInput = document.getElementById('screenshots');
const fileList = document.getElementById('fileList');

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    fileList.innerHTML = '';

    if (files.length > 0) {
        const fileNames = files.map(file => `<div>• ${file.name} (${(file.size / 1024).toFixed(1)} KB)</div>`);
        fileList.innerHTML = '<strong>Selected files:</strong><br>' + fileNames.join('');
    }
});

// Form submission
async function submitBugReport(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        // Collect form data
        const formData = new FormData();
        formData.append('userName', document.getElementById('userName').value);
        formData.append('userEmail', document.getElementById('userEmail').value);
        formData.append('bugTitle', document.getElementById('bugTitle').value);
        formData.append('bugCategory', document.getElementById('bugCategory').value);
        formData.append('browser', document.getElementById('browser').value);
        formData.append('os', document.getElementById('os').value);
        formData.append('bugDescription', document.getElementById('bugDescription').value);
        formData.append('stepsToReproduce', document.getElementById('stepsToReproduce').value);

        // Add screenshots
        const screenshots = document.getElementById('screenshots').files;
        for (let i = 0; i < screenshots.length; i++) {
            formData.append('screenshots', screenshots[i]);
        }

        // For demo purposes, we'll simulate a successful submission
        // In a real implementation, you would send this to a backend API
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

        // Show success message
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.add('show');

        // Reset form
        document.getElementById('bugReportForm').reset();
        fileList.innerHTML = '';

        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);

    } catch (error) {
        console.error('Error submitting bug report:', error);

        // Show error message
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.classList.add('show');

        // Hide error message after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Auto-detect browser and OS
function detectBrowserAndOS() {
    const userAgent = navigator.userAgent;

    // Detect browser
    let browser = '';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'chrome';
    } else if (userAgent.includes('Firefox')) {
        browser = 'firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'safari';
    } else if (userAgent.includes('Edg')) {
        browser = 'edge';
    } else if (userAgent.includes('Opera')) {
        browser = 'opera';
    }

    // Detect OS
    let os = '';
    if (userAgent.includes('Windows')) {
        os = 'windows';
    } else if (userAgent.includes('Mac')) {
        os = 'macos';
    } else if (userAgent.includes('Linux')) {
        os = 'linux';
    } else if (userAgent.includes('Android')) {
        os = 'android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'ios';
    }

    // Pre-select detected values
    if (browser) {
        document.getElementById('browser').value = browser;
    }
    if (os) {
        document.getElementById('os').value = os;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    detectBrowserAndOS();
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