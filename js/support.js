// Theme and FAQ functionality for support page
// Theme toggle functionality
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem("theme") || "light";
if (currentTheme === "dark") {
    body.classList.add("theme-dark");
    themeToggle.textContent = "🌙";
} else {
    themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
    body.classList.toggle("theme-dark");
    const isDark = body.classList.contains("theme-dark");
    themeToggle.textContent = isDark ? "🌙" : "☀️";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

// FAQ accordion functionality
document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains("active");

        // Close all FAQ items
        document.querySelectorAll(".faq-item").forEach((item) => {
            item.classList.remove("active");
            item.querySelector(".faq-answer").setAttribute("aria-hidden", "true");
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add("active");
            faqItem.querySelector(".faq-answer").setAttribute("aria-hidden", "false");
        }
    });
});

// Search functionality
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchBtn = document.getElementById("searchBtn");

// Search data - questions and answers
const searchData = [
    {
        question: "How do I add my profile card to the showcase?",
        answer:
            "To add your profile card: 1. Fork the repository on GitHub 2. Clone your forked repository 3. Add your information to projects.json 4. Add your profile image 5. Commit and create a pull request",
        category: "getting-started",
    },
    {
        question: "What are the requirements for profile images?",
        answer:
            "Profile images should be JPG/PNG/GIF, max 2MB, square aspect ratio, at least 200x200px",
        category: "getting-started",
    },
    {
        question: "How do I contribute a project?",
        answer:
            "Create a folder in projects/, add your files, test locally, create README, submit PR",
        category: "contributing",
    },
    {
        question: "What types of projects are accepted?",
        answer:
            "Interactive apps, games, utilities, experiments, educational content built with web technologies",
        category: "contributing",
    },
    {
        question: "Why isn't my project displaying correctly?",
        answer:
            "Check paths, CORS issues, JavaScript errors, styling, responsive design",
        category: "technical",
    },
    {
        question: "How do I fix CORS errors?",
        answer:
            "Use proxy, JSONP, host locally, use CORS-enabled APIs, development server",
        category: "technical",
    },
    {
        question: "How do I update my profile?",
        answer: "Fork repo, update projects.json, replace image, submit PR",
        category: "account",
    },
    {
        question: "Can I remove my profile?",
        answer:
            "Yes, create GitHub issue requesting removal with verification details",
        category: "account",
    },
];

function performSearch(query) {
    if (!query.trim()) {
        searchResults.style.display = "none";
        return;
    }

    const results = searchData.filter(
        (item) =>
            item.question.toLowerCase().includes(query.toLowerCase()) ||
            item.answer.toLowerCase().includes(query.toLowerCase()),
    );

    if (results.length === 0) {
        searchResults.innerHTML =
            '<div class="no-results">No results found. Try different keywords or check our FAQ section below.</div>';
        searchResults.style.display = "block";
        return;
    }

    const resultsHTML = results
        .map(
            (result) => `
        <div class="faq-item" data-category="${result.category}">
          <button class="faq-question">
            ${result.question}
            <i class="fas fa-chevron-down faq-icon"></i>
          </button>
          <div class="faq-answer" aria-hidden="true">
            <div class="faq-content">
              <p>${result.answer}</p>
            </div>
          </div>
        </div>
      `,
        )
        .join("");

    searchResults.innerHTML = `<h3>Search Results (${results.length})</h3>${resultsHTML}`;
    searchResults.style.display = "block";

    // Add click handlers to search results
    searchResults.querySelectorAll(".faq-question").forEach((button) => {
        button.addEventListener("click", () => {
            const faqItem = button.parentElement;
            const isActive = faqItem.classList.contains("active");

            // Close all in search results
            searchResults.querySelectorAll(".faq-item").forEach((item) => {
                item.classList.remove("active");
                item.querySelector(".faq-answer").setAttribute("aria-hidden", "true");
            });

            if (!isActive) {
                faqItem.classList.add("active");
                faqItem
                    .querySelector(".faq-answer")
                    .setAttribute("aria-hidden", "false");
            }
        });
    });
}

// Search input handler
searchInput.addEventListener("input", (e) => {
    performSearch(e.target.value);
});

// Search button handler
searchBtn.addEventListener("click", () => {
    performSearch(searchInput.value);
});

// Enter key handler
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        performSearch(searchInput.value);
    }
});

// Category card click handlers
document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
        const category = card.dataset.category;
        const faqSection = document.getElementById("faq-section");

        // Scroll to FAQ section
        faqSection.scrollIntoView({ behavior: "smooth" });

        // Filter FAQs by category
        document.querySelectorAll(".faq-item").forEach((item) => {
            if (item.dataset.category === category) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
            });
        }
    });
});
