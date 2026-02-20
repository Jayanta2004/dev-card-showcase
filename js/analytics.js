let statsContainer,
    activityList,
    topContributors,
    allContributors,
    repoInfo,
    refreshBtn,
    lastUpdated,
    themeToggle,
    hamburger,
    navLinks,
    scrollToTopBtn,
    contributorSearch,
    exportBtn,
    exportModal,
    exportModalClose,
    exportCancel,
    exportConfirm,
    exportPreview;

document.addEventListener("DOMContentLoaded", () => {
    statsContainer = document.getElementById("statsContainer");
    activityList = document.getElementById("activityList");
    topContributors = document.getElementById("topContributors");
    allContributors = document.getElementById("allContributors");
    repoInfo = document.getElementById("repoInfo");
    refreshBtn = document.getElementById("refreshBtn");
    lastUpdated = document.getElementById("lastUpdated");
    scrollToTopBtn = document.getElementById("scrollToTop");
    contributorSearch = document.getElementById("contributorSearch");

    exportBtn = document.getElementById("exportBtn");
    exportModal = document.getElementById("exportModal");
    exportModalClose = document.getElementById("exportModalClose");
    exportCancel = document.getElementById("exportCancel");
    exportConfirm = document.getElementById("exportConfirm");
    exportPreview = document.getElementById("exportPreview");

    if (exportBtn) exportBtn.addEventListener("click", openExportModal);
    if (exportModalClose) exportModalClose.addEventListener("click", closeExportModal);
    if (exportCancel) exportCancel.addEventListener("click", closeExportModal);
    if (exportConfirm) exportConfirm.addEventListener("click", handleExport);

    loadAllData();
});


let refreshLocked = false;

function getCache(key, maxAge = 5 * 60 * 1000) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, time } = JSON.parse(cached);
    if (Date.now() - time > maxAge) return null;

    return data;
}

function setCache(key, data) {
    try {
        // For commits, only cache a summary (e.g., dates)
        if (key === "commits" && Array.isArray(data)) {
            // Only store commit dates, not full objects
            const summary = data.map(c => ({
                date: c.date || (c.commit && c.commit.author && c.commit.author.date)
            }));
            localStorage.setItem(key, JSON.stringify({ data: summary, time: Date.now() }));
        } else {
            localStorage.setItem(key, JSON.stringify({ data, time: Date.now() }));
        }
    } catch (e) {
        if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
            console.warn("Cache quota exceeded for", key, "- skipping cache.");
        } else {
            throw e;
        }
    }
}

function disableRefreshUntilReset(minutes = 10) {
    refreshLocked = true;
    refreshBtn.disabled = true;
    refreshBtn.textContent = `Retry in ${minutes} min`;

    setTimeout(() => {
        refreshLocked = false;
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Analytics';
    }, minutes * 60 * 1000);

}

let chartsInitialized = false;

function initCharts(commits, languages) {
    createContributorsChart(commits);
    createLanguagesChart(languages);
    chartsInitialized = true;
}

function refreshCharts(contributors, languages) {
    updateContributorsChart(contributors);
    updateLanguagesChart(languages);
}
function buildContributorGrowth(commits) {
    const map = {};


    commits.forEach(c => {
        // Try to get the date string in YYYY-MM-DD format from various possible fields
        let dateStr = c.date || (c.commit && c.commit.author && c.commit.author.date) || (c.commit && c.commit.committer && c.commit.committer.date);
        if (dateStr) {
            const day = new Date(dateStr).toISOString().split("T")[0];
            map[day] = (map[day] || 0) + 1;
        }
    });

    const sortedDates = Object.keys(map).sort();
    const labels = sortedDates; // show all days
    const data = labels.map(d => map[d]);

    return { labels, data };
}



