// Event Data Structure
const eventsData = [
    {
        id: 'featured',
        title: 'Winter Innovation Hackathon 2026',
        category: 'hackathon',
        description: 'Join the biggest hackathon of the year! Build innovative AI-powered solutions, collaborate with developers worldwide, and compete for $50,000 in prizes.',
        startDate: '2026-02-15T09:00:00',
        endDate: '2026-02-17T18:00:00',
        registeredCount: 2347,
        capacity: 5000,
        location: 'Virtual & Hybrid',
        tags: ['ai', 'web', 'mobile'],
        agenda: [
            { time: '09:00 AM', title: 'Opening Ceremony', description: 'Welcome and introduction to the hackathon theme' },
            { time: '10:00 AM', title: 'Hacking Begins', description: 'Teams start building their projects' },
            { time: '01:00 PM', title: 'Lunch Break', description: 'Networking and refreshments' },
            { time: '03:00 PM', title: 'Workshop: AI Best Practices', description: 'Learn from industry experts' },
            { time: '06:00 PM', title: 'Day 1 Checkpoint', description: 'Share progress with mentors' }
        ]
    },
    {
        id: 'workshop-1',
        title: 'React Advanced Patterns Workshop',
        category: 'workshop',
        description: 'Master advanced React patterns including custom hooks, context optimization, and performance tuning.',
        startDate: '2026-02-08T14:00:00',
        endDate: '2026-02-08T17:00:00',
        registeredCount: 145,
        capacity: 200,
        location: 'Online',
        tags: ['web', 'react'],
        agenda: [
            { time: '02:00 PM', title: 'Introduction to Advanced Patterns', description: 'Overview of what we\'ll cover' },
            { time: '02:30 PM', title: 'Custom Hooks Deep Dive', description: 'Building reusable logic' },
            { time: '03:15 PM', title: 'Performance Optimization', description: 'React.memo, useMemo, useCallback' },
            { time: '04:00 PM', title: 'Q&A and Code Review', description: 'Interactive session' }
        ]
    },
    {
        id: 'sprint-1',
        title: 'Open Source Contribution Sprint',
        category: 'sprint',
        description: 'Contribute to popular open source projects. Perfect for beginners! Mentors will guide you through your first PR.',
        startDate: '2026-02-10T10:00:00',
        endDate: '2026-02-10T16:00:00',
        registeredCount: 567,
        capacity: 1000,
        location: 'Virtual',
        tags: ['opensource', 'beginner'],
        agenda: [
            { time: '10:00 AM', title: 'Orientation', description: 'Introduction to open source contribution' },
            { time: '10:30 AM', title: 'Choose Your Project', description: 'Select from curated list of beginner-friendly projects' },
            { time: '11:00 AM', title: 'Start Contributing', description: 'Work on issues with mentor support' },
            { time: '03:00 PM', title: 'PR Review Session', description: 'Get feedback on your contributions' }
        ]
    },
    {
        id: 'meetup-1',
        title: 'Developer Networking Meetup',
        category: 'meetup',
        description: 'Connect with fellow developers, share experiences, and build your professional network.',
        startDate: '2026-02-05T18:00:00',
        endDate: '2026-02-05T21:00:00',
        registeredCount: 89,
        capacity: 150,
        location: 'Hybrid (SF Bay Area)',
        tags: ['networking', 'social'],
        agenda: [
            { time: '06:00 PM', title: 'Welcome & Networking', description: 'Casual networking with snacks' },
            { time: '07:00 PM', title: 'Lightning Talks', description: '5-minute presentations from community members' },
            { time: '08:00 PM', title: 'Panel Discussion', description: 'Career advice from senior developers' },
            { time: '08:45 PM', title: 'Closing & More Networking', description: 'Continue conversations' }
        ]
    },
    {
        id: 'hackathon-2',
        title: 'Blockchain Innovation Challenge',
        category: 'hackathon',
        description: 'Build decentralized applications on cutting-edge blockchain platforms. Prize pool: $25,000.',
        startDate: '2026-02-20T09:00:00',
        endDate: '2026-02-22T18:00:00',
        registeredCount: 432,
        capacity: 800,
        location: 'Virtual',
        tags: ['blockchain', 'web3'],
        agenda: [
            { time: '09:00 AM', title: 'Kickoff & Theme Reveal', description: 'Introduction to challenge theme' },
            { time: '10:00 AM', title: 'Building Phase', description: 'Start creating your dApp' },
            { time: '02:00 PM', title: 'Workshop: Smart Contract Security', description: 'Best practices' },
            { time: '05:00 PM', title: 'Mentor Office Hours', description: 'Get help from blockchain experts' }
        ]
    },
    {
        id: 'workshop-2',
        title: 'Cloud Architecture Masterclass',
        category: 'workshop',
        description: 'Learn to design scalable, resilient cloud architectures on AWS, Azure, and GCP.',
        startDate: '2026-02-12T13:00:00',
        endDate: '2026-02-12T16:00:00',
        registeredCount: 234,
        capacity: 300,
        location: 'Online',
        tags: ['cloud', 'devops'],
        agenda: [
            { time: '01:00 PM', title: 'Cloud Fundamentals', description: 'Understanding cloud architecture' },
            { time: '01:45 PM', title: 'Microservices Design', description: 'Building distributed systems' },
            { time: '02:30 PM', title: 'Hands-on Lab', description: 'Deploy a multi-tier application' },
            { time: '03:30 PM', title: 'Q&A', description: 'Ask the experts' }
        ]
    }
];

