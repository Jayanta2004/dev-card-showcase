// Hall of Fame interactivity
const spotlightGrid = document.getElementById("spotlightGrid");
const milestoneList = document.getElementById("milestoneList");
const badgeGrid = document.getElementById("badgeGrid");
const streakGrid = document.getElementById("streakGrid");
const stats = document.querySelectorAll("[data-stat]");
const confettiCanvas = document.getElementById("confetti");

const topContributors = [
    {
        name: "Aarav Mehta",
        role: "Core Maintainer",
        monthlyWins: 3,
        yearlyWins: 1,
        streak: 38,
        avatar: "AM",
        badges: ["Impact", "Velocity", "Mentor"],
        milestone: "10th PR merged",
        profile: "https://github.com/Jayanta2004"
    },
    {
        name: "Sara Roy",
        role: "Contributor",
        monthlyWins: 2,
        yearlyWins: 0,
        streak: 21,
        avatar: "SR",
        badges: ["Streak", "Reviewer"],
        milestone: "1st PR merged",
        profile: "https://github.com/Jayanta2004"
    },
    {
        name: "Dev Patel",
        role: "Frontend Lead",
        monthlyWins: 1,
        yearlyWins: 1,
        streak: 15,
        avatar: "DP",
        badges: ["Design", "Impact"],
        milestone: "25th PR merged",
        profile: "https://github.com/Jayanta2004"
    },
    {
        name: "Isha Verma",
        role: "Open Source Champion",
        monthlyWins: 1,
        yearlyWins: 0,
        streak: 12,
        avatar: "IV",
        badges: ["Community", "Velocity"],
        milestone: "5th PR merged",
        profile: "https://github.com/Jayanta2004"
    }
];

const milestones = [
    { title: "First Pull Request", desc: "Shipped a first-time contribution and passed review.", icon: "✨" },
    { title: "10th Pull Request", desc: "Consistent impact across multiple features.", icon: "🔥" },
    { title: "25th Pull Request", desc: "Reliably shipping across releases.", icon: "🚀" },
    { title: "100 Contributions", desc: "Legend status unlocked with triple-digit commits.", icon: "🏅" }
];

const badges = [
    { label: "Impact", desc: "High-value fixes and features", icon: "💡" },
    { label: "Velocity", desc: "Ships early and often", icon: "⚡" },
    { label: "Streak", desc: "10+ consecutive days", icon: "📆" },
    { label: "Reviewer", desc: "Thoughtful code reviews", icon: "🧭" },
    { label: "Design", desc: "Elevates user experience", icon: "🎨" },
    { label: "Community", desc: "Helps newcomers", icon: "🤝" },
    { label: "Mentor", desc: "Guides first-time PRs", icon: "🧑‍🏫" }
];

const streaks = [
    { name: "Aarav Mehta", days: 38, focus: "Frontend" },
    { name: "Sara Roy", days: 21, focus: "Docs & QA" },
    { name: "Dev Patel", days: 15, focus: "UI Polish" },
    { name: "Isha Verma", days: 12, focus: "Bug fixes" }
];

const updateStats = () => {
    const counts = {
        streaks: streaks.length,
        monthly: topContributors.filter((c) => c.monthlyWins > 0).length,
        yearly: topContributors.filter((c) => c.yearlyWins > 0).length,
        badges: badges.length
    };

    stats.forEach((stat) => {
        const key = stat.dataset.stat;
        if (counts[key] !== undefined) stat.textContent = counts[key];
    });
};

const buildBadgeChips = (list) => list.map((b) => `<span class="badge">${b}</span>`).join("");

const renderSpotlights = () => {
    spotlightGrid.innerHTML = "";
    topContributors.forEach((person) => {
        const card = document.createElement("article");
        card.className = "spotlight-card";
        card.setAttribute("data-tilt", "");
        card.setAttribute("data-tilt-max", "10");
        card.setAttribute("data-tilt-speed", "500");
        card.innerHTML = `
            <div class="spotlight-header">
                <div class="avatar">${person.avatar}</div>
                <div>
                    <h3>${person.name}</h3>
                    <div class="meta-line">${person.role} · <span class="streak">${person.streak}-day streak</span></div>
                </div>
            </div>
            <p>${person.milestone}</p>
            <div class="meta-line">${buildBadgeChips(person.badges)}</div>
            <div class="card-actions">
                <span class="meta-line">Monthly: ${person.monthlyWins} · Yearly: ${person.yearlyWins}</span>
                <a class="ghost-btn" href="${person.profile}" target="_blank" rel="noopener">Profile</a>
            </div>
        `;
        spotlightGrid.appendChild(card);
    });
};

const renderMilestones = () => {
    milestoneList.innerHTML = "";
    milestones.forEach((item) => {
        const row = document.createElement("div");
        row.className = "timeline-item";
        row.innerHTML = `
            <h4>${item.icon} ${item.title}</h4>
            <p>${item.desc}</p>
        `;
        milestoneList.appendChild(row);
    });
};

const renderBadges = () => {
    badgeGrid.innerHTML = "";
    badges.forEach((badge) => {
        const card = document.createElement("div");
        card.className = "badge-card";
        card.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <strong>${badge.label}</strong>
            <small>${badge.desc}</small>
        `;
        badgeGrid.appendChild(card);
    });
};

const renderStreaks = () => {
    streakGrid.innerHTML = "";
    streaks.forEach((s) => {
        const card = document.createElement("div");
        card.className = "streak-card";
        card.innerHTML = `
            <div class="streak-days">${s.days} days</div>
            <strong>${s.name}</strong>
            <p class="section-subtitle">${s.focus}</p>
        `;
        streakGrid.appendChild(card);
    });
};

// Confetti
const startConfetti = () => {
    const ctx = confettiCanvas.getContext("2d");
    const particles = [];
    const colors = ["#38bdf8", "#f59e0b", "#8b5cf6", "#22c55e"];
    const W = confettiCanvas.width = window.innerWidth;
    const H = confettiCanvas.height = window.innerHeight;

    for (let i = 0; i < 120; i++) {
        particles.push({
            x: Math.random() * W,
            y: Math.random() * H - H,
            r: Math.random() * 6 + 4,
            d: Math.random() * 0.9 + 0.4,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 6 - 3,
            tiltAngleIncrement: Math.random() * 0.07 + 0.02,
            tiltAngle: Math.random() * Math.PI
        });
    }

    let frame; // to stop later if needed
    const draw = () => {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p) => {
            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();
        });
        update();
        frame = requestAnimationFrame(draw);
    };

    const update = () => {
        particles.forEach((p, i) => {
            p.tiltAngle += p.tiltAngleIncrement;
            p.y += (Math.cos(p.d) + p.r + 2) * 0.6;
            p.x += Math.sin(p.d);
            p.tilt = Math.sin(p.tiltAngle) * 8;

            if (p.y > H) {
                particles[i] = { ...p, y: -10, x: Math.random() * W };
            }
        });
    };

    draw();
    setTimeout(() => cancelAnimationFrame(frame), 4000);
};

// Theme + nav + circles reused patterns
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
            circle.style.left = `${x - 12}px`;
            circle.style.top = `${y - 12}px`;
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

const setupCelebrate = () => {
    const btn = document.getElementById("celebrateTop");
    if (!btn) return;
    btn.addEventListener("click", startConfetti);
};

window.addEventListener("DOMContentLoaded", () => {
    setupTheme();
    setupNav();
    setupCircles();
    renderSpotlights();
    renderMilestones();
    renderBadges();
    renderStreaks();
    updateStats();
    setupCelebrate();
});
