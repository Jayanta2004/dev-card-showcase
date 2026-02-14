// <!-- Scripts -->

// Background animation (same as index.html)
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


// <!-- Theme Toggle -->

document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    const initialTheme =
        savedTheme || (prefersDark.matches ? 'dark' : 'light');

    applyTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });
});



// <!-- Mobile Menu -->
document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
});



// <!-- Statistics Dashboard Script -->

// Sample data - in a real implementation, this would come from an API or database
const contributorData = {
    total: 0,
    developers: 0,
    contributors: 0,
    maintainers: 0,
    growth: [
        { month: 'Jan 2024', count: 45 },
        { month: 'Feb 2024', count: 52 },
        { month: 'Mar 2024', count: 61 },
        { month: 'Apr 2024', count: 73 },
        { month: 'May 2024', count: 89 },
        { month: 'Jun 2024', count: 104 },
        { month: 'Jul 2024', count: 118 },
        { month: 'Aug 2024', count: 135 },
        { month: 'Sep 2024', count: 152 },
        { month: 'Oct 2024', count: 168 },
        { month: 'Nov 2024', count: 187 },
        { month: 'Dec 2024', count: 203 }
    ],
    geographic: {
        'India': 85,
        'United States': 42,
        'United Kingdom': 18,
        'Germany': 15,
        'Canada': 12,
        'Australia': 8,
        'Brazil': 6,
        'France': 5,
        'Others': 12
    },
    monthlyActivity: [
        { month: 'Jan', contributions: 23 },
        { month: 'Feb', contributions: 31 },
        { month: 'Mar', contributions: 28 },
        { month: 'Apr', contributions: 35 },
        { month: 'May', contributions: 42 },
        { month: 'Jun', contributions: 38 },
        { month: 'Jul', contributions: 45 },
        { month: 'Aug', contributions: 39 },
        { month: 'Sep', contributions: 47 },
        { month: 'Oct', contributions: 41 },
        { month: 'Nov', contributions: 52 },
        { month: 'Dec', contributions: 48 }
    ]
};

// Chart instances
let roleChart, growthChart, activityChart, geographicChart;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    // Simulate loading contributor data from the main page
    loadContributorData();
    initializeCharts();
    setupControls();
});

function loadContributorData() {
    // Fetch contributor data from index.html
    fetch('index.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Find all contributor cards
            const cards = doc.querySelectorAll('.card');
            let developers = 0;
            let contributors = 0;
            let maintainers = 0;
            const roles = {};

            cards.forEach(card => {
                const roleElement = card.querySelector('.role');
                if (roleElement) {
                    const role = roleElement.textContent.trim().toLowerCase();

                    // Count different role types
                    if (role.includes('developer') || role.includes('frontend') || role.includes('backend') ||
                        role.includes('full stack') || role.includes('software engineer')) {
                        developers++;
                    } else if (role.includes('maintainer') || role.includes('admin') || role.includes('owner')) {
                        maintainers++;
                    } else if (role.includes('contributor') || role.includes('open source')) {
                        contributors++;
                    } else {
                        // Default to contributor for other roles
                        contributors++;
                    }

                    // Count all roles for distribution
                    const displayRole = roleElement.textContent.trim();
                    roles[displayRole] = (roles[displayRole] || 0) + 1;
                }
            });

            const total = developers + contributors + maintainers;

            // Update summary cards
            document.getElementById('totalContributors').textContent = total;
            document.getElementById('totalDevelopers').textContent = developers;
            document.getElementById('totalContributorsOnly').textContent = contributors;
            document.getElementById('totalMaintainers').textContent = maintainers;

            // Update chart data
            contributorData.total = total;
            contributorData.developers = developers;
            contributorData.contributors = contributors;
            contributorData.maintainers = maintainers;

            // Update role distribution chart with actual data
            if (roleChart) {
                roleChart.data.labels = Object.keys(roles);
                roleChart.data.datasets[0].data = Object.values(roles);
                roleChart.update();
            }
        })
        .catch(error => {
            console.error('Error loading contributor data:', error);
            // Fallback to sample data
            document.getElementById('totalContributors').textContent = contributorData.total;
            document.getElementById('totalDevelopers').textContent = contributorData.developers;
            document.getElementById('totalContributorsOnly').textContent = contributorData.contributors;
            document.getElementById('totalMaintainers').textContent = contributorData.maintainers;
        });
}