// Past Events for Archive
const pastEvents = [
    {
        id: 'past-1',
        title: 'Fall Hackathon 2025',
        date: '2025-11-15',
        category: 'hackathon',
        highlight: '500+ Participants'
    },
    {
        id: 'past-2',
        title: 'AI/ML Workshop Series',
        date: '2025-12-10',
        category: 'workshop',
        highlight: 'Top Rated'
    },
    {
        id: 'past-3',
        title: 'Holiday Code Sprint',
        date: '2025-12-20',
        category: 'sprint',
        highlight: '100+ PRs Merged'
    }
];

// Timezone data
const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Australia/Sydney',
    'Pacific/Auckland'
];

// State management
let currentEvent = null;
let userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
let myRSVPs = JSON.parse(localStorage.getItem('myRSVPs') || '[]');
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let activeFilters = { category: 'all', tags: [] };

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initTimezone();
    initNotifications();
    renderCalendar();
    renderCarousel();
    renderEventsList();
    renderArchive();
    updateStats();
    startFeaturedCountdown();
});

// Theme Management
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = document.querySelector('.theme-toggle i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const icon = document.querySelector('.theme-toggle i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Timezone Management
function initTimezone() {
    document.getElementById('current-timezone').textContent = userTimezone;
    populateTimezoneList();
}

function showTimezoneModal() {
    document.getElementById('timezoneModal').classList.add('active');
}

function closeTimezoneModal() {
    document.getElementById('timezoneModal').classList.remove('active');
}

function populateTimezoneList() {
    const list = document.getElementById('timezoneList');
    list.innerHTML = timezones.map(tz => `
        <div class="timezone-item ${tz === userTimezone ? 'active' : ''}" onclick="selectTimezone('${tz}')">
            ${tz.replace(/_/g, ' ')}
        </div>
    `).join('');
}

function selectTimezone(timezone) {
    userTimezone = timezone;
    localStorage.setItem('userTimezone', timezone);
    document.getElementById('current-timezone').textContent = timezone;
    closeTimezoneModal();
    renderEventsList();
    renderCarousel();
}

function filterTimezones() {
    const search = document.getElementById('timezoneSearch').value.toLowerCase();
    const items = document.querySelectorAll('.timezone-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(search) ? 'block' : 'none';
    });
}

// Notifications
function initNotifications() {
    const toggle = document.getElementById('notification-toggle');
    toggle.checked = notificationsEnabled;
}

function toggleNotifications() {
    notificationsEnabled = document.getElementById('notification-toggle').checked;
    localStorage.setItem('notificationsEnabled', notificationsEnabled);
    
    if (notificationsEnabled && 'Notification' in window) {
        Notification.requestPermission();
    }
}

