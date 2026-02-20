document.addEventListener("DOMContentLoaded", () => {
  function initNavbarLogic() {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");
    const toggleBtn = document.getElementById("themeToggle");
    const body = document.body;

    if (hamburger && navLinks) {
      hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
      });
    }

    if (toggleBtn) {
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
    }
  }

  const navbarObserver = new MutationObserver(() => {
    if (document.getElementById("themeToggle")) {
      initNavbarLogic();
      navbarObserver.disconnect();
    }
  });

  navbarObserver.observe(document.body, { childList: true, subtree: true });

  const categoryButtons = document.querySelectorAll(".faq-category-btn");
  const faqCards = document.querySelectorAll(".faq-card");
  const searchInput = document.querySelector(".faq-search");

  if (!faqCards.length) return;

  const noResultsHtml = `
    <div class="no-results">
      <i class="fas fa-search"></i>
      <h3>No matching questions found</h3>
      <p>Try searching with different keywords or browse all categories</p>
    </div>
  `;

  faqCards.forEach(card => {
    const expandBtn = card.querySelector(".expand-btn");
    const content = card.querySelector(".faq-content");
    const originalHeight = content.scrollHeight;

    content.style.maxHeight = "150px";
    content.style.overflow = "hidden";
    content.style.transition = "max-height 0.3s ease";

    expandBtn.addEventListener("click", () => {
      const expanded = content.style.maxHeight !== "150px";

      if (expanded) {
        content.style.maxHeight = "150px";
        expandBtn.innerHTML = `<span>Read More</span><i class="fas fa-chevron-down"></i>`;
        card.classList.remove("expanded");
      } else {
        content.style.maxHeight = originalHeight + "px";
        expandBtn.innerHTML = `<span>Show Less</span><i class="fas fa-chevron-up"></i>`;
        card.classList.add("expanded");
      }
    });
  });

  function filterAndSearch(category, searchTerm) {
    let visibleCount = 0;
    searchTerm = searchTerm.toLowerCase().trim();

    faqCards.forEach(card => {
      const matchesCategory =
        category === "all" || card.dataset.category === category;
      const matchesSearch =
        !searchTerm || card.textContent.toLowerCase().includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = "flex";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    const container = document.querySelector(".faq-container");
    let noResults = document.querySelector(".no-results");

    if (visibleCount === 0 && !noResults) {
      container.insertAdjacentHTML("beforeend", noResultsHtml);
    } else if (visibleCount > 0 && noResults) {
      noResults.remove();
    }

    const answered = document.getElementById("answered-questions");
    if (answered) answered.textContent = visibleCount;
  }

  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filterAndSearch(btn.dataset.category, searchInput.value);
    });
  });

  searchInput.addEventListener("input", () => {
    const active = document.querySelector(".faq-category-btn.active");
    filterAndSearch(active?.dataset.category || "all", searchInput.value);
  });

  filterAndSearch("all", "");
});

