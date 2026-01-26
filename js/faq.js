// FAQ INTERACTIVITY SCRIPT
document.addEventListener('DOMContentLoaded', function () {
    // 1. NAVBAR HAMBURGER TOGGLE
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.querySelector(".nav-links");
    
    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            hamburger.classList.toggle("active");
        });
    }

    // 2. UNIFIED THEME TOGGLE (SINGLE VERSION)
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const html = document.documentElement;

    // Check for saved theme or prefer color scheme
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    let savedTheme = localStorage.getItem('theme');

    // If no saved theme, use system preference
    if (!savedTheme) {
        savedTheme = prefersDarkScheme.matches ? 'dark' : 'light';
        localStorage.setItem('theme', savedTheme);
    }

    // Function to apply theme
    function applyTheme(theme) {
        // Apply to both html and body for compatibility
        html.setAttribute('data-theme', theme);
        body.setAttribute('data-theme', theme);
        
        // Update theme classes
        if (theme === 'light') {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
        } else {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
        }
        
        // Update button text
        themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', 
            theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
    }

    // Apply initial theme
    applyTheme(savedTheme);

    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    // Listen for system theme changes (only if user hasn't set preference)
    prefersDarkScheme.addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
        }
    });

    // 3. FAQ FUNCTIONALITY
    const categoryButtons = document.querySelectorAll(".faq-category-btn");
    const faqCards = document.querySelectorAll(".faq-card");
    const searchInput = document.querySelector(".faq-search");
    const noResultsHtml = `<div class="no-results">
        <i class="fas fa-search"></i>
        <h3>No matching questions found</h3>
        <p>Try searching with different keywords or browse all categories</p>
        </div>`;

    // Expand/collapse functionality
    faqCards.forEach((card) => {
        const expandBtn = card.querySelector(".expand-btn");
        const content = card.querySelector(".faq-content");
        const originalHeight = content.scrollHeight;

        // Set initial height
        content.style.maxHeight = "150px";
        content.style.overflow = "hidden";
        content.style.transition = "max-height 0.3s ease";

        expandBtn.addEventListener("click", function () {
            const isExpanded = content.style.maxHeight !== "150px";

            if (isExpanded) {
                content.style.maxHeight = "150px";
                this.classList.remove("expanded");
                this.innerHTML =
                    '<span>Read More</span><i class="fas fa-chevron-down"></i>';
                card.classList.remove("expanded");
            } else {
                content.style.maxHeight = originalHeight + "px";
                this.classList.add("expanded");
                this.innerHTML =
                    '<span>Show Less</span><i class="fas fa-chevron-up"></i>';
                card.classList.add("expanded");
            }
        });
    });

    // Category filtering
    categoryButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // Remove active class from all buttons
            categoryButtons.forEach((btn) => btn.classList.remove("active"));
            // Add active class to clicked button
            this.classList.add("active");

            const category = this.getAttribute("data-category");
            filterAndSearch(category, searchInput.value);
        });
    });

    // Search functionality
    searchInput.addEventListener("input", function () {
        const activeCategory = document.querySelector(".faq-category-btn.active");
        const category = activeCategory
            ? activeCategory.getAttribute("data-category")
            : "all";
        filterAndSearch(category, this.value);
    });

    function filterAndSearch(category, searchTerm) {
        let visibleCount = 0;
        searchTerm = searchTerm.toLowerCase().trim();

        faqCards.forEach((card) => {
            const cardCategory = card.getAttribute("data-category");
            const cardText = card.textContent.toLowerCase();
            const matchesCategory = category === "all" || cardCategory === category;
            const matchesSearch = searchTerm === "" || cardText.includes(searchTerm);

            if (matchesCategory && matchesSearch) {
                card.style.display = "flex";
                card.style.animation = "fadeInUp 0.5s ease forwards";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        // Show/hide no results message
        let noResults = document.querySelector(".no-results");
        if (visibleCount === 0) {
            if (!noResults) {
                document
                    .querySelector(".faq-container")
                    .insertAdjacentHTML("beforeend", noResultsHtml);
            }
        } else if (noResults) {
            noResults.remove();
        }

        // Update stats
        document.getElementById("answered-questions").textContent = visibleCount;
    }

    // Initialize with all cards visible
    filterAndSearch("all", "");

    // Add hover effect with slight delay for smoother experience
    faqCards.forEach((card) => {
        card.addEventListener("mouseenter", function () {
            this.style.transition =
                "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        });
    });

    // 4. INITIALIZE LUCIDE ICONS
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.querySelector('.dropdown');
    const dropBtn = document.querySelector('.drop-btn');
    
    if (dropdown && dropBtn) {
        dropBtn.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
        
        // Close dropdown when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
});

});