// Featured Event Countdown
function startFeaturedCountdown() {
    const featuredEvent = eventsData[0];
    const targetDate = new Date(featuredEvent.startDate).getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            document.getElementById('featured-countdown').innerHTML = 
                '<div style="text-align: center; width: 100%; color: var(--success); font-weight: 700;">Event is Live!</div>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Calendar
function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('calendarMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
    const todayDate = today.getDate();
    
    // Get event dates for this month
    const eventDates = eventsData
        .filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        })
        .map(event => new Date(event.startDate).getDate());
    
    let html = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => 
        `<div class="calendar-day header">${day}</div>`
    ).join('');
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month">${daysInPrevMonth - i}</div>`;
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = isCurrentMonth && day === todayDate;
        const hasEvent = eventDates.includes(day);
        const classes = ['calendar-day'];
        
        if (isToday) classes.push('today');
        if (hasEvent) classes.push('has-event');
        
        html += `<div class="${classes.join(' ')}" onclick="selectDate(${day})">${day}</div>`;
    }
    
    // Next month days
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    document.getElementById('calendarGrid').innerHTML = html;
}

function changeMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    renderCalendar();
}

function selectDate(day) {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const dayEvents = eventsData.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === selectedDate.toDateString();
    });
    
    if (dayEvents.length > 0) {
        showEventDetails(dayEvents[0].id);
    }
}

// Carousel
function renderCarousel() {
    const carousel = document.getElementById('eventsCarousel');
    const upcomingEvents = eventsData
        .filter(event => new Date(event.startDate) > new Date())
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 6);
    
    carousel.innerHTML = upcomingEvents.map(event => {
        const startDate = new Date(event.startDate);
        const timeUntil = getTimeUntil(startDate);
        const categoryIcons = {
            hackathon: 'fa-code',
            workshop: 'fa-chalkboard-teacher',
            sprint: 'fa-rocket',
            meetup: 'fa-users'
        };
        
        return `
            <div class="carousel-card" onclick="showEventDetails('${event.id}')">
                <div class="carousel-card-category ${event.category}">
                    <i class="fas ${categoryIcons[event.category]}"></i>
                    ${event.category.toUpperCase()}
                </div>
                <h3>${event.title}</h3>
                <div class="carousel-card-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(startDate)}
                </div>
                <div class="carousel-card-timer">
                    <i class="fas fa-clock"></i> ${timeUntil}
                </div>
            </div>
        `;
    }).join('');
}

function scrollCarousel(direction) {
    const carousel = document.getElementById('eventsCarousel');
    const scrollAmount = 350;
    
    if (direction === 'left') {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// Events List
function renderEventsList() {
    const list = document.getElementById('eventsList');
    let filteredEvents = eventsData;
    
    // Apply category filter
    if (activeFilters.category !== 'all') {
        filteredEvents = filteredEvents.filter(e => e.category === activeFilters.category);
    }
    
    // Apply tag filters
    if (activeFilters.tags.length > 0) {
        filteredEvents = filteredEvents.filter(e => 
            activeFilters.tags.some(tag => e.tags.includes(tag))
        );
    }
    
    list.innerHTML = filteredEvents.map(event => {
        const startDate = new Date(event.startDate);
        const capacityPercent = (event.registeredCount / event.capacity) * 100;
        const capacityClass = capacityPercent >= 90 ? 'danger' : capacityPercent >= 70 ? 'warning' : '';
        const isRSVPd = myRSVPs.includes(event.id);
        
        const categoryIcons = {
            hackathon: 'fa-code',
            workshop: 'fa-chalkboard-teacher',
            sprint: 'fa-rocket',
            meetup: 'fa-users'
        };
        
        return `
            <div class="event-card" onclick="showEventDetails('${event.id}')">
                <div class="event-card-header">
                    <div class="event-card-category ${event.category}">
                        <i class="fas ${categoryIcons[event.category]}"></i>
                        ${event.category.toUpperCase()}
                    </div>
                </div>
                <h3>${event.title}</h3>
                <div class="event-card-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(startDate)} - ${formatTime(startDate)}
                    <i class="fas fa-map-marker-alt" style="margin-left: 1rem;"></i>
                    ${event.location}
                </div>
                <p class="event-card-description">${event.description}</p>
                <div class="event-card-tags">
                    ${event.tags.map(tag => `<span class="event-tag">#${tag}</span>`).join('')}
                </div>
                <div class="event-card-meta">
                    <div>
                        <div class="event-participants">
                            <i class="fas fa-users"></i>
                            ${event.registeredCount} / ${event.capacity} registered
                        </div>
                        <div class="capacity-bar">
                            <div class="capacity-fill ${capacityClass}" style="width: ${capacityPercent}%"></div>
                        </div>
                    </div>
                    <div class="event-actions">
                        ${isRSVPd ? 
                            '<span class="event-btn event-btn-secondary"><i class="fas fa-check"></i> Registered</span>' :
                            `<button class="event-btn event-btn-primary" onclick="event.stopPropagation(); rsvpEvent('${event.id}')">
                                <i class="fas fa-check-circle"></i> RSVP
                            </button>`
                        }
                        <button class="event-btn event-btn-secondary" onclick="event.stopPropagation(); addToCalendar('${event.id}')">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filters
document.addEventListener('DOMContentLoaded', function() {
    // Category filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activeFilters.category = this.dataset.filter;
            renderEventsList();
        });
    });
    
    // Tag filters
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tag = this.dataset.tag;
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                activeFilters.tags.push(tag);
            } else {
                activeFilters.tags = activeFilters.tags.filter(t => t !== tag);
            }
            
            renderEventsList();
        });
    });
});