function createContributorsChart(commits) {
    const ctx = document.getElementById("contributorsChart").getContext("2d");
    console.log("[DEBUG] Commits data for chart:", commits);
    const growth = buildContributorGrowth(commits);

    // If no data, show a message on the chart
    if (!growth.labels.length || !growth.data.length) {
        // Clear the canvas and show a message
        const canvas = document.getElementById("contributorsChart");
        const ctx2d = canvas.getContext("2d");
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        ctx2d.font = "20px Arial";
        ctx2d.fillStyle = "#888";
        ctx2d.textAlign = "center";
        ctx2d.fillText("No data available", canvas.width / 2, canvas.height / 2);
        return;
    }

    charts.contributorsChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: growth.labels,
            datasets: [{
                label: "Commits per day",
                data: growth.data,
                borderColor: "#4facfe", // vibrant blue
                backgroundColor: "rgba(76, 172, 254, 0.15)", // semi-transparent fill
                pointBackgroundColor: "#00cdac", // accent color for points
                pointBorderColor: "#fff",
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: baseChartOptions()
    });
}
function updateContributorsChart(commits) {
    const growth = buildContributorGrowth(commits);
    const chart = charts.contributorsChart;

    chart.data.labels = growth.labels;
    chart.data.datasets[0].data = growth.data;
    chart.update("none");
}
function createLanguagesChart(languages) {
    const ctx = document.getElementById("languagesChart").getContext("2d");

    charts.languagesChart = new Chart(ctx, {
        type: "doughnut",
        data: buildLanguageData(languages),
        options: {
            ...baseChartOptions(),
        }
    });
}
function updateLanguagesChart(languages) {
    const chart = charts.languagesChart;
    const data = buildLanguageData(languages);

    chart.data.labels = data.labels;
    chart.data.datasets[0].data = data.datasets[0].data;
    chart.update("none");
}
function buildLanguageData(languages) {
    const labels = Object.keys(languages);
    const values = Object.values(languages);
    const total = values.reduce((a, b) => a + b, 0);

    return {
        labels,
        datasets: [{
            data: values.map(v => Math.round((v / total) * 100)),
            backgroundColor: [
                "#667eea", "#764ba2", "#4facfe", "#00cdac", "#f093fb"
            ]
        }]
    };
}
function baseChartOptions() {
    const isLight = document.body.getAttribute("data-theme") === "light";

    return {
        responsive: true,
        animation: false,
        plugins: {
            legend: {
                labels: {
                    color: isLight ? "#333" : "#e2e8f0"
                }
            }
        },
        scales: {
            x: {
                ticks: { color: isLight ? "#333" : "#e2e8f0" }
            },
            y: {
                beginAtZero: true,   // ✅ THIS FIXES INVISIBLE LINE
                ticks: { color: isLight ? "#333" : "#e2e8f0" }
            }
        }
    };
}


// api rate limiting 
function isRateLimited(response) {
    return (
        response.status === 403 &&
        response.headers.get("x-ratelimit-remaining") === "0"
    );
}

function getRateLimitReset(response) {
    const reset = response.headers.get("x-ratelimit-reset");
    return reset ? new Date(reset * 1000) : null;
}



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
});

// Configuration
const GITHUB_API = "https://api.github.com";
const REPO_OWNER = "jayanta2004";
const REPO_NAME = "dev-card-showcase";
const GITHUB_TOKEN = ""; // Add your token here if needed

// State
let contributorsData = [];
let commitsData = [];
let repoData = {};
let charts = {};


document.addEventListener("navbarLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = document.body.getAttribute("data-theme") || "dark";
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.body.setAttribute("data-theme", newTheme);
            themeToggle.textContent = newTheme === "light" ? "☀️" : "🌙";
            localStorage.setItem("theme", newTheme);
            updateChartsTheme();
        });
    }
    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadAllData);
    }

});

// Initialize
document.addEventListener("DOMContentLoaded", function () {
    // Initialize theme
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", savedTheme);
    themeToggle.textContent = savedTheme === "light" ? "☀️" : "🌙";

    // Load data
    loadAllData();

    // Set up auto-refresh
    setInterval(() => {
        if (!document.hidden && !refreshLocked) {
            loadAllData();
        }
    }, 300000); // 5 minutes
});

// Navbar Toggle
// if (hamburger && navLinks) {
//     hamburger.addEventListener("click", () => {
//         navLinks.classList.toggle("active");
//     });
// }

