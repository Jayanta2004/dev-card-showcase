// js/communityGuidlines.js
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

        // Reading Progress
        document.addEventListener('DOMContentLoaded', function() {
            const progressBar = document.getElementById('progressBar');
            const tocLinks = document.querySelectorAll('.toc a');
            const sections = document.querySelectorAll('h2[id]');
            
            function updateProgress() {
                const scrollTop = window.pageYOffset;
                const docHeight = document.body.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                progressBar.style.width = scrollPercent + '%';
            }
            
            function updateActiveSection() {
                let current = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    if (window.pageYOffset >= sectionTop - 200) {
                        current = section.getAttribute('id');
                    }
                });
                
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === current) {
                        link.classList.add('active');
                    }
                });
            }
            
            tocLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });
            
            window.addEventListener('scroll', function() {
                updateProgress();
                updateActiveSection();
            });
            
            updateProgress();
            updateActiveSection();
        });
