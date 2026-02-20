// Theme Toggle Button
        // Theme Toggle
        function toggleTheme() {
            const body = document.body;
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = document.querySelector('.theme-toggle i');
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        const icon = document.querySelector('.theme-toggle i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        // Event Filtering
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active filter
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                const events = document.querySelectorAll('.event-card');
                
                events.forEach(event => {
                    if (filter === 'all' || event.getAttribute('data-type') === filter) {
                        event.style.display = 'block';
                    } else {
                        event.style.display = 'none';
                    }
                });
            });
        });

        // Calendar Navigation
        let currentMonth = 11; // December (0-indexed)
        let currentYear = 2024;

        function previousMonth() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateCalendar();
        }

        function nextMonth() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateCalendar();
        }

        function updateCalendar() {
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
            
            document.querySelector('.calendar-month').textContent = `${months[currentMonth]} ${currentYear}`;
            
            // Here you would update the calendar grid with the correct dates
            // This is a simplified version - in a real app, you'd calculate the correct dates
        }

        // Event Card Click Handlers
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', () => {
                // Here you could open a modal with more event details
                console.log('Event clicked:', card.querySelector('.event-title').textContent);
            });
        });

        // Upcoming Event Click Handlers
        document.querySelectorAll('.upcoming-event').forEach(event => {
            event.addEventListener('click', () => {
                // Scroll to the corresponding event in the main list
                const title = event.querySelector('.upcoming-event-title').textContent;
                console.log('Upcoming event clicked:', title);
            });
        });