// if (themeToggle) {
//     themeToggle.addEventListener("click", () => {
//         const currentTheme = document.body.getAttribute("data-theme") || "dark";
//         const newTheme = currentTheme === "dark" ? "light" : "dark";
//         document.body.setAttribute("data-theme", newTheme);
//         themeToggle.textContent = newTheme === "light" ? "☀️" : "🌙";
//         localStorage.setItem("theme", newTheme);
//         updateChartsTheme();
//     });
// }
// if (refreshBtn) {
//     refreshBtn.addEventListener("click", loadAllData);
// }

// Scroll to Top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}

window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add("show");
    } else {
        scrollToTopBtn.classList.remove("show");
    }
});

// Time Filter
document.querySelectorAll(".time-filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
        document
            .querySelectorAll(".time-filter-btn")
            .forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        // In a real app, you would filter data based on the selected period
    });
});

// Chart Controls
document.querySelectorAll(".chart-control-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
        const chartType = this.dataset.chartType;
        const chartWrapper = this.closest(".chart-wrapper");
        const chartId = chartWrapper.querySelector("canvas")?.id;

        document
            .querySelectorAll(".chart-control-btn")
            .forEach((b) => b.classList.remove("active"));
        this.classList.add("active");

        if (chartId && charts[chartId]) {
            charts[chartId].config.type = chartType;
            charts[chartId].update();
        }
    });
});

// GitHub API Headers
function getHeaders() {
    const headers = {
        Accept: "application/vnd.github.v3+json",
    };
    if (GITHUB_TOKEN) {
        headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }
    return headers;
}

// Fetch Repository Data
async function fetchRepoData() {
    try {
        const response = await fetch(
            `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}`,
            { headers: getHeaders() },
        );

        if (!response.ok) {
            if (isRateLimited(response)) {
                const resetTime = getRateLimitReset(response);
                throw new Error(
                    `GitHub API rate limit reached. Try again after ${resetTime?.toLocaleTimeString()}`
                );
            }
            throw new Error(`GitHub API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching repo data:", error);
        throw error;
    }
}

// Fetch Contributors
async function fetchContributors() {
    try {
        const response = await fetch(
            `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contributors`,
            { headers: getHeaders() },
        );

        if (!response.ok) {
            if (isRateLimited(response)) {
                const resetTime = getRateLimitReset(response);
                throw new Error(
                    `rate limit reached until ${resetTime?.toLocaleTimeString()}`
                );
            }
            throw new Error(`GitHub API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching contributors:", error);
        throw error;
    }
}
contributorSearch.addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const filteredData = contributorsData.filter((contributor) => {
        return contributor.login.toLowerCase().includes(query);
    });
    updateAllContributors(filteredData);

})

// Fetch all pages of commits
async function fetchCommits() {
    const allCommits = [];
    let page = 1;
    const perPage = 100;
    let totalPages = 0;
    while (true) {
        const response = await fetch(
            `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=${perPage}&page=${page}`,
            { headers: getHeaders() },
        );
        if (!response.ok) {
            if (isRateLimited(response)) {
                const resetTime = getRateLimitReset(response);
                throw new Error(
                    `rate limit reached until ${resetTime?.toLocaleTimeString()}`
                );
            }
            throw new Error(`GitHub API Error: ${response.status}`);
        }
        const commits = await response.json();
        allCommits.push(...commits);
        totalPages++;
        if (commits.length < perPage) {
            break; // last page
        }
        page++;
    }
    // Debug: print number of pages and unique commit dates
    const uniqueDates = new Set();
    allCommits.forEach(c => {
        let dateStr = c.date || (c.commit && c.commit.author && c.commit.author.date) || (c.commit && c.commit.committer && c.commit.committer.date);
        if (dateStr) {
            uniqueDates.add(new Date(dateStr).toISOString().split("T")[0]);
        }
    });
    console.log(`[DEBUG] fetchCommits: pages fetched = ${totalPages}, total commits = ${allCommits.length}, unique days = ${uniqueDates.size}`);
    console.log('[DEBUG] Unique commit days:', Array.from(uniqueDates));
    return allCommits;
}