// Archive
function renderArchive() {
    const list = document.getElementById('archiveList');
    list.innerHTML = pastEvents.slice(0, 3).map(event => `
        <div class="archive-item" onclick="showPastEvent('${event.id}')">
            <div class="archive-item-title">
                ${event.title}
                <span class="archive-item-highlight">${event.highlight}</span>
            </div>
            <div class="archive-item-date">
                <i class="fas fa-calendar"></i> ${formatDate(new Date(event.date))}
            </div>
        </div>
    `).join('');
}

function showArchive() {
    alert('Full archive feature coming soon! This will show all past events with highlights and recordings.');
}

function showPastEvent(id) {
    alert('Past event details coming soon! This will show event highlights, recordings, and projects.');
}

// Stats
function updateStats() {
    document.getElementById('totalEvents').textContent = eventsData.length;
    document.getElementById('upcomingEvents').textContent = eventsData.filter(e => 
        new Date(e.startDate) > new Date()
    ).length;
    document.getElementById('totalParticipants').textContent = 
        eventsData.reduce((sum, e) => sum + e.registeredCount, 0).toLocaleString();
    document.getElementById('myRSVPs').textContent = myRSVPs.length;
}

// Event Details Modal
function showEventDetails(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;
    
    currentEvent = event;
    const modal = document.getElementById('eventModal');
    
    const categoryIcons = {
        hackathon: 'fa-code',
        workshop: 'fa-chalkboard-teacher',
        sprint: 'fa-rocket',
        meetup: 'fa-users'
    };
    
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const capacityPercent = (event.registeredCount / event.capacity) * 100;
    
    document.getElementById('modalCategory').innerHTML = `
        <i class="fas ${categoryIcons[event.category]}"></i>
        ${event.category.toUpperCase()}
    `;
    document.getElementById('modalCategory').className = `modal-category ${event.category}`;
    
    document.getElementById('modalTitle').textContent = event.title;
    
    document.getElementById('modalMeta').innerHTML = `
        <div class="meta-item">
            <i class="fas fa-calendar"></i>
            <span>${formatDate(startDate)}</span>
        </div>
        <div class="meta-item">
            <i class="fas fa-clock"></i>
            <span>${formatTime(startDate)} - ${formatTime(endDate)}</span>
        </div>
        <div class="meta-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>${event.location}</span>
        </div>
        <div class="meta-item">
            <i class="fas fa-users"></i>
            <span>${event.registeredCount} / ${event.capacity} registered</span>
        </div>
    `;
    
    // Countdown for modal
    if (startDate > new Date()) {
        const distance = startDate - new Date();
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        document.getElementById('modalCountdown').innerHTML = `
            <div class="countdown-timer">
                <div class="countdown-item">
                    <span class="countdown-value">${String(days).padStart(2, '0')}</span>
                    <span class="countdown-label">Days</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-value">${String(hours).padStart(2, '0')}</span>
                    <span class="countdown-label">Hours</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-value">${String(minutes).padStart(2, '0')}</span>
                    <span class="countdown-label">Minutes</span>
                </div>
            </div>
        `;
    } else {
        document.getElementById('modalCountdown').innerHTML = '';
    }
    
    document.getElementById('modalDescription').textContent = event.description;
    
    document.getElementById('modalAgenda').innerHTML = event.agenda.map(item => `
        <div class="agenda-item">
            <div class="agenda-time">${item.time}</div>
            <div class="agenda-content">
                <div class="agenda-title">${item.title}</div>
                <div class="agenda-description">${item.description}</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('modalTags').innerHTML = event.tags.map(tag => 
        `<span class="event-tag">#${tag}</span>`
    ).join('');
    
    document.getElementById('modalCapacity').innerHTML = `
        <div class="capacity-info">
            <span class="capacity-text">${event.registeredCount} / ${event.capacity} spots filled</span>
            <span class="capacity-percentage">${Math.round(capacityPercent)}%</span>
        </div>
        <div class="capacity-bar" style="max-width: 100%; height: 8px;">
            <div class="capacity-fill ${capacityPercent >= 90 ? 'danger' : capacityPercent >= 70 ? 'warning' : ''}" 
                 style="width: ${capacityPercent}%"></div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('eventModal').classList.remove('active');
    currentEvent = null;
}

// RSVP
function rsvpEvent(eventId) {
    const id = eventId || (currentEvent ? currentEvent.id : null);
    if (!id) return;
    
    if (myRSVPs.includes(id)) {
        alert('You are already registered for this event!');
        return;
    }
    
    myRSVPs.push(id);
    localStorage.setItem('myRSVPs', JSON.stringify(myRSVPs));
    
    const event = eventsData.find(e => e.id === id);
    event.registeredCount++;
    
    updateStats();
    renderEventsList();
    renderCarousel();
    
    alert(`Successfully registered for: ${event.title}!\n\nYou will receive reminder notifications before the event.`);
    
    if (currentEvent) {
        closeModal();
    }
}

// Calendar Options
function showCalendarOptions() {
    closeModal();
    document.getElementById('calendarModal').classList.add('active');
}

function closeCalendarModal() {
    document.getElementById('calendarModal').classList.remove('active');
}

function addToCalendar(eventId) {
    showCalendarOptions();
}

function addToGoogleCalendar() {
    if (!currentEvent) return;
    
    const start = new Date(currentEvent.startDate).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(currentEvent.endDate).toISOString().replace(/-|:|\.\d+/g, '');
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(currentEvent.title)}&dates=${start}/${end}&details=${encodeURIComponent(currentEvent.description)}&location=${encodeURIComponent(currentEvent.location)}`;
    
    window.open(url, '_blank');
    closeCalendarModal();
}

