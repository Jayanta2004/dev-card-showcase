
        document.addEventListener("DOMContentLoaded", function () {
            const coords = { x: 0, y: 0 };
            const circles = document.querySelectorAll(".circle");

            circles.forEach(function (circle) {
                circle.x = 0;
                circle.y = 0;
            });

            window.addEventListener("mousemove", function (e) {
                coords.x = e.pageX;
                coords.y = e.pageY - window.scrollY; // Adjust for vertical scroll position
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



//  {/* /* ---------- VIEW TOGGLE (Grid/List) ---------- */ */}
const viewToggleBtn = document.getElementById("viewToggle");
const cardContainer = document.querySelector(".card-container");

// Initialize view mode from localStorage or default to grid
let isListView = localStorage.getItem("viewMode") === "list";

// Update button icon based on current view
function updateViewButton() {
    const icon = viewToggleBtn.querySelector("i");
    if (isListView) {
        icon.classList.remove("fa-list");
        icon.classList.add("fa-th-large");
        viewToggleBtn.setAttribute("aria-label", "Switch to Grid View");
    } else {
        icon.classList.remove("fa-th-large");
        icon.classList.add("fa-list");
        viewToggleBtn.setAttribute("aria-label", "Switch to List View");
    }
}

// Toggle between grid and list view
function toggleView() {
    isListView = !isListView;
    
    if (isListView) {
        // Switch to list view
        cardContainer.classList.add("list-view");
        localStorage.setItem("viewMode", "list");
    } else {
        // Switch to grid view
        cardContainer.classList.remove("list-view");
        localStorage.setItem("viewMode", "grid");
    }
    
    updateViewButton();
    
    // Add animation effect
    cardContainer.style.opacity = "0.7";
    setTimeout(() => {
        cardContainer.style.opacity = "1";
    }, 200);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    // Set initial view based on saved preference
    if (isListView) {
        cardContainer.classList.add("list-view");
    } else {
        cardContainer.classList.remove("list-view");
    }
    
    updateViewButton();
    
    // Add event listener to toggle button
    viewToggleBtn.addEventListener("click", toggleView);
    
    // Add keyboard support
    viewToggleBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleView();
        }
    });
    
    // Add hover effects for list view
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (cardContainer.classList.contains('list-view')) {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = 'var(--shadow-md)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (cardContainer.classList.contains('list-view')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'var(--shadow-sm)';
            }
        });
    });
});
        // const hamburger = document.getElementById("hamburger");
        // const navLinks = document.getElementById("navLinks");

        // hamburger.addEventListener("click", () => {
        //     navLinks.classList.toggle("active");
        // });
        /* ---------- ENHANCED SEARCH & FILTER SCRIPT ---------- */
        let currentFilter = 'all';
        let currentSearch = '';
        let selectedSkills = new Set();

        function filterCards() {
            currentSearch = document.getElementById("searchInput").value.toLowerCase();
            applyFilters();
        }

        function filterByRole(role) {
    currentFilter = role;

    // Update active button state
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        
        // Match the button's onclick attribute to determine if it should be active
        const btnRole = btn.getAttribute('onclick')?.match(/filterByRole\('(.+?)'\)/)?.[1];
        if (btnRole === role) {
            btn.classList.add('active');
        }
    });

    applyFilters();
}

        function applyFilters() {
            const cards = document.querySelectorAll(".card");
            const noResults = document.getElementById("noResults");
            let visibleCount = 0;

            cards.forEach(card => {
                const nameElement = card.querySelector("h2");
                const roleElement = card.querySelector(".role");
                
                // Skip if elements don't exist
                if (!nameElement || !roleElement) {
                    card.style.display = "none";
                    return;
                }
                
                const name = nameElement.innerText.toLowerCase();
                const role = roleElement.innerText.toLowerCase();
                const cardSkills = card.dataset.skills ? card.dataset.skills.split(',') : [];

                const matchesSearch = name.includes(currentSearch);
                const matchesFilter = currentFilter === 'all' ||
                    role.includes(currentFilter);
                
                const matchesSkills = selectedSkills.size === 0 || 
                    [...selectedSkills].some(skill => cardSkills.includes(skill.toLowerCase()));

                if (matchesSearch && matchesFilter && matchesSkills) {
                    card.style.display = "block";
                    card.classList.add('loading');
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            // Show/hide no results message
            if (noResults) {
                if (visibleCount === 0) {
                    noResults.style.display = 'block';
                    noResults.classList.add('show');
                } else {
                    noResults.style.display = 'none';
                    noResults.classList.remove('show');
                }
            }
        }

        // Skill filter functions
        function initSkillFilters() {
            const allSkills = new Set();
            document.querySelectorAll('.card').forEach(card => {
                const skills = card.dataset.skills;
                if (skills) {
                    skills.split(',').forEach(skill => allSkills.add(skill.trim().toLowerCase()));
                }
            });

            const skillTagsContainer = document.getElementById('skillTags');
            [...allSkills].sort().forEach(skill => {
                const tag = document.createElement('button');
                tag.className = 'skill-filter-tag';
                tag.textContent = skill.charAt(0).toUpperCase() + skill.slice(1);
                tag.onclick = () => toggleSkillFilter(skill, tag);
                skillTagsContainer.appendChild(tag);
            });
        }

        function toggleSkillFilter(skill, tagElement) {
            if (selectedSkills.has(skill)) {
                selectedSkills.delete(skill);
                tagElement.classList.remove('active');
            } else {
                selectedSkills.add(skill);
                tagElement.classList.add('active');
            }
            applyFilters();
        }

        const clearSkillsBtn = document.getElementById('clearSkills');
        if (clearSkillsBtn) {
            clearSkillsBtn.addEventListener('click', () => {
                selectedSkills.clear();
                document.querySelectorAll('.skill-filter-tag').forEach(tag => {
                    tag.classList.remove('active');
                });
                applyFilters();
            });
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', () => {
            initSkillFilters();
        });

        // Scroll to Top Functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        window.addEventListener('scroll', () => {
            const scrollBtn = document.getElementById('scrollToTop');
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });
   
        // ----- TYPEWRITER LOOP -----
        // ----- TYPEWRITER LOOP -----
        const typewriter = document.getElementById('typewriter');
        
        if (typewriter) {


        const phrases = [
            "🚀 Community Hall of Fame",
            "Built by the Community",
            "Open Source for Everyone",
            "Contribute, Learn, Grow"
        ];

        let currentPhrase = 0;
        let currentChar = 0;
        let isDeleting = false;
        let speed = 100; // typing speed (ms per character)

        function type() {
            const fullText = phrases[currentPhrase];

            if (isDeleting) {
                currentChar--;
                typewriter.textContent = fullText.substring(0, currentChar);
            } else {
                currentChar++;
                typewriter.textContent = fullText.substring(0, currentChar);
            }

            // Adjust speed for deleting vs typing
            let typingSpeed = isDeleting ? speed / 2 : speed;

            // When phrase is complete
            if (!isDeleting && currentChar === fullText.length) {
                typingSpeed = 1500; // wait before deleting
                isDeleting = true;
            }
            // When deletion is complete
            else if (isDeleting && currentChar === 0) {
                isDeleting = false;
                currentPhrase = (currentPhrase + 1) % phrases.length;
                typingSpeed = 500; // wait before typing next phrase
            }

            setTimeout(type, typingSpeed);
        }

        // Start typewriter
        type();
        }


        // ----- PARALLAX EFFECT -----
        const heroHeading = document.querySelector('h1');
        const heroSubtitle = document.querySelector('.subtitle');

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;

            heroHeading.style.transform = `translateY(${scrollY * 0.2}px)`;  // slower
            heroSubtitle.style.transform = `translateY(${scrollY * 0.15}px)`; // slightly slower
        });
    
        /* ---------- ENHANCED SORT CARDS SCRIPT ---------- */
        const container = document.querySelector(".card-container");
        let originalCards = [];
        
        // Store original order on page load
        document.addEventListener('DOMContentLoaded', () => {
            originalCards = Array.from(container.children);
        });

        function sortCards() {
            const selectElement = document.getElementById("sortSelect");
            if (!selectElement) return;
            
            const value = selectElement.value;

            // Get all cards (both visible and hidden)
            let allCards = Array.from(container.children);

            if (value === "default") {
                // Restore original order
                container.innerHTML = "";
                originalCards.forEach(card => {
                    container.appendChild(card);
                });
                return;
            }

            if (value === "az") {
                allCards.sort((a, b) => {
                    const nameA = a.querySelector("h2")?.innerText || '';
                    const nameB = b.querySelector("h2")?.innerText || '';
                    return nameA.localeCompare(nameB);
                });
            }

            if (value === "za") {
                allCards.sort((a, b) => {
                    const nameA = a.querySelector("h2")?.innerText || '';
                    const nameB = b.querySelector("h2")?.innerText || '';
                    return nameB.localeCompare(nameA);
                });
            }

            if (value === "newest") {
                // Reverse the original order to show newest first
                allCards = [...originalCards].reverse();
            }

            // Clear container and append sorted cards
            container.innerHTML = "";
            allCards.forEach(card => {
                container.appendChild(card);
            });
        }

        // Add stagger animation on load
        document.addEventListener('DOMContentLoaded', () => {
            const cards = document.querySelectorAll('.card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.05}s`;
                card.classList.add('loading');
            });
        });
        function animateValue(element, start, end, duration) {
            let startTimestamp = null;

            function step(timestamp) {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                if (element) {
                     element.innerText = Math.floor(progress * (end - start) + start);
                }
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            }

            window.requestAnimationFrame(step);
        }

        function updateContributorStats() {
            const cards = document.querySelectorAll(".card");

            let total = cards.length;
            let dev = 0;
            let contributor = 0;
            let maintainer = 0;

            cards.forEach(card => {
                const role = card.querySelector(".role")?.innerText.toLowerCase();

                if (role.includes("developer")) dev++;
                else if (role.includes("maintainer")) maintainer++;
                else contributor++;
            });

            animateValue(document.getElementById("totalCount"), 0, total, 800);
            animateValue(document.getElementById("devCount"), 0, dev, 800);
            animateValue(document.getElementById("contributorCount"), 0, contributor, 800);
            animateValue(document.getElementById("maintainerCount"), 0, maintainer, 800);
        }

        document.addEventListener("DOMContentLoaded", () => {
            updateContributorStats();

            // Hide page loader after content loads
            setTimeout(() => {
                const loader = document.getElementById('pageLoader');
                if (loader) {
                    loader.classList.add('hidden');
                }
            }, 500);
        });



        document.addEventListener("DOMContentLoaded", () => {
            const welcomeMsg = document.getElementById("welcomeMessage");
            if (welcomeMsg) {
                // Show message
                setTimeout(() => {
                    welcomeMsg.classList.add("show");
                }, 500); // Small delay after load

                // Hide message after 4 seconds
                setTimeout(() => {
                    welcomeMsg.classList.remove("show");
                    // Optional: remove from DOM after transition
                    setTimeout(() => {
                        welcomeMsg.style.display = 'none';
                    }, 500);
                }, 4500);
            }
        });


    // <!-- Theme Switcher Script -->

        document.addEventListener('DOMContentLoaded', function() {
            const body = document.body;
            const themeButtons = document.querySelectorAll('.theme-option');
            const themeKey = 'theme';

            function setTheme(theme) {
                body.setAttribute('data-theme', theme);
                body.classList.toggle('light-mode', theme === 'minimal');
                localStorage.setItem(themeKey, theme);

                themeButtons.forEach(btn => {
                    const isActive = btn.dataset.theme === theme;
                    btn.setAttribute('aria-pressed', String(isActive));
                });
            }

            const savedTheme = localStorage.getItem(themeKey) || body.getAttribute('data-theme') || 'ocean';
            setTheme(savedTheme);

            themeButtons.forEach(btn => {
                btn.addEventListener('click', () => setTheme(btn.dataset.theme));
            });

            // Update copyright year dynamically
            const copyrightElement = document.getElementById('copyright');
            if (copyrightElement) {
                const currentYear = new Date().getFullYear();
                copyrightElement.textContent = `© ${currentYear} Community Hall of Fame`;
            }
        });


    // <!-- Card Animation Script -->
   
        document.addEventListener('DOMContentLoaded', function() {
            // Set up staggered card animations
            const cards = document.querySelectorAll('.card');
            cards.forEach((card, index) => {
                card.style.setProperty('--card-index', index);
            });

            // Add enhanced hover interactions
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    // Add subtle pulse effect to the image
                    const img = this.querySelector('.card-img');
                    if (img) {
                        img.style.animation = 'none';
                        setTimeout(() => {
                            img.style.animation = 'imagePulse 0.6s ease-in-out';
                        }, 10);
                    }
                });

                card.addEventListener('mouseleave', function() {
                    // Reset any hover states
                    const img = this.querySelector('.card-img');
                    if (img) {
                        img.style.animation = '';
                    }
                });
            });
        });

        // Add image pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes imagePulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);

    // Contributor of the Day Feature
    document.addEventListener('DOMContentLoaded', function() {
        // DOM Elements
        const crownBtn = document.getElementById('crownBtn');
        const contributorModal = document.getElementById('contributorModal');
        const closeModal = document.getElementById('closeModal');
        const spotlightCard = document.getElementById('spotlightCard');
        const refreshBtn = document.getElementById('refreshSpotlight');
        const viewAllBtn = document.getElementById('viewAllBtn');
        
        // Storage keys
        const SPOTLIGHT_KEY = 'devCardSpotlight';
        const SPOTLIGHT_DATE_KEY = 'spotlightDate';
        
        // Initialize
        initContributorOfTheDay();
        
        function initContributorOfTheDay() {
            // Setup event listeners
            crownBtn.addEventListener('click', openModal);
            closeModal.addEventListener('click', closeModalWindow);
            refreshBtn.addEventListener('click', refreshSpotlight);
            viewAllBtn.addEventListener('click', scrollToCards);
            
            // Close modal when clicking outside
            contributorModal.addEventListener('click', function(e) {
                if (e.target === contributorModal) {
                    closeModalWindow();
                }
            });
            
            // Close with Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && contributorModal.style.display === 'block') {
                    closeModalWindow();
                }
            });
            
            // Load today's spotlight on page load
            loadTodaysSpotlight();
        }
        
        function openModal() {
            contributorModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            
            // Ensure content is loaded
            loadTodaysSpotlight();
            
            // Add opening animation class
            setTimeout(() => {
                contributorModal.classList.add('modal-open');
            }, 10);
        }
        
        function closeModalWindow() {
            contributorModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
            contributorModal.classList.remove('modal-open');
        }
        
        function getTodaysDate() {
            const today = new Date();
            return today.toDateString(); // Format: "Mon Jan 17 2026"
        }
        
        function shouldRefreshSpotlight() {
            const lastDate = localStorage.getItem(SPOTLIGHT_DATE_KEY);
            const today = getTodaysDate();
            
            return lastDate !== today;
        }
        
        function selectRandomContributor() {
            // Get all cards except admin and template
            const allCards = document.querySelectorAll('.card');
            const eligibleCards = Array.from(allCards).filter((card, index) => {
                const h2 = card.querySelector('h2');
                return h2 && 
                       !h2.textContent.includes('Project Admin') && 
                       !h2.textContent.includes('Contributor Name') &&
                       card.querySelector('.card-btn'); // Must have a link
            });
            
            if (eligibleCards.length === 0) {
                console.error('No eligible cards found for spotlight');
                return null;
            }
            
            // Random selection
            const randomIndex = Math.floor(Math.random() * eligibleCards.length);
            return eligibleCards[randomIndex];
        }
        
        function loadTodaysSpotlight() {
            const today = getTodaysDate();
            const storedData = localStorage.getItem(SPOTLIGHT_KEY);
            
            let selectedCard;
            
            // Check if we need to select a new contributor
            if (shouldRefreshSpotlight() || !storedData) {
                selectedCard = selectRandomContributor();
                
                if (selectedCard) {
                    // Save selection
                    const spotlightData = {
                        date: today,
                        html: selectedCard.innerHTML,
                        name: selectedCard.querySelector('h2').textContent,
                        role: selectedCard.querySelector('.role').textContent,
                        image: selectedCard.querySelector('img')?.src || '',
                        link: selectedCard.querySelector('.card-btn')?.href || '#'
                    };
                    
                    localStorage.setItem(SPOTLIGHT_KEY, JSON.stringify(spotlightData));
                    localStorage.setItem(SPOTLIGHT_DATE_KEY, today);
                }
            } else {
                // Use stored data
                const spotlightData = JSON.parse(storedData);
                
                // Find the card in the DOM to get current state
                const allCards = document.querySelectorAll('.card');
                selectedCard = Array.from(allCards).find(card => {
                    const name = card.querySelector('h2')?.textContent;
                    return name === spotlightData.name;
                }) || null;
            }
            
            // Update UI
            updateSpotlightUI(selectedCard);
        }
        
        function updateSpotlightUI(selectedCard) {
            if (!selectedCard) {
                spotlightCard.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Unable to load today's featured contributor.</p>
                        <p>Please try again later.</p>
                    </div>
                `;
                return;
            }
            
            // Clear any previous spotlight highlights
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('todays-spotlight');
            });
            
            // Highlight the selected card
            selectedCard.classList.add('todays-spotlight');
            
            // Extract card data
            const cardImg = selectedCard.querySelector('.card-img')?.src || 'images/user.png';
            const cardName = selectedCard.querySelector('h2')?.textContent || 'Unknown Contributor';
            const cardRole = selectedCard.querySelector('.role')?.textContent || 'Contributor';
            const cardQuote = selectedCard.querySelector('p')?.textContent || 'Happy to contribute!';
            const cardLink = selectedCard.querySelector('.card-btn')?.href || '#';
            
            // Update modal content
            spotlightCard.innerHTML = `
                <div class="card">
                    <img src="${cardImg}" alt="${cardName}" class="card-img">
                    <h2>${cardName}</h2>
                    <span class="role">${cardRole}</span>
                    <p>"${cardQuote}"</p>
                    <a href="${cardLink}" class="card-btn" target="_blank">
                        <i class="fab fa-github"></i> View Profile
                    </a>
                </div>
            `;
        }
        
        function refreshSpotlight() {
            // Force new selection
            localStorage.removeItem(SPOTLIGHT_KEY);
            localStorage.removeItem(SPOTLIGHT_DATE_KEY);
            
            // Show loading state
            spotlightCard.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Selecting new contributor...</p>
                </div>
            `;
            
            // Select and display new contributor after delay
            setTimeout(() => {
                const selectedCard = selectRandomContributor();
                updateSpotlightUI(selectedCard);
                
                // Show success message
                showToast('New contributor selected!');
            }, 1000);
        }
        
        function scrollToCards() {
            closeModalWindow();
            
            // Scroll to card container with smooth animation
            const cardContainer = document.querySelector('.card-container');
            if (cardContainer) {
                cardContainer.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Highlight the spotlight card briefly
                const spotlightCard = document.querySelector('.card.todays-spotlight');
                if (spotlightCard) {
                    spotlightCard.style.animation = 'none';
                    setTimeout(() => {
                        spotlightCard.style.animation = 'pulseBorder 2s infinite';
                    }, 10);
                }
            }
        }
        
        function showToast(message) {
            // Check current theme
            const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
            
            // Create toast element
            const toast = document.createElement('div');
            toast.className = 'toast-message';
            toast.textContent = message;
            
            // Set styles based on theme
            const toastStyles = `
                position: fixed;
                bottom: 150px;
                right: 20px;
                background: ${isDarkTheme ? '#4CAF50' : '#2E7D32'};
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                z-index: 1000;
                animation: toastSlideIn 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                font-weight: 500;
                font-size: 0.95rem;
                border: none;
                max-width: 300px;
                text-align: center;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            `;
            
            toast.style.cssText = toastStyles;
            
            document.body.appendChild(toast);
            
            // Remove toast after 3 seconds
            setTimeout(() => {
                toast.style.animation = 'toastSlideOut 0.3s ease';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        }
        
        // Add toast animations to style
        const toastStyleElement = document.createElement('style');
        toastStyleElement.textContent = `
            @keyframes toastSlideIn {
                from {
                    transform: translateX(100%) translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0) translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes toastSlideOut {
                from {
                    transform: translateX(0) translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%) translateY(20px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(toastStyleElement);
        
        // Optional: Debug function (can be called from console)
        window.debugSpotlight = function() {
            console.log('Current spotlight data:', localStorage.getItem(SPOTLIGHT_KEY));
            console.log('Last updated:', localStorage.getItem(SPOTLIGHT_DATE_KEY));
            console.log('Today:', getTodaysDate());
            console.log('Should refresh?', shouldRefreshSpotlight());
        };
    });

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
});

// Keyboard Shortcuts Overlay Functionality
document.addEventListener('DOMContentLoaded', function() {
    const shortcutsOverlay = document.getElementById('keyboardShortcutsOverlay');
    const closeShortcutsBtn = document.getElementById('closeShortcuts');
    
    // Function to show shortcuts overlay
    function showShortcutsOverlay() {
        shortcutsOverlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Function to hide shortcuts overlay
    function hideShortcutsOverlay() {
        shortcutsOverlay.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
    
    // Show overlay when "?" key is pressed
    document.addEventListener('keydown', function(e) {
        // Only trigger if not typing in an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (e.key === '?' || e.key === '¿') {
            e.preventDefault();
            showShortcutsOverlay();
        }
        
        // Also hide overlay with Escape key
        if (e.key === 'Escape' && shortcutsOverlay.classList.contains('show')) {
            hideShortcutsOverlay();
        }
    });
    
    // Close overlay when close button is clicked
    if (closeShortcutsBtn) {
        closeShortcutsBtn.addEventListener('click', hideShortcutsOverlay);
    }
    
    // Close overlay when clicking outside the modal
    shortcutsOverlay.addEventListener('click', function(e) {
        if (e.target === shortcutsOverlay) {
            hideShortcutsOverlay();
        }
    });

    /* ===============================
       NAVBAR DROPDOWN (More / Resources)
       =============================== */
    document.addEventListener("DOMContentLoaded", () => {
        const dropdownButtons = document.querySelectorAll(".drop-btn");

        dropdownButtons.forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();

                const menu = btn.nextElementSibling;

                // Close other dropdowns
                document.querySelectorAll(".dropdown-menu").forEach(m => {
                    if (m !== menu) m.style.display = "none";
                });

                // Toggle current dropdown
                menu.style.display =
                    menu.style.display === "block" ? "none" : "block";
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", () => {
            document.querySelectorAll(".dropdown-menu").forEach(menu => {
                menu.style.display = "none";
            });
        });
    });
});