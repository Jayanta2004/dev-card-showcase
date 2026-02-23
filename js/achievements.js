
        // Hamburger menu
        const hamburger = document.getElementById("hamburger");
        const navLinks = document.getElementById("navLinks");

        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
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

            // Update copyright year dynamically
            const copyrightElement = document.getElementById('copyright');
            if (copyrightElement) {
                const currentYear = new Date().getFullYear();
                copyrightElement.textContent = `© ${currentYear} Community Hall of Fame`;
            }
        });
      
        document.addEventListener('DOMContentLoaded', function() {
            loadAchievementsPage();
        });

        async function loadAchievementsPage() {
            try {
                // Load badges data
                const badgesResponse = await fetch('badges.json');
                const badgesData = await badgesResponse.json();

                // Load contributors data
                const contributorsResponse = await fetch('contributors.json');
                const contributorsData = await contributorsResponse.json();

                displayBadges(badgesData.badges, contributorsData.contributors);
                updateStats(badgesData.badges, contributorsData.contributors);

            } catch (error) {
                console.error('Error loading achievements data:', error);
                document.getElementById('badgesGrid').innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Unable to load achievements data.</p>
                        <p>Please try again later.</p>
                    </div>
                `;
            }
        }

        function displayBadges(badges, contributors) {
            const badgesGrid = document.getElementById('badgesGrid');
            badgesGrid.innerHTML = '';

            Object.entries(badges).forEach(([badgeKey, badge]) => {
                const badgeCard = createBadgeCard(badge, badgeKey, contributors);
                badgesGrid.appendChild(badgeCard);
            });
        }

        function createBadgeCard(badge, badgeKey, contributors) {
            const card = document.createElement('div');
            card.className = 'badge-showcase-card';

            // Count how many contributors have this badge
            let earnedCount = 0;
            Object.values(contributors).forEach(contributor => {
                if (checkIfContributorHasBadge(contributor, badge)) {
                    earnedCount++;
                }
            });

            card.innerHTML = `
                <div class="badge-display">
                    <div class="badge-large" style="background-color: ${badge.color}">
                        <span class="badge-icon">${badge.icon}</span>
                        <span class="badge-name">${badge.name}</span>
                    </div>
                </div>
                <div class="badge-info">
                    <h3>${badge.name}</h3>
                    <p class="badge-description">${badge.description}</p>
                    <div class="badge-criteria">
                        <h4>How to Earn:</h4>
                        <p>${badge.criteria.description}</p>
                    </div>
                    <div class="badge-stats">
                        <span class="earned-count">${earnedCount} contributors earned this</span>
                    </div>
                </div>
            `;

            return card;
        }

        function checkIfContributorHasBadge(contributor, badge) {
            const criteria = badge.criteria;
            let earned = false;

            if (criteria.type === 'date_based') {
                if (contributor.created_at) {
                    const createdDate = new Date(contributor.created_at);
                    const criteriaDate = new Date(criteria.condition.replace('created_at < \'', '').replace('\'', ''));
                    earned = createdDate < criteriaDate;
                }
            } else if (criteria.type === 'metric_based') {
                earned = evaluateCondition(contributor, criteria.condition);
            }

            return earned;
        }

        function evaluateCondition(contributor, condition) {
            const orConditions = condition.split(' OR ');

            for (const orCondition of orConditions) {
                const andConditions = orCondition.split(' AND ');

                let andResult = true;
                for (const andCondition of andConditions) {
                    const trimmed = andCondition.trim();
                    if (!evaluateSingleCondition(contributor, trimmed)) {
                        andResult = false;
                        break;
                    }
                }

                if (andResult) {
                    return true;
                }
            }

            return false;
        }

        function evaluateSingleCondition(contributor, condition) {
            const match = condition.match(/^(\w+)\s*([><=]+)\s*(\d+)$/);
            if (!match) return false;

            const [, field, operator, value] = match;
            const numValue = parseInt(value);
            const contributorValue = contributor[field] || 0;

            switch (operator) {
                case '>=': return contributorValue >= numValue;
                case '<=': return contributorValue <= numValue;
                case '>': return contributorValue > numValue;
                case '<': return contributorValue < numValue;
                case '=': return contributorValue === numValue;
                default: return false;
            }
        }

        function updateStats(badges, contributors) {
            const totalBadges = Object.keys(badges).length;
            document.getElementById('totalBadges').textContent = totalBadges;

            let totalEarned = 0;
            let contributorsWithBadges = 0;

            Object.values(contributors).forEach(contributor => {
                let hasAnyBadge = false;
                Object.values(badges).forEach(badge => {
                    if (checkIfContributorHasBadge(contributor, badge)) {
                        totalEarned++;
                        hasAnyBadge = true;
                    }
                });
                if (hasAnyBadge) {
                    contributorsWithBadges++;
                }
            });

            document.getElementById('earnedBadges').textContent = totalEarned;
            document.getElementById('contributorsWithBadges').textContent = contributorsWithBadges;
        }
    