function addToOutlook() {
    if (!currentEvent) return;
    
    const start = new Date(currentEvent.startDate).toISOString();
    const end = new Date(currentEvent.endDate).toISOString();
    
    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(currentEvent.title)}&startdt=${start}&enddt=${end}&body=${encodeURIComponent(currentEvent.description)}&location=${encodeURIComponent(currentEvent.location)}`;
    
    window.open(url, '_blank');
    closeCalendarModal();
}

function downloadICS() {
    if (!currentEvent) return;
    
    const start = new Date(currentEvent.startDate).toISOString().replace(/-|:|\.\d+/g, '');
    const end = new Date(currentEvent.endDate).toISOString().replace(/-|:|\.\d+/g, '');
    
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${currentEvent.title}
DESCRIPTION:${currentEvent.description}
LOCATION:${currentEvent.location}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentEvent.title.replace(/\s+/g, '_')}.ics`;
    a.click();
    
    closeCalendarModal();
}

function addToAppleCalendar() {
    // Apple Calendar uses the same ICS format
    downloadICS();
}

function shareEvent() {
    if (!currentEvent) return;
    
    const url = `${window.location.origin}${window.location.pathname}?event=${currentEvent.id}`;
    
    if (navigator.share) {
        navigator.share({
            title: currentEvent.title,
            text: currentEvent.description,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        alert('Event link copied to clipboard!');
    }
}

// Utility Functions
function formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getTimeUntil(date) {
    const now = new Date();
    const diff = date - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `In ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
        return 'Starting soon!';
    }
}

// Close modals on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Check for event parameter in URL
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event');
    
    if (eventId) {
        setTimeout(() => showEventDetails(eventId), 500);
    }
});
