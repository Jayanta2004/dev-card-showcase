// js/api-docs.js
        // Theme Toggle
        document.addEventListener('DOMContentLoaded', function() {
            const themeToggle = document.getElementById('themeToggle');
            const htmlElement = document.documentElement;
            const savedTheme = localStorage.getItem('theme') || 'light';
            
            htmlElement.setAttribute('data-theme', savedTheme);
            themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
            
            themeToggle.addEventListener('click', function() {
                const currentTheme = htmlElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                htmlElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
            });
        });

        // Hamburger Menu
        document.addEventListener('DOMContentLoaded', function() {
            const hamburger = document.getElementById('hamburger');
            const navLinks = document.getElementById('navLinks');
            
            hamburger.addEventListener('click', function() {
                navLinks.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        });

        // Sidebar Navigation
        document.addEventListener('DOMContentLoaded', function() {
            const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
            const sections = document.querySelectorAll('.api-section');
            
            // Smooth scroll for sidebar links
            sidebarLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            // Active section tracking
            function updateActiveSection() {
                let current = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    if (window.pageYOffset >= sectionTop - 200) {
                        current = section.getAttribute('id');
                    }
                });
                
                sidebarLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + current) {
                        link.classList.add('active');
                    }
                });
            }
            
            window.addEventListener('scroll', updateActiveSection);
            updateActiveSection();
        });

        // Copy Code Function
        function copyCode(button) {
            const codeBlock = button.closest('.code-block').querySelector('code');
            const text = codeBlock.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                button.textContent = 'Copied!';
                button.style.background = '#10b981';
                button.style.color = 'white';
                
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.style.background = 'transparent';
                    button.style.color = 'var(--primary)';
                }, 2000);
            });
        }
   