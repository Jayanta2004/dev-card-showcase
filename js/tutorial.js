// Tutorial interactions
const steps = [
    {
        id: "fork",
        title: "Fork the repository",
        meta: "GitHub UI · 1 min",
        preview: "Creates your copy so you can push changes.",
        code: "Open the repo on GitHub and click Fork. No CLI needed.",
        snippet: "# In GitHub UI\n# Click Fork to create your copy",
        status: "Ready"
    },
    {
        id: "clone",
        title: "Clone your fork",
        meta: "Terminal · 2 min",
        preview: "Downloads your fork locally.",
        code: "Replace USERNAME with your GitHub username.",
        snippet: "git clone https://github.com/USERNAME/dev-card-showcase.git\ncd dev-card-showcase",
        status: "Ready"
    },
    {
        id: "branch",
        title: "Create a branch",
        meta: "Terminal · 1 min",
        preview: "Keeps your changes isolated and reviewable.",
        code: "Use a descriptive branch name for the feature or fix.",
        snippet: "git checkout -b feature/tutorial-page",
        status: "Ready"
    },
    {
        id: "edit",
        title: "Edit & preview",
        meta: "VS Code · 10-20 min",
        preview: "Update HTML/CSS/JS and use Live Server to see changes.",
        code: "Save files and refresh the browser to view updates.",
        snippet: "# example: update a card\ncode .\n# edit files then check in browser",
        status: "In progress"
    },
    {
        id: "commit",
        title: "Commit your work",
        meta: "Terminal · 2 min",
        preview: "Creates a snapshot of your changes.",
        code: "Commit only what you need. Keep messages short and clear.",
        snippet: "git status\ngit add .\ngit commit -m \"Add tutorial page\"",
        status: "Ready"
    },
    {
        id: "push",
        title: "Push to your fork",
        meta: "Terminal · 1 min",
        preview: "Uploads commits to your fork on GitHub.",
        code: "If first push, set upstream to your branch.",
        snippet: "git push -u origin feature/tutorial-page",
        status: "Ready"
    },
    {
        id: "pr",
        title: "Open a pull request",
        meta: "GitHub UI · 2 min",
        preview: "Proposes your changes to the main repo.",
        code: "Fill the PR template and link any related issues.",
        snippet: "# GitHub UI\n# Compare your branch and open PR",
        status: "Pending review"
    }
];

const mistakes = [
    { title: "Forgot to create a branch", fix: "Create a new branch and cherry-pick commits or start clean." },
    { title: "Upstream out of date", fix: "git fetch upstream && git merge upstream/main" },
    { title: "Unstaged files", fix: "Use git status then git add <files>" },
    { title: "CI failing", fix: "Read the logs, fix lint errors, and push again." }
];

const faqs = [
    { q: "Live preview not updating?", a: "Ensure your dev server is running or refresh after saving files." },
    { q: "Permission denied on push?", a: "Push to your fork URL (origin) and ensure you set the correct remote." },
    { q: "Merge conflicts?", a: "Pull latest main, resolve conflicts locally, then commit and push." }
];

const checklistItems = [
    "Forked the repository",
    "Cloned and installed dependencies (if any)",
    "Created a feature branch",
    "Ran through the steps without errors",
    "Tested UI in the browser",
    "Committed with a clear message",
    "Pushed to your fork",
    "Opened a PR with details"
];

const timelineContainer = document.getElementById("timeline");
const stepList = document.getElementById("stepList");
const previewLabel = document.getElementById("previewLabel");
const previewStep = document.getElementById("previewStep");
const previewBody = document.getElementById("previewBody");
const codeSnippet = document.getElementById("codeSnippet");
const codeTitle = document.getElementById("codeTitle");
const mistakeGrid = document.getElementById("mistakeGrid");
const accordion = document.getElementById("accordion");
const checklist = document.getElementById("checklist");
const checkProgress = document.getElementById("checkProgress");

const renderSteps = () => {
    stepList.innerHTML = "";
    steps.forEach((step, index) => {
        const card = document.createElement("article");
        card.className = "step-card";
        card.dataset.id = step.id;
        card.innerHTML = `
            <div class="step-meta">Step ${index + 1} · ${step.meta}</div>
            <h3>${step.title}</h3>
            <p class="section-subtitle">${step.preview}</p>
        `;
        stepList.appendChild(card);
    });
};

