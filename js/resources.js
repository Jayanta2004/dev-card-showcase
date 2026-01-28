// Learning Hub interactivity
const resources = [
    {
        id: "git-101",
        title: "Git Basics: First Commit",
        description: "Install Git, configure your username, and make your first commit end-to-end.",
        topics: ["git"],
        level: "beginner",
        format: "tutorial",
        url: "https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup"
    },
    {
        id: "git-cheatsheet",
        title: "Git & GitHub Cheat Sheet",
        description: "Printable commands for staging, branching, and collaborating on GitHub.",
        topics: ["git"],
        level: "beginner",
        format: "cheatsheet",
        url: "https://education.github.com/git-cheat-sheet-education.pdf"
    },
    {
        id: "git-branching",
        title: "Interactive Git Branching",
        description: "Learn branching, merging, and rebasing with a visual playground.",
        topics: ["git"],
        level: "intermediate",
        format: "interactive",
        url: "https://learngitbranching.js.org/"
    },
    {
        id: "opensource-guide",
        title: "How to Contribute to Open Source",
        description: "Understand issues, forks, pull requests, and respectful collaboration.",
        topics: ["open-source", "git"],
        level: "beginner",
        format: "guide",
        url: "https://opensource.guide/how-to-contribute/"
    },
    {
        id: "first-timers",
        title: "First Timers Only",
        description: "Find beginner-friendly issues and learn the etiquette of your first PR.",
        topics: ["open-source", "git"],
        level: "beginner",
        format: "guide",
        url: "https://www.firsttimersonly.com/"
    },
    {
        id: "html-basics",
        title: "HTML: Structure a Page",
        description: "Semantics, forms, and accessibility-first habits for clean markup.",
        topics: ["html"],
        level: "beginner",
        format: "tutorial",
        url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML"
    },
    {
        id: "css-flexbox",
        title: "CSS Flexbox Guide",
        description: "Practical flexbox patterns for responsive layouts and alignment.",
        topics: ["css"],
        level: "beginner",
        format: "guide",
        url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/"
    },
    {
        id: "css-responsive",
        title: "Responsive Design Basics",
        description: "Fluid grids, media queries, and modern viewport units.",
        topics: ["css"],
        level: "beginner",
        format: "tutorial",
        url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design"
    },
    {
        id: "js-first-steps",
        title: "JavaScript First Steps",
        description: "Variables, functions, events, and DOM updates with hands-on snippets.",
        topics: ["javascript"],
        level: "beginner",
        format: "tutorial",
        url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps"
    },
    {
        id: "js-dom",
        title: "DOM Basics",
        description: "Manipulate elements, listen to events, and wire simple widgets.",
        topics: ["javascript"],
        level: "intermediate",
        format: "guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction"
    },
    {
        id: "js-fetch",
        title: "Fetch API Quickstart",
        description: "Learn fetch(), handle JSON, and show loading states without a framework.",
        topics: ["javascript"],
        level: "intermediate",
        format: "guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
    },
    {
        id: "project-landing",
        title: "HTML/CSS Starter Project",
        description: "Build a responsive landing page with semantic HTML and clean CSS.",
        topics: ["html", "css"],
        level: "beginner",
        format: "project",
        url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/"
    },
    {
        id: "video-git",
        title: "Git & GitHub for Beginners (Video)",
        description: "Fast visual walkthrough of commits, branches, and pull requests.",
        topics: ["git"],
        level: "beginner",
        format: "video",
        url: "https://www.youtube.com/watch?v=USjZcfj8yxE"
    },
    {
        id: "video-html-css",
        title: "HTML & CSS Crash Course (Video)",
        description: "Layout a page, style it responsively, and publish it.",
        topics: ["html", "css"],
        level: "beginner",
        format: "video",
        url: "https://www.youtube.com/watch?v=mU6anWqZJcc"
    }
];

const resourceGrid = document.getElementById("resourceGrid");
const bookmarkList = document.getElementById("bookmarkList");
const bookmarkStat = document.querySelector('[data-stat="bookmarks"]');
const stats = document.querySelectorAll("[data-stat]");
const searchInput = document.getElementById("resourceSearch");
const clearSearchBtn = document.getElementById("clearSearch");
const topicFilters = document.getElementById("topicFilters");
const clearBookmarksBtn = document.getElementById("clearBookmarks");
const showBookmarksBtn = document.getElementById("showBookmarks");
let activeTopic = "all";

const getBookmarks = () => {
    try {
        return JSON.parse(localStorage.getItem("resourceBookmarks") || "[]");
    } catch (e) {
        return [];
    }
};

const setBookmarks = (ids) => {
    localStorage.setItem("resourceBookmarks", JSON.stringify(ids));
    renderBookmarks();
    updateStats();
};

const updateStats = () => {
    const counts = {
        total: resources.length,
        beginner: resources.filter((r) => r.level === "beginner").length,
        cheatsheet: resources.filter((r) => r.format === "cheatsheet").length,
        bookmarks: getBookmarks().length
    };

    stats.forEach((stat) => {
        const key = stat.dataset.stat;
        if (counts[key] !== undefined) {
            stat.textContent = counts[key];
        }
    });
};

const buildTopicChips = (topics) => {
    return topics
        .map((topic) => `<span class="topic-chip">${topic.toUpperCase()}</span>`)
        .join("");
};

