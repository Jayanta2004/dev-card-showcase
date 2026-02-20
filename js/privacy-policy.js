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


    // Theme Toggle Functionality
    document.addEventListener('DOMContentLoaded', function() {
      const themeToggle = document.getElementById('themeToggle');
      const htmlElement = document.documentElement;
      
      // Check for saved theme preference or use light as default
      const savedTheme = localStorage.getItem('theme') || 'light';
      
      // Set initial theme
      htmlElement.setAttribute('data-theme', savedTheme);
      updateThemeIcon(savedTheme);
      
      // Toggle theme on button click
      themeToggle.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
      });
      
      // Update theme icon
      function updateThemeIcon(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
      }
    });

    // Hamburger menu toggle
    document.addEventListener('DOMContentLoaded', function() {
      const hamburger = document.getElementById('hamburger');
      const navLinks = document.getElementById('navLinks');
      
      if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
          navLinks.classList.toggle('active');
          hamburger.classList.toggle('active');
        });
      }
    });

    // Scroll to top functionality
    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Show/hide scroll to top button based on scroll position
    window.addEventListener('scroll', function() {
      const scrollToTopBtn = document.getElementById('scrollToTop');
      if (scrollToTopBtn) {
        if (window.scrollY > 300) {
          scrollToTopBtn.style.display = 'flex';
        } else {
          scrollToTopBtn.style.display = 'none';
        }
      }
    });
  

    // Theme Toggle Functionality
    document.addEventListener('DOMContentLoaded', function() {
      const themeToggle = document.getElementById('themeToggle');
      const htmlElement = document.documentElement;
      
      // Check for saved theme preference or use light as default
      const savedTheme = localStorage.getItem('theme') || 'light';
      
      // Set initial theme
      htmlElement.setAttribute('data-theme', savedTheme);
      updateThemeIcon(savedTheme);
      
      // Toggle theme on button click
      themeToggle.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
      });
      
      // Update theme icon
      function updateThemeIcon(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
      }
    });

    // Hamburger menu toggle
    document.addEventListener('DOMContentLoaded', function() {
      const hamburger = document.getElementById('hamburger');
      const navLinks = document.getElementById('navLinks');
      
      if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
          navLinks.classList.toggle('active');
          hamburger.classList.toggle('active');
        });
      }
    });

    // Scroll to top functionality
    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Enhanced Reading Progress & TOC Tracking
    document.addEventListener("DOMContentLoaded", function () {
      const progressBar = document.getElementById('progressBar');
      const progressText = document.getElementById('progressText');
      const progressCircle = document.getElementById('progressCircle');
      const tocLinks = document.querySelectorAll('#tocList a');
      const sections = document.querySelectorAll('h2[id]');
      
      // Reading progress tracking
      function updateProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        if (progressBar) progressBar.style.width = scrollPercent + '%';
        if (progressText) progressText.textContent = Math.round(scrollPercent) + '%';
        
        // Update circular progress
        if (progressCircle) {
          const circumference = 2 * Math.PI * 18;
          const offset = circumference - (scrollPercent / 100) * circumference;
          progressCircle.style.strokeDashoffset = offset;
        }
      }
      
      // Active section tracking
      function updateActiveSection() {
        let current = '';
        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
          }
        });
        
        tocLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === current) {
            link.classList.add('active');
          }
        });
      }
      
      // Smooth scroll for TOC links
      tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
      
      // Scroll event listeners
      window.addEventListener('scroll', function() {
        updateProgress();
        updateActiveSection();
      });
      
      // Initial calls
      updateProgress();
      updateActiveSection();
    });

    // Enhanced animations on scroll
    document.addEventListener('DOMContentLoaded', function() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, observerOptions);
      
      // Observe all sections
      document.querySelectorAll('h2, .privacy-content > p, .privacy-content > ul').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });
    });
