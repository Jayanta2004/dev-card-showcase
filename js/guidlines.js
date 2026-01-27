
        // Theme Toggle Functionality - FIXED AND VISIBLE
        document.addEventListener('DOMContentLoaded', function() {
            const themeToggle = document.getElementById('themeToggle');
            const htmlElement = document.documentElement;
            
            // Check for saved theme preference or use light as default
            const savedTheme = localStorage.getItem('theme') || 'light';
            
            // Set initial theme
            htmlElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
            
            // Toggle theme on button click
            themeToggle.addEventListener('click', function() {
                const currentTheme = htmlElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                htmlElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme);
            });
            
            // Update theme icon
            function updateThemeIcon(theme) {
                themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
            }
        });

        // Hamburger menu toggle
        document.addEventListener('DOMContentLoaded', function() {
            const hamburger = document.getElementById('hamburger');
            const navLinks = document.getElementById('navLinks');
            
            if (hamburger && navLinks) {
                hamburger.addEventListener('click', function() {
                    navLinks.classList.toggle('active');
                    hamburger.classList.toggle('active');
                });
                
                // Close menu when clicking outside
                document.addEventListener('click', function(event) {
                    if (!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
                        navLinks.classList.remove('active');
                        hamburger.classList.remove('active');
                    }
                });
            }
        });

        // Scroll to section function
        function scrollToSection(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                const navbarHeight = 60;
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - navbarHeight - 20;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }

        // Progress indicator update on scroll
        window.addEventListener('scroll', function() {
            const sections = ['overview', 'core-guidelines', 'card-format', 'quick-reference'];
            const navbarHeight = 60;
            const scrollPosition = window.scrollY + navbarHeight + 100;
            
            let currentSection = '';
            sections.forEach(section => {
                const element = document.getElementById(section);
                if (element) {
                    const sectionTop = element.offsetTop;
                    const sectionHeight = element.offsetHeight;
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        currentSection = section;
                    }
                }
            });
            
            // Update progress dots
            const dots = document.querySelectorAll('.progress-dot');
            dots.forEach(dot => {
                const targetSection = dot.getAttribute('data-title').toLowerCase().replace(' ', '-');
                if (targetSection === currentSection) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        });

        // Toggle checklist
        function toggleCheckbox(element) {
            element.classList.toggle('checked');
        }

        // Initialize checklist
        document.addEventListener('DOMContentLoaded', function() {
            const checkboxes = document.querySelectorAll('.checklist-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('click', function() {
                    this.classList.toggle('checked');
                });
            });
        });

        // Cursor trail effect - NO SHADOW, VISIBLE
        document.addEventListener('DOMContentLoaded', function() {
            const circles = document.querySelectorAll('.circle');
            let mouseX = 0;
            let mouseY = 0;
            
            circles.forEach(circle => {
                circle.x = 0;
                circle.y = 0;
                // Different sizes for better visibility
                circle.style.width = circle.style.height = Math.random() * 15 + 10 + 'px';
            });
            
            window.addEventListener('mousemove', function(e) {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });
            
            function animateCircles() {
                let x = mouseX;
                let y = mouseY;
                
                circles.forEach((circle, index) => {
                    circle.style.left = x + 'px';
                    circle.style.top = y + 'px';
                    
                    const nextCircle = circles[index + 1] || circles[0];
                    x += (nextCircle.x - x) * 0.3;
                    y += (nextCircle.y - y) * 0.3;
                    
                    circle.x = x;
                    circle.y = y;
                    
                    // Size and opacity animation for visibility
                    const scale = (circles.length - index) / circles.length;
                    circle.style.transform = `translate(-50%, -50%) scale(${scale})`;
                    circle.style.opacity = scale * 0.6; // Higher opacity for visibility
                });
                
                requestAnimationFrame(animateCircles);
            }
            
            animateCircles();
        });