const buildCard = (resource, bookmarked) => {
    const article = document.createElement("article");
    article.className = "resource-card";
    article.innerHTML = `
        <div class="resource-meta">
            <span class="tag">${resource.format}</span>
            <span class="tag">${resource.level}</span>
        </div>
        <h3>${resource.title}</h3>
        <div class="topics">${buildTopicChips(resource.topics)}</div>
        <p>${resource.description}</p>
        <div class="card-actions">
            <a class="primary-btn" href="${resource.url}" target="_blank" rel="noopener">Open resource <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            <button class="bookmark-btn ${bookmarked ? "saved" : ""}" data-id="${resource.id}" type="button">
                <i class="fa-solid fa-bookmark"></i> ${bookmarked ? "Saved" : "Bookmark"}
            </button>
        </div>
    `;
    return article;
};

const renderResources = () => {
    const bookmarks = getBookmarks();
    const query = searchInput.value.trim().toLowerCase();

    const filtered = resources.filter((resource) => {
        const matchesTopic = activeTopic === "all" || resource.topics.includes(activeTopic);
        const haystack = `${resource.title} ${resource.description} ${resource.format} ${resource.topics.join(" ")}`.toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        return matchesTopic && matchesQuery;
    });

    resourceGrid.innerHTML = "";

    if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "resource-card";
        empty.innerHTML = "<p>No resources match that search. Try a different topic.</p>";
        resourceGrid.appendChild(empty);
        return;
    }

    filtered.forEach((resource) => {
        const card = buildCard(resource, bookmarks.includes(resource.id));
        resourceGrid.appendChild(card);
    });
};

const renderBookmarks = () => {
    const savedIds = getBookmarks();
    bookmarkList.innerHTML = "";

    if (!savedIds.length) {
        bookmarkList.innerHTML = "<p class=\"section-subtitle\">No bookmarks yet. Save a card to pin it here.</p>";
        return;
    }

    savedIds
        .map((id) => resources.find((r) => r.id === id))
        .filter(Boolean)
        .forEach((resource) => {
            const item = document.createElement("div");
            item.className = "bookmark-item";
            item.innerHTML = `
                <strong>${resource.title}</strong>
                <p class="section-subtitle">${resource.description}</p>
                <div class="bookmark-actions">
                    <a class="inline-link" href="${resource.url}" target="_blank" rel="noopener">Open</a>
                    <button class="ghost-btn" data-remove="${resource.id}" type="button">Remove</button>
                </div>
            `;
            bookmarkList.appendChild(item);
        });
};

const toggleBookmark = (id) => {
    const bookmarks = getBookmarks();
    const exists = bookmarks.includes(id);
    const updated = exists ? bookmarks.filter((b) => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    renderResources();
};

const setupFilters = () => {
    topicFilters.addEventListener("click", (event) => {
        const btn = event.target.closest("button[data-topic]");
        if (!btn) return;
        activeTopic = btn.dataset.topic;
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderResources();
    });
};

const setupSearch = () => {
    searchInput.addEventListener("input", renderResources);
    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        renderResources();
        searchInput.focus();
    });
};

const setupBookmarkActions = () => {
    resourceGrid.addEventListener("click", (event) => {
        const btn = event.target.closest(".bookmark-btn");
        if (!btn) return;
        toggleBookmark(btn.dataset.id);
    });

    bookmarkList.addEventListener("click", (event) => {
        const removeBtn = event.target.closest("button[data-remove]");
        if (!removeBtn) return;
        toggleBookmark(removeBtn.dataset.remove);
    });

    clearBookmarksBtn.addEventListener("click", () => {
        setBookmarks([]);
        renderResources();
    });

    if (showBookmarksBtn) {
        showBookmarksBtn.addEventListener("click", () => {
            document.getElementById("bookmarkPanel").scrollIntoView({ behavior: "smooth" });
        });
    }
};

const setupTheme = () => {
    const themeToggle = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", savedTheme);
    if (themeToggle) {
        themeToggle.textContent = savedTheme === "light" ? "☀️" : "🌙";
        themeToggle.addEventListener("click", () => {
            const current = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
            document.body.setAttribute("data-theme", current);
            localStorage.setItem("theme", current);
            themeToggle.textContent = current === "light" ? "☀️" : "🌙";
        });
    }
};

const setupNavbar = () => {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");
    if (!hamburger || !navLinks) return;
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navLinks.classList.toggle("active");
    });
};

const setupCircles = () => {
    const coords = { x: 0, y: 0 };
    const circles = document.querySelectorAll(".circle");
    circles.forEach((circle) => {
        circle.x = 0;
        circle.y = 0;
    });

    window.addEventListener("mousemove", (e) => {
        coords.x = e.pageX;
        coords.y = e.pageY - window.scrollY;
    });

    const animate = () => {
        let x = coords.x;
        let y = coords.y;

        circles.forEach((circle, index) => {
            circle.style.left = `${x - 12}px`;
            circle.style.top = `${y - 12}px`;
            circle.style.transform = `scale(${(circles.length - index) / circles.length})`;
            const next = circles[index + 1] || circles[0];
            circle.x = x;
            circle.y = y;
            x += (next.x - x) * 0.3;
            y += (next.y - y) * 0.3;
        });
        requestAnimationFrame(animate);
    };

    animate();
};

window.addEventListener("DOMContentLoaded", () => {
    setupTheme();
    setupNavbar();
    setupCircles();
    setupFilters();
    setupSearch();
    setupBookmarkActions();
    renderBookmarks();
    renderResources();
    updateStats();
});