// Fetch Languages
async function fetchLanguages() {
    try {
        const response = await fetch(
            `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/languages`,
            { headers: getHeaders() },
        );

        if (!response.ok) {
            if (isRateLimited(response)) {
                const resetTime = getRateLimitReset(response);
                throw new Error(
                    `rate limit reached until ${resetTime?.toLocaleTimeString()}`
                );
            }
            throw new Error(`GitHub API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching languages:", error);
        throw error;
    }
}

// Update Stats Cards
function updateStats(repo, contributors, commits) {

    const totalContributors = contributors.length;
    const totalCommits = commits.length;
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const openIssues = repo.open_issues_count || 0;
    const watchers = repo.watchers_count || 0;
    const sizeMB = (repo.size / 1024).toFixed(1);

    // Calculate recent activity (handle reduced commit data)
    let lastMonthCommits = 0;
    let lastWeekCommits = 0;
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    commits.forEach((c) => {
        let date = null;
        if (c.commit && c.commit.author && c.commit.author.date) {
            date = new Date(c.commit.author.date);
        } else if (c.date) {
            date = new Date(c.date);
        }
        if (date) {
            if (date > monthAgo) lastMonthCommits++;
            if (date > weekAgo) lastWeekCommits++;
        }
    });

    statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-number">${totalContributors}</div>
                    <div class="stat-label">Total Contributors</div>
                    <div class="stat-trend trend-up">+${lastWeekCommits} commits this week</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-code-branch"></i>
                    </div>
                    <div class="stat-number">${totalCommits}</div>
                    <div class="stat-label">Total Commits</div>
                    <div class="stat-trend trend-up">Active development</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="stat-number">${stars}</div>
                    <div class="stat-label">GitHub Stars</div>
                    <div class="stat-trend ${stars > 0 ? "trend-up" : "trend-down"}">
                        ${stars > 0 ? "Starred by developers" : "Be the first to star!"}
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-share-alt"></i>
                    </div>
                    <div class="stat-number">${forks}</div>
                    <div class="stat-label">Repository Forks</div>
                    <div class="stat-trend ${forks > 0 ? "trend-up" : "trend-down"}">
                        ${forks > 0 ? "Project being forked" : "No forks yet"}
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="stat-number">${openIssues}</div>
                    <div class="stat-label">Open Issues</div>
                    <div class="stat-trend ${openIssues === 0 ? "trend-up" : "trend-down"}">
                        ${openIssues === 0 ? "All issues resolved" : "Needs attention"}
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-database"></i>
                    </div>
                    <div class="stat-number">${sizeMB} MB</div>
                    <div class="stat-label">Repository Size</div>
                    <div class="stat-trend trend-up">${lastMonthCommits} commits this month</div>
                </div>
            `;
}

// Update Recent Activity
function updateActivity(commits) {
    if (!commits || commits.length === 0) {
        activityList.innerHTML =
            '<div class="activity-item">No recent activity found</div>';
        return;
    }

    let html = "";
    commits.slice(0, 8).forEach((commit) => {
        const author = commit.commit.author.name;
        const username = commit.author?.login || author;
        const avatar =
            commit.author?.avatar_url ||
            "https://avatars.githubusercontent.com/u/583231?v=4";
        const message = commit.commit.message;
        const date = new Date(commit.commit.author.date);
        const timeAgo = getTimeAgo(date);
        const commitUrl = commit.html_url;

        let html = "";
        commits.slice(0, 8).forEach((commit) => {
            // If reduced commit data (from cache), skip rendering full activity
            if (!commit.commit || !commit.commit.author || !commit.commit.author.name) {
                // Only have date, so show minimal info
                if (commit.date) {
                    html += `<div class="activity-item">Commit on ${new Date(commit.date).toLocaleDateString()}</div>`;
                }
                return;
            }
            const author = commit.commit.author.name;
            const username = commit.author?.login || author;
            const avatar =
                commit.author?.avatar_url ||
                "https://avatars.githubusercontent.com/u/583231?v=4";
            const message = commit.commit.message;
            const date = new Date(commit.commit.author.date);
            const timeAgo = getTimeAgo(date);
            const commitUrl = commit.html_url;

            html += `
                        <div class="activity-item">
                            <img src="${avatar}" alt="${username}" class="activity-avatar">
                            <div class="activity-details">
                                <div class="activity-username">${username}</div>
                                <div class="activity-message">${message}</div>
                                <div class="activity-time">${timeAgo}</div>
                            </div>
                            <a href="${commitUrl}" target="_blank" class="activity-link"><i class="fas fa-arrow-right"></i></a>
                        </div>
                    `;
        });
        activityList.innerHTML = html;
    })
        if (!contributors || contributors.length === 0) {
            topContributors.innerHTML =
                '<div class="activity-item">No contributors found</div>';
            return;
        }

        let topHtml = "";
        contributors.slice(0, 5).forEach((contributor, index) => {
            const contributions = contributor.contributions;
            const avatar = contributor.avatar_url;
            const username = contributor.login;
            const profileUrl = contributor.html_url;

            topHtml += `
                    <div class="activity-item">
                        <div class="activity-user">
                            <div style="font-weight: bold; font-size: 1.2rem; color: var(--primary-color); min-width: 30px;">#${index + 1}</div>
                            <img src="${avatar}" alt="${username}" class="activity-avatar">
                            <div class="activity-details">
                                <div class="activity-username">${username}</div>
                                <div class="activity-action">${contributions} contributions</div>
                            </div>
                        </div>
                        <div class="activity-stats">
                            <a href="${profileUrl}" target="_blank" class="stat-badge">
                                <i class="fab fa-github"></i> Profile
                            </a>
                        </div>
                    </div>
                `;
        });

        topContributors.innerHTML = topHtml;
    }

        // Update All Contributors
        function updateAllContributors(contributors) {
            if (!contributors || contributors.length === 0) {
                allContributors.innerHTML =
                    '<div class="contributor-card">No contributors found</div>';
                return;
            }

            let html = "";
            contributors.forEach((contributor) => {
                const avatar = contributor.avatar_url;
                const username = contributor.login;
                const contributions = contributor.contributions;
                const profileUrl = contributor.html_url;

                html += `
                    <a href="${profileUrl}" target="_blank" class="contributor-card" style="text-decoration: none; color: inherit;">
                        <img src="${avatar}" alt="${username}" class="contributor-avatar">
                        <div class="contributor-name">${username}</div>
                        <div class="contributor-stats">
                            <div class="contributor-stat">
                                <div class="contributor-stat-value">${contributions}</div>
                                <div class="contributor-stat-label">Contributions</div>
                            </div>
                        </div>
                    </a>
                `;
            });

            allContributors.innerHTML = html;
        }

        // Update Repository Info
        function updateRepoInfo(repo) {
            const created = new Date(repo.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            const updated = new Date(repo.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            const sizeMB = (repo.size / 1024).toFixed(1);
            const isPrivate = repo.private ? "Private" : "Public";

            repoInfo.innerHTML = `
                <div class="repo-info-grid">
                    <div class="repo-info-item">
                        <div class="repo-info-label">Visibility</div>
                        <div class="repo-info-value">${isPrivate}</div>
                    </div>
                    <div class="repo-info-item">
                        <div class="repo-info-label">Created</div>
                        <div class="repo-info-value">${created}</div>
                    </div>
                    <div class="repo-info-item">
                        <div class="repo-info-label">Last Updated</div>
                        <div class="repo-info-value">${updated}</div>
                    </div>
                    <div class="repo-info-item">
                        <div class="repo-info-label">Size</div>
                        <div class="repo-info-value">${sizeMB} MB</div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 1.5rem;">
                    <a href="${repo.html_url}" target="_blank" class="refresh-btn" style="display: inline-flex; text-decoration: none; font-size: 1rem; padding: 0.8rem 1.5rem;">
                        <i class="fab fa-github"></i> View Repository on GitHub
                    </a>
                </div>
            `;
        }

        // Update Charts
        function updateCharts(contributors, languages) {
            const isLightMode = document.body.classList.contains("light-mode");
            const gridColor = isLightMode
                ? "rgba(0, 0, 0, 0.05)"
                : "rgba(255, 255, 255, 0.05)";
            const textColor = isLightMode ? "#333" : "#e2e8f0";
            const textLightColor = isLightMode ? "#666" : "#a0aec0";

            // Contributors Growth Chart
            const contributorsCtx = document
                .getElementById("contributorsChart")
                .getContext("2d");

            // Simulate growth data (in production, fetch actual historical data)
            const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            const growthData = [];
            let cumulative = 0;

            for (let i = 0; i < 12; i++) {
                cumulative += Math.floor(Math.random() * 5) + (i < 6 ? 1 : 2);
                if (i === 11) cumulative = contributors.length;
                growthData.push(cumulative);
            }

            if (charts.contributorsChart) {
                charts.contributorsChart.destroy();
            }

            charts.contributorsChart = new Chart(contributorsCtx, {
                type: "line",
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: "Contributors",
                            data: growthData,
                            borderColor: "rgb(108, 99, 255)",
                            backgroundColor: "rgba(108, 99, 255, 0.1)",
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: "rgb(108, 99, 255)",
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: textColor,
                                font: {
                                    size: 14,
                                },
                            },
                        },
                        tooltip: {
                            backgroundColor: isLightMode ? "white" : "#2d3748",
                            titleColor: textColor,
                            bodyColor: textColor,
                            borderColor: "rgb(108, 99, 255)",
                            borderWidth: 1,
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: gridColor,
                            },
                            ticks: {
                                color: textLightColor,
                                font: {
                                    size: 12,
                                },
                            },
                        },
                        x: {
                            grid: {
                                color: gridColor,
                            },
                            ticks: {
                                color: textLightColor,
                                font: {
                                    size: 12,
                                },
                            },
                        },
                    },
                },
            });

            // Languages Chart
            const languagesCtx = document
                .getElementById("languagesChart")
                .getContext("2d");
            const languageNames = Object.keys(languages);
            const languageValues = Object.values(languages);

            const total = languageValues.reduce((a, b) => a + b, 0);
            const percentages = languageValues.map((value) =>
                Math.round((value / total) * 100),
            );

            // Color palette for languages
            const languageColors = [
                "#667eea",
                "#764ba2",
                "#f093fb",
                "#f5576c",
                "#4facfe",
                "#00cdac",
                "#81ecec",
                "#a29bfe",
                "#fd79a8",
                "#e17055",
                "#0984e3",
                "#00b894",
            ];

            if (charts.languagesChart) {
                charts.languagesChart.destroy();
            }

            charts.languagesChart = new Chart(languagesCtx, {
                type: "doughnut",
                data: {
                    labels: languageNames,
                    datasets: [
                        {
                            data: percentages,
                            backgroundColor: languageNames.map(
                                (_, i) => languageColors[i % languageColors.length],
                            ),
                            borderWidth: 1,
                            borderColor: isLightMode ? "#fff" : "#2d3748",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: {
                                color: textColor,
                                font: {
                                    size: 12,
                                },
                                padding: 20,
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `${context.label}: ${context.parsed}%`;
                                },
                            },
                            backgroundColor: isLightMode ? "white" : "#2d3748",
                            titleColor: textColor,
                            bodyColor: textColor,
                        },
                    },
                    cutout: "60%",
                },
            });
        }

        // Update charts theme
        function updateChartsTheme() {
            if (!chartsInitialized) return;

            Object.values(charts).forEach(chart => {
                if (!chart) return;

                const isLight = document.body.getAttribute("data-theme") === "light";
                const color = isLight ? "#333" : "#e2e8f0";

                if (chart.options.scales) {
                    chart.options.scales.x.ticks.color = color;
                    chart.options.scales.y.ticks.color = color;
                }

                chart.options.plugins.legend.labels.color = color;
                chart.update("none");
            });
        }


        // Time Ago Utility
        function getTimeAgo(date) {
            const seconds = Math.floor((new Date() - date) / 1000);

            let interval = seconds / 31536000;
            if (interval > 1) return Math.floor(interval) + " years ago";

            interval = seconds / 2592000;
            if (interval > 1) return Math.floor(interval) + " months ago";

            interval = seconds / 86400;
            if (interval > 1) return Math.floor(interval) + " days ago";

            interval = seconds / 3600;
            if (interval > 1) return Math.floor(interval) + " hours ago";

            interval = seconds / 60;
            if (interval > 1) return Math.floor(interval) + " minutes ago";

            return Math.floor(seconds) + " seconds ago";
        }

        // Export Modal Functions
        function openExportModal() {
            exportModal.style.display = "block";
            updateExportPreview();
        }
        function closeExportModal() {
            exportModal.style.display = "none";
        }

        function updateExportPreview() {
            if (!contributorsData.length) {
                exportPreview.textContent = "No data available";
                return;
            }

            const format = document.querySelector(
                'input[name="exportFormat"]:checked',
            ).value;
            const minContributions =
                parseInt(document.getElementById("minContributions").value) || 1;

            // Filter data
            const filteredData = contributorsData.filter(
                (c) => c.contributions >= minContributions,
            );

            // Prepare sample data
            const sampleData = filteredData.slice(0, 3).map((c) => ({
                name: c.login,
                role: "Contributor",
                githubUrl: c.html_url,
                contributions: c.contributions,
            }));

            if (format === "json") {
                exportPreview.textContent = JSON.stringify(sampleData, null, 2);
            } else if (format === "csv") {
                const headers = ["Name", "Role", "GitHub URL", "Contributions"];
                const rows = sampleData.map((item) => [
                    item.name,
                    item.role,
                    item.githubUrl,
                    item.contributions,
                ]);
                const csv = [headers, ...rows]
                    .map((row) => row.map((cell) => `"${cell}"`).join(","))
                    .join("\n");
                exportPreview.textContent = csv;
            } else if (format === "pdf") {
                exportPreview.textContent =
                    "PDF preview not available. Will include contributor table with formatted data.";
            }
        }

        function handleExport() {
            if (!contributorsData.length) {
                alert("No data available to export");
                return;
            }

            const format = document.querySelector(
                'input[name="exportFormat"]:checked',
            ).value;
            const minContributions =
                parseInt(document.getElementById("minContributions").value) || 1;

            // Filter data
            const filteredData = contributorsData.filter(
                (c) => c.contributions >= minContributions,
            );

            // Prepare export data
            const exportData = filteredData.map((c) => ({
                name: c.login,
                role: "Contributor",
                githubUrl: c.html_url,
                contributions: c.contributions,
                avatarUrl: c.avatar_url,
            }));

            const timestamp = new Date().toISOString().split("T")[0];
            const filename = `contributors-${timestamp}`;

            if (format === "json") {
                exportJSON(exportData, filename);
            } else if (format === "csv") {
                exportCSV(exportData, filename);
            } else if (format === "pdf") {
                exportPDF(exportData, filename);
            }

            closeExportModal();
        }

        function exportJSON(data, filename) {
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
            });
            downloadBlob(blob, `${filename}.json`);
        }

        function exportCSV(data, filename) {
            const headers = ["Name", "Role", "GitHub URL", "Contributions", "Avatar URL"];
            const rows = data.map((item) => [
                item.name,
                item.role,
                item.githubUrl,
                item.contributions,
                item.avatarUrl,
            ]);

            const csvContent = [headers, ...rows]
                .map((row) => row.map((cell) => `"${cell}"`).join(","))
                .join("\n");

            const blob = new Blob([csvContent], { type: "text/csv" });
            downloadBlob(blob, `${filename}.csv`);
        }

        function exportPDF(data, filename) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Title
            doc.setFontSize(20);
            doc.text("Contributor Report", 20, 30);

            // Date
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);

            // Table headers
            doc.setFontSize(14);
            doc.text("Contributors:", 20, 65);

            let y = 80;
            doc.setFontSize(10);

            data.forEach((contributor, index) => {
                if (y > 270) {
                    // New page if needed
                    doc.addPage();
                    y = 30;
                }

                doc.text(`${index + 1}. ${contributor.name}`, 20, y);
                doc.text(`Role: ${contributor.role}`, 20, y + 5);
                doc.text(`Contributions: ${contributor.contributions}`, 20, y + 10);
                doc.text(`GitHub: ${contributor.githubUrl}`, 20, y + 15);

                y += 25;
            });

            doc.save(`${filename}.pdf`);
        }

        function downloadBlob(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Load All Data
        async function loadAllData() {
            contributorSearch.value = "";

            // 🔹 CHECK CACHE FIRST
            const cachedRepo = getCache("repo");
            const cachedContributors = getCache("contributors");
            const cachedCommits = getCache("commits");
            const cachedLanguages = getCache("languages");

            if (cachedRepo && cachedContributors && cachedCommits && cachedLanguages) {
                repoData = cachedRepo;
                contributorsData = cachedContributors;
                commitsData = cachedCommits;

                updateStats(repoData, contributorsData, commitsData);
                updateActivity(commitsData);
                updateTopContributors(contributorsData);
                updateAllContributors(contributorsData);
                updateRepoInfo(repoData);

                if (!chartsInitialized) {
                    initCharts(commitsData, cachedLanguages);
                } else {
                    refreshCharts(commitsData, cachedLanguages);
                }

                if (lastUpdated) {
                    lastUpdated.textContent = "Last updated: Cached";
                }
                return; // ⬅️ IMPORTANT: stop here, no API call
            }


            try {
                refreshBtn.disabled = true;
                refreshBtn.classList.add("loading");
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Loading...';

                // Fetch all data in parallel
                const [repo, contributors, commits, languages] = await Promise.all([
                    fetchRepoData(),
                    fetchContributors(),
                    fetchCommits(),
                    fetchLanguages(),
                ]);
                // 🔹 SAVE TO CACHE
                setCache("repo", repo);
                setCache("contributors", contributors);
                setCache("commits", commits);
                setCache("languages", languages);

                // Store data
                repoData = repo;
                contributorsData = contributors;
                commitsData = commits;


                // Update UI
                updateStats(repo, contributors, commits);
                updateActivity(commits);
                updateTopContributors(contributors);
                updateAllContributors(contributors);
                updateRepoInfo(repo);
                if (!chartsInitialized) {
                    initCharts(commits, languages);
                }
                else {
                    refreshCharts(commits, languages);
                }

                // Update timestamp
                lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
            } catch (error) {
                console.error("Error loading data:", error);
                statsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-clock"></i>
                <h3>API Rate Limit Reached</h3>
                <p>You’ve hit GitHub’s request limit.</p>
                <p><small>Refresh will work again after some time.</small></p>
                <button onclick="loadAllData()" class="refresh-btn">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
                if (error.message.includes("rate limit")) {
                    // Try to extract reset time from error or from headers if available
                    if (error.resetTime) {
                        console.warn("GitHub API rate limit exhausted. Resets at:", error.resetTime);
                    } else if (error.response && error.response.headers) {
                        const resetEpoch = error.response.headers.get('x-ratelimit-reset');
                        if (resetEpoch) {
                            const resetDate = new Date(parseInt(resetEpoch, 10) * 1000);
                            console.warn("GitHub API rate limit exhausted. Resets at:", resetDate.toLocaleString());
                        }
                    } else {
                        console.warn("GitHub API rate limit exhausted. Check your GitHub account for reset time.");
                    }
                    disableRefreshUntilReset(10);
                }
            } finally {
                refreshBtn.disabled = false;
                refreshBtn.classList.remove("loading");
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Analytics';
            }
        }

// Refresh button event

    // Export Modal Events
    // exportBtn.addEventListener("click", openExportModal);
    // exportModalClose.addEventListener("click", closeExportModal);
    // exportCancel.addEventListener("click", closeExportModal);
    // exportConfirm.addEventListener("click", handleExport);

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
            if (e.target === exportModal) {
                closeExportModal();
            }
        });

    // Update preview when filters change

    const exportFormatInputs = document.querySelectorAll('input[name="exportFormat"]');
    if (exportFormatInputs) {
        exportFormatInputs.forEach((radio) => {
            radio.addEventListener("change", updateExportPreview);
        });
    }
    const filterRoleInput = document.getElementById("filterRole");
    if (filterRoleInput) filterRoleInput.addEventListener("change", updateExportPreview);
    const minContributionsInput = document.getElementById("minContributions");
    if (minContributionsInput) minContributionsInput.addEventListener("input", updateExportPreview);