function initializeCharts() {
    // Role Distribution Chart
    const roleCtx = document.getElementById('roleChart').getContext('2d');
    roleChart = new Chart(roleCtx, {
        type: 'doughnut',
        data: {
            labels: ['Developers', 'Contributors', 'Maintainers'],
            datasets: [{
                data: [contributorData.developers, contributorData.contributors, contributorData.maintainers],
                backgroundColor: [
                    'rgba(56, 189, 248, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    'rgba(56, 189, 248, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    }
                }
            }
        }
    });

    // Growth Timeline Chart
    const growthCtx = document.getElementById('growthChart').getContext('2d');
    growthChart = new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: contributorData.growth.map(item => item.month),
            datasets: [{
                label: 'Contributors',
                data: contributorData.growth.map(item => item.count),
                borderColor: 'rgba(56, 189, 248, 1)',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-primary')
                    },
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    }
                },
                x: {
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-primary')
                    },
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    }
                }
            }
        }
    });

    // Monthly Activity Chart
    const activityCtx = document.getElementById('activityChart').getContext('2d');
    activityChart = new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: contributorData.monthlyActivity.map(item => item.month),
            datasets: [{
                label: 'Contributions',
                data: contributorData.monthlyActivity.map(item => item.contributions),
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-primary')
                    },
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    }
                },
                x: {
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-primary')
                    },
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    }
                }
            }
        }
    });

    // Geographic Distribution Chart
    const geographicCtx = document.getElementById('geographicChart').getContext('2d');
    geographicChart = new Chart(geographicCtx, {
        type: 'radar',
        data: {
            labels: Object.keys(contributorData.geographic),
            datasets: [{
                label: 'Contributors by Country',
                data: Object.values(contributorData.geographic),
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(16, 185, 129, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-primary')
                    },
                    angleLines: {
                        color: getComputedStyle(document.body).getPropertyValue('--border-primary')
                    },
                    pointLabels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    },
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    }
                }
            }
        }
    });
}

function setupControls() {
    // Time range filter
    document.getElementById('timeRange').addEventListener('change', function () {
        updateCharts(this.value);
    });

    // Chart type filter
    document.getElementById('chartType').addEventListener('change', function () {
        updateChartTypes(this.value);
    });

    // Role filter
    document.getElementById('roleFilter').addEventListener('change', function () {
        filterByRole(this.value);
    });
}

function updateCharts(timeRange) {
    // Filter data based on time range
    let filteredGrowth = contributorData.growth;
    let filteredActivity = contributorData.monthlyActivity;

    switch (timeRange) {
        case 'year':
            filteredGrowth = contributorData.growth.slice(-12);
            filteredActivity = contributorData.monthlyActivity.slice(-12);
            break;
        case 'month':
            filteredGrowth = contributorData.growth.slice(-1);
            filteredActivity = contributorData.monthlyActivity.slice(-1);
            break;
        case 'week':
            // For demo purposes, show last 4 weeks
            filteredGrowth = contributorData.growth.slice(-1);
            filteredActivity = contributorData.monthlyActivity.slice(-1);
            break;
    }

    // Update growth chart
    growthChart.data.labels = filteredGrowth.map(item => item.month);
    growthChart.data.datasets[0].data = filteredGrowth.map(item => item.count);
    growthChart.update();

    // Update activity chart
    activityChart.data.labels = filteredActivity.map(item => item.month);
    activityChart.data.datasets[0].data = filteredActivity.map(item => item.contributions);
    activityChart.update();
}

function updateChartTypes(chartType) {
    // Update chart types dynamically
    roleChart.config.type = chartType === 'doughnut' ? 'doughnut' : chartType;
    roleChart.update();

    growthChart.config.type = chartType === 'line' ? 'line' : chartType;
    growthChart.update();

    activityChart.config.type = chartType === 'bar' ? 'bar' : chartType;
    activityChart.update();

    geographicChart.config.type = chartType === 'radar' ? 'radar' : chartType;
    geographicChart.update();
}

function filterByRole(role) {
    // Filter charts based on selected role
    // This would require more complex data structure in a real implementation
    console.log('Filtering by role:', role);
}

