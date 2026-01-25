//   <!-- NAVBAR SCRIPT -->

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

{
    /* //   <!-- THEME TOGGLE --> */
}
const toggleBtn = document.getElementById("themeToggle");
const body = document.body;

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "dark";
body.setAttribute("data-theme", savedTheme);
toggleBtn.textContent = savedTheme === "light" ? "☀️" : "🌙";

toggleBtn.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    body.setAttribute("data-theme", newTheme);
    toggleBtn.textContent = newTheme === "light" ? "☀️" : "🌙";
    localStorage.setItem("theme", newTheme);
});

{
    /* <!-- FAQ INTERACTIVITY --> */
}

document.addEventListener("DOMContentLoaded", function () {
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
});


document.addEventListener('DOMContentLoaded', function() {
            const themeToggle = document.getElementById('themeToggle');
            const body = document.body;

            // Function to set theme
            function setTheme(theme) {
                body.setAttribute('data-theme', theme);
                if (theme === 'light') {
                    body.classList.add('light-mode');
                } else {
                    body.classList.remove('light-mode');
                }
                localStorage.setItem('theme', theme);
                themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
            }

            // Function to toggle theme
            function toggleTheme() {
                const currentTheme = body.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
            }

            // Load saved theme or default to dark
            const savedTheme = localStorage.getItem('theme') || 'dark';
            setTheme(savedTheme);

            // Add event listener to theme toggle button
            themeToggle.addEventListener('click', toggleTheme);
});