const selectStep = (id) => {
    const step = steps.find((s) => s.id === id);
    if (!step) return;
    document.querySelectorAll(".step-card").forEach((c) => c.classList.toggle("active", c.dataset.id === id));
    previewStep.textContent = step.title;
    previewBody.textContent = step.code;
    codeTitle.textContent = `Commands (${step.status})`;
    codeSnippet.textContent = step.snippet;
    const node = document.querySelector(`.node[data-step='${id}']`);
    if (node) {
        document.querySelectorAll(".node").forEach((n) => n.classList.remove("active"));
        node.classList.add("active");
    }
};

const renderTimeline = () => {
    timelineContainer.innerHTML = "";
    steps.forEach((step, idx) => {
        const card = document.createElement("div");
        card.className = "timeline-card";
        card.innerHTML = `
            <div class="status">${idx + 1} / ${steps.length}</div>
            <h4>${step.title}</h4>
            <p>${step.preview}</p>
        `;
        timelineContainer.appendChild(card);
    });
};

const renderMistakes = () => {
    mistakeGrid.innerHTML = "";
    mistakes.forEach((item) => {
        const card = document.createElement("div");
        card.className = "mistake-card";
        card.innerHTML = `
            <h4>${item.title}</h4>
            <p>${item.fix}</p>
        `;
        mistakeGrid.appendChild(card);
    });
};

const renderAccordion = () => {
    accordion.innerHTML = "";
    faqs.forEach((faq, idx) => {
        const item = document.createElement("div");
        item.className = "accordion-item";
        item.innerHTML = `
            <div class="accordion-header" data-idx="${idx}">
                <h4>${faq.q}</h4>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            <div class="accordion-body">${faq.a}</div>
        `;
        accordion.appendChild(item);
    });
};

const renderChecklist = () => {
    checklist.innerHTML = "";
    checklistItems.forEach((text, idx) => {
        const row = document.createElement("label");
        row.className = "check-item";
        row.innerHTML = `
            <input type="checkbox" data-check="${idx}" />
            <div>
                <strong>${text}</strong>
                <p class="check-text">Mark this when completed.</p>
            </div>
        `;
        checklist.appendChild(row);
    });
    updateChecklistProgress();
};

const updateChecklistProgress = () => {
    const boxes = checklist.querySelectorAll("input[type='checkbox']");
    const done = Array.from(boxes).filter((b) => b.checked).length;
    checkProgress.textContent = `${done}/${boxes.length} done`;
};

const setupStepClicks = () => {
    stepList.addEventListener("click", (event) => {
        const card = event.target.closest(".step-card");
        if (!card) return;
        selectStep(card.dataset.id);
    });
};

const setupAccordion = () => {
    accordion.addEventListener("click", (event) => {
        const header = event.target.closest(".accordion-header");
        if (!header) return;
        const item = header.parentElement;
        item.classList.toggle("open");
    });
};

const setupChecklist = () => {
    checklist.addEventListener("change", (event) => {
        if (event.target.matches("input[type='checkbox']")) updateChecklistProgress();
    });
};

const setupTheme = () => {
    const toggle = document.getElementById("themeToggle");
    const saved = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", saved);
    if (toggle) {
        toggle.textContent = saved === "light" ? "☀️" : "🌙";
        toggle.addEventListener("click", () => {
            const next = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
            document.body.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
            toggle.textContent = next === "light" ? "☀️" : "🌙";
        });
    }
};

const setupNav = () => {
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
    circles.forEach((circle) => { circle.x = 0; circle.y = 0; });

    window.addEventListener("mousemove", (e) => {
        coords.x = e.pageX;
        coords.y = e.pageY - window.scrollY;
    });

    const animate = () => {
        let x = coords.x;
        let y = coords.y;
        circles.forEach((circle, idx) => {
            circle.style.left = `${x - 11}px`;
            circle.style.top = `${y - 11}px`;
            circle.style.transform = `scale(${(circles.length - idx) / circles.length})`;
            const next = circles[idx + 1] || circles[0];
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
    setupNav();
    setupCircles();
    renderSteps();
    selectStep("fork");
    renderTimeline();
    renderMistakes();
    renderAccordion();
    renderChecklist();
    setupStepClicks();
    setupAccordion();
    setupChecklist();
});