async function exportContributorData() {
    const statusElement = document.getElementById('exportStatus');
    const format = document.getElementById('exportFormat').value;
    const roleFilter = document.getElementById('exportRoleFilter').value;
    const limit = document.getElementById('exportLimit').value;

    try {
        statusElement.textContent = 'Loading contributor data...';
        statusElement.className = 'export-status loading';

        // Fetch contributor data
        const contributors = await fetchContributorData();

        // Apply filters
        let filteredData = contributors;
        if (roleFilter !== 'all') {
            filteredData = contributors.filter(contributor => {
                const role = contributor.role.toLowerCase();
                return role.includes(roleFilter);
            });
        }

        // Apply limit
        if (limit !== 'all') {
            filteredData = filteredData.slice(0, parseInt(limit));
        }

        // Export based on format
        switch (format) {
            case 'json':
                exportAsJSON(filteredData);
                break;
            case 'csv':
                exportAsCSV(filteredData);
                break;
            case 'pdf':
                exportAsPDF(filteredData);
                break;
        }

        statusElement.textContent = `Successfully exported ${filteredData.length} contributors!`;
        statusElement.className = 'export-status success';

        // Clear status after 3 seconds
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'export-status';
        }, 3000);

    } catch (error) {
        console.error('Export failed:', error);
        statusElement.textContent = 'Export failed. Please try again.';
        statusElement.className = 'export-status error';
    }
}

async function fetchContributorData() {
    return new Promise((resolve, reject) => {
        fetch('index.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const cards = doc.querySelectorAll('.card');
                const contributors = [];

                cards.forEach(card => {
                    const imgElement = card.querySelector('.card-img');
                    const nameElement = card.querySelector('h2');
                    const roleElement = card.querySelector('.role');
                    const descriptionElement = card.querySelector('p');
                    const linkElement = card.querySelector('.card-btn');

                    if (nameElement && roleElement) {
                        contributors.push({
                            name: nameElement.textContent.trim(),
                            role: roleElement.textContent.trim(),
                            description: descriptionElement ? descriptionElement.textContent.trim() : '',
                            githubUrl: linkElement ? linkElement.href : '',
                            imageUrl: imgElement ? imgElement.src : ''
                        });
                    }
                });

                resolve(contributors);
            })
            .catch(reject);
    });
}

function exportAsJSON(data) {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `contributors-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

function exportAsCSV(data) {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    // CSV headers
    const headers = ['Name', 'Role', 'Description', 'GitHub URL', 'Image URL'];
    let csvContent = headers.join(',') + '\n';

    // Add data rows
    data.forEach(contributor => {
        const row = [
            `"${contributor.name.replace(/"/g, '""')}"`,
            `"${contributor.role.replace(/"/g, '""')}"`,
            `"${contributor.description.replace(/"/g, '""')}"`,
            `"${contributor.githubUrl}"`,
            `"${contributor.imageUrl}"`
        ];
        csvContent += row.join(',') + '\n';
    });

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `contributors-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

function exportAsPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('Contributor Statistics Report', 20, 30);

    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);

    // Add summary
    doc.text(`Total Contributors: ${data.length}`, 20, 60);

    // Add table headers
    let yPosition = 80;
    doc.setFontSize(10);
    doc.text('Name', 20, yPosition);
    doc.text('Role', 80, yPosition);
    doc.text('GitHub', 130, yPosition);

    yPosition += 10;

    // Add data rows (limit to fit on page)
    const maxRows = Math.min(data.length, 25); // Limit for PDF page
    for (let i = 0; i < maxRows; i++) {
        const contributor = data[i];
        const name = contributor.name.length > 15 ? contributor.name.substring(0, 15) + '...' : contributor.name;
        const role = contributor.role.length > 12 ? contributor.role.substring(0, 12) + '...' : contributor.role;

        doc.text(name, 20, yPosition);
        doc.text(role, 80, yPosition);
        doc.text(contributor.githubUrl ? 'Link' : '', 130, yPosition);

        yPosition += 8;

        // Add new page if needed
        if (yPosition > 270 && i < maxRows - 1) {
            doc.addPage();
            yPosition = 30;
        }
    }

    // Save the PDF
    doc.save(`contributors-${new Date().toISOString().split('T')[0]}.pdf`);
}

function exportCharts() {
    // Export dashboard as image
    html2canvas(document.querySelector('.charts-grid')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'contributor-statistics.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

// Load html2canvas for export functionality
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
document.head.appendChild(script);


document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme or prefer color scheme
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');
    
    // Set initial theme
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update ARIA label
        themeToggle.setAttribute('aria-label', 
            newTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', 
                e.matches ? 'dark' : 'light');
        }
    });
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