// Timezone Meeting Planner - Main Application Logic

document.addEventListener('DOMContentLoaded', function() {
    // Application state
    const state = {
        timezones: [],
        selectedTime: new Date(),
        startHour: 6,
        endHour: 22,
        meetingDuration: 60, // in minutes
        highlightOverlap: true,
        show24Hour: false,
        theme: localStorage.getItem('theme') || 'light'
    };
    
    // DOM Elements
    const elements = {
        // Theme toggler
        themeToggle: document.getElementById('themeToggle'),
        themeIcon: document.querySelector('#themeToggle i'),
        
        // Timezone management
        cityName: document.getElementById('cityName'),
        timezoneSelect: document.getElementById('timezoneSelect'),
        workingStart: document.getElementById('workingStart'),
        workingEnd: document.getElementById('workingEnd'),
        addTimezone: document.getElementById('addTimezone'),
        presetButtons: document.querySelectorAll('.preset-btn'),
        timezoneList: document.getElementById('timezoneList'),
        timezoneCount: document.getElementById('timezoneCount'),
        removeAllBtn: document.getElementById('resetAll'),
        
        // Time slider
        timeSlider: document.getElementById('timeSlider'),
        meetingBar: document.getElementById('meetingBar'),
        meetingHandle: document.getElementById('meetingHandle'),
        handleTime: document.getElementById('handleTime'),
        selectedTime: document.getElementById('selectedTime'),
        selectedTimeLabel: document.getElementById('selectedTimeLabel'),
        startTimeLabel: document.getElementById('startTimeLabel'),
        endTimeLabel: document.getElementById('endTimeLabel'),
        startHour: document.getElementById('startHour'),
        endHour: document.getElementById('endHour'),
        startHourValue: document.getElementById('startHourValue'),
        endHourValue: document.getElementById('endHourValue'),
        meetingDurationSelect: document.getElementById('meetingDuration'),
        meetingDurationVisual: document.getElementById('meetingDurationVisual'),
        
        // Controls
        prevHour: document.getElementById('prevHour'),
        nextHour: document.getElementById('nextHour'),
        setToNow: document.getElementById('setToNow'),
        highlightOverlapCheckbox: document.getElementById('highlightOverlap'),
        show24HourCheckbox: document.getElementById('show24Hour'),
        
        // Invite text
        copyInvite: document.getElementById('copyInvite'),
        copyInviteBottom: document.getElementById('copyInviteBottom'),
        clearInvite: document.getElementById('clearInvite'),
        inviteText: document.getElementById('inviteText'),
        
        // Golden hours
        goldenHoursInfo: document.getElementById('goldenHoursInfo'),
        goldenHoursCount: document.getElementById('goldenHoursCount'),
        
        // Current time display
        currentTimeDisplay: document.getElementById('currentTimeDisplay'),
        currentDateDisplay: document.getElementById('currentDateDisplay'),
        
        // Toast
        toast: document.getElementById('toast')
    };
    
    // Initialize the application
    function init() {
        // Set theme
        setTheme(state.theme);
        
        // Populate timezone select
        populateTimezoneSelect();
        
        // Load any saved timezones from localStorage
        loadSavedTimezones();
        
        // Initialize event listeners
        initEventListeners();
        
        // Initialize time display
        updateCurrentTime();
        setInterval(updateCurrentTime, 1000);
        
        // Set initial selected time to 9 AM
        setInitialTime();
        
        // Update UI
        updateTimezoneList();
        updateSliderPosition();
        updateGoldenHoursInfo();
        
        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }
    
    // Set initial time to 9 AM
    function setInitialTime() {
        const now = new Date();
        now.setHours(9, 0, 0, 0);
        state.selectedTime = now;
        updateSelectedTimeDisplay();
    }
    
    // Theme toggling
    function setTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update icon
        elements.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Populate timezone select with Intl API
    function populateTimezoneSelect() {
        // Get timezones from Intl API
        const timezones = Intl.supportedValuesOf('timeZone');
        
        // Sort timezones by their offset from UTC
        timezones.sort((a, b) => {
            const offsetA = getTimezoneOffset(a);
            const offsetB = getTimezoneOffset(b);
            return offsetA - offsetB;
        });
        
        // Clear existing options
        elements.timezoneSelect.innerHTML = '<option value="">Select a timezone...</option>';
        
        // Add timezone options
        timezones.forEach(timezone => {
            const option = document.createElement('option');
            option.value = timezone;
            
            // Format timezone name for display
            const offset = getTimezoneOffset(timezone);
            const offsetStr = formatTimezoneOffset(offset);
            const cityName = timezone.split('/').pop().replace(/_/g, ' ');
            
            option.textContent = `(UTC${offsetStr}) ${cityName}`;
            elements.timezoneSelect.appendChild(option);
        });
    }
    
    // Get timezone offset in minutes
    function getTimezoneOffset(timezone) {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'short'
        });
        
        const parts = formatter.formatToParts(now);
        const timeZoneName = parts.find(part => part.type === 'timeZoneName').value;
        
        // Parse offset from string like "GMT-5" or "GMT+5:30"
        if (timeZoneName.startsWith('GMT')) {
            const offsetStr = timeZoneName.substring(3);
            if (offsetStr === '') return 0;
            
            const sign = offsetStr.charAt(0) === '-' ? -1 : 1;
            const parts = offsetStr.substring(1).split(':');
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            
            return sign * (hours * 60 + minutes);
        }
        
        return 0;
    }
    
    // Format timezone offset as string
    function formatTimezoneOffset(offsetMinutes) {
        const sign = offsetMinutes >= 0 ? '+' : '-';
        const absOffset = Math.abs(offsetMinutes);
        const hours = Math.floor(absOffset / 60);
        const minutes = absOffset % 60;
        
        if (minutes === 0) {
            return `${sign}${hours.toString().padStart(2, '0')}`;
        } else {
            return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    }
    
    // Load saved timezones from localStorage
    function loadSavedTimezones() {
        const saved = localStorage.getItem('timezoneMeetingPlanner_timezones');
        if (saved) {
            try {
                state.timezones = JSON.parse(saved);
                
                // Convert string dates back to Date objects
                state.timezones.forEach(tz => {
                    tz.added = new Date(tz.added);
                });
            } catch (e) {
                console.error('Error loading saved timezones:', e);
                state.timezones = [];
            }
        }
    }
    
    // Save timezones to localStorage
    function saveTimezones() {
        localStorage.setItem('timezoneMeetingPlanner_timezones', JSON.stringify(state.timezones));
    }
    
    // Initialize event listeners
    function initEventListeners() {
        // Theme toggle
        elements.themeToggle.addEventListener('click', () => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
        
        // Add timezone
        elements.addTimezone.addEventListener('click', addTimezone);
        
        // Preset timezone buttons
        elements.presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const city = e.target.getAttribute('data-city');
                const timezone = e.target.getAttribute('data-timezone');
                
                elements.cityName.value = city;
                elements.timezoneSelect.value = timezone;
                elements.workingStart.value = '09:00';
                elements.workingEnd.value = '17:00';
                
                // Trigger add timezone after a brief delay
                setTimeout(() => addTimezone(), 100);
            });
        });
        
        // Time slider
        elements.timeSlider.addEventListener('input', updateTimeFromSlider);
        elements.timeSlider.addEventListener('change', updateTimeFromSlider);
        
        // Hour controls
        elements.prevHour.addEventListener('click', () => adjustTime(-60));
        elements.nextHour.addEventListener('click', () => adjustTime(60));
        elements.setToNow.addEventListener('click', setToCurrentTime);
        
        // Day range sliders
        elements.startHour.addEventListener('input', updateDayRange);
        elements.endHour.addEventListener('input', updateDayRange);
        
        // Settings
        elements.meetingDurationSelect.addEventListener('change', updateMeetingDuration);
        elements.highlightOverlapCheckbox.addEventListener('change', toggleHighlightOverlap);
        elements.show24HourCheckbox.addEventListener('change', toggle24HourFormat);
        
        // Copy invite buttons
        elements.copyInvite.addEventListener('click', copyInviteText);
        elements.copyInviteBottom.addEventListener('click', copyInviteText);
        elements.clearInvite.addEventListener('click', clearInviteText);
        
        // Reset all button
        elements.removeAllBtn.addEventListener('click', resetAll);
        
        // Allow dragging the meeting bar
        initMeetingBarDrag();
    }
    
    // Add a new timezone
    function addTimezone() {
        const city = elements.cityName.value.trim();
        const timezone = elements.timezoneSelect.value;
        const workingStart = elements.workingStart.value;
        const workingEnd = elements.workingEnd.value;
        
        // Validation
        if (!city) {
            showToast('Please enter a city name', 'warning');
            return;
        }
        
        if (!timezone) {
            showToast('Please select a timezone', 'warning');
            return;
        }
        
        // Check if timezone already added
        if (state.timezones.some(tz => tz.timezone === timezone)) {
            showToast('This timezone is already added', 'warning');
            return;
        }
        
        // Parse working hours
        const [startHour, startMinute] = workingStart.split(':').map(Number);
        const [endHour, endMinute] = workingEnd.split(':').map(Number);
        
        // Add to state
        const newTimezone = {
            id: Date.now(),
            city,
            timezone,
            workingStart: { hour: startHour, minute: startMinute },
            workingEnd: { hour: endHour, minute: endMinute },
            added: new Date()
        };
        
        state.timezones.push(newTimezone);
        
        // Clear form
        elements.cityName.value = '';
        elements.timezoneSelect.value = '';
        
        // Update UI and save
        updateTimezoneList();
        saveTimezones();
        updateGoldenHoursInfo();
        
        showToast(`Added ${city} timezone`, 'success');
    }
    
    // Remove a timezone
    function removeTimezone(id) {
        state.timezones = state.timezones.filter(tz => tz.id !== id);
        updateTimezoneList();
        saveTimezones();
        updateGoldenHoursInfo();
    }
    
    // Update the timezone list display
    function updateTimezoneList() {
        elements.timezoneList.innerHTML = '';
        elements.timezoneCount.textContent = state.timezones.length;
        
        if (state.timezones.length === 0) {
            elements.timezoneList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-globe-americas"></i>
                    </div>
                    <h3>No timezones added yet</h3>
                    <p>Add timezones using the form on the left to get started.</p>
                    <p>Or click one of the preset cities to add quickly.</p>
                </div>
            `;
            return;
        }
        
        // Calculate golden hours (overlapping working hours)
        const goldenHours = calculateGoldenHours();
        
        // Create timezone cards
        state.timezones.forEach(timezone => {
            const card = document.createElement('div');
            card.className = 'timezone-card';
            
            // Check if this is a golden hour for the selected time
            const isGoldenHour = isTimeInGoldenHour(timezone, goldenHours);
            if (isGoldenHour && state.highlightOverlap) {
                card.classList.add('golden-hour');
            }
            
            // Get current time in this timezone
            const localTime = getTimeInTimezone(state.selectedTime, timezone.timezone);
            const formattedTime = formatTime(localTime, state.show24Hour);
            const offset = getTimezoneOffset(timezone.timezone);
            const offsetStr = formatTimezoneOffset(offset);
            
            // Calculate working hours position for visualization
            const dayStartHour = state.startHour;
            const dayEndHour = state.endHour;
            const dayDuration = dayEndHour - dayStartHour;
            
            const workStartHour = timezone.workingStart.hour + timezone.workingStart.minute / 60;
            const workEndHour = timezone.workingEnd.hour + timezone.workingEnd.minute / 60;
            
            const workStartPercent = ((workStartHour - dayStartHour) / dayDuration) * 100;
            const workEndPercent = ((workEndHour - dayStartHour) / dayDuration) * 100;
            const workWidthPercent = Math.max(0, Math.min(100, workEndPercent - workStartPercent));
            
            // Current time indicator position
            const currentHour = localTime.getHours() + localTime.getMinutes() / 60;
            const currentPercent = ((currentHour - dayStartHour) / dayDuration) * 100;
            
            card.innerHTML = `
                <div class="timezone-card-header">
                    <div>
                        <div class="timezone-city">${timezone.city}</div>
                        <div class="timezone-info">
                            <div class="timezone-time">${formattedTime}</div>
                            <div class="timezone-offset">${timezone.timezone} (UTC${offsetStr})</div>
                        </div>
                    </div>
                    <button class="remove-timezone" data-id="${timezone.id}" aria-label="Remove timezone">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="timezone-working-hours">
                    <div class="working-hours-label">
                        Working hours: ${formatHourMinute(timezone.workingStart)} - ${formatHourMinute(timezone.workingEnd)}
                    </div>
                    <div class="working-hours-visual">
                        <div class="working-hours-bar" style="left: ${workStartPercent}%; width: ${workWidthPercent}%"></div>
                        <div class="current-time-indicator" style="left: ${currentPercent}%"></div>
                    </div>
                </div>
            `;
            
            elements.timezoneList.appendChild(card);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-timezone').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                removeTimezone(id);
            });
        });
        
        // Update invite text
        updateInviteText();
    }
    
    // Calculate overlapping working hours (golden hours)
    function calculateGoldenHours() {
        if (state.timezones.length === 0) return [];
        
        const dayStartHour = state.startHour;
        const dayEndHour = state.endHour;
        const goldenHours = [];
        
        // Check each 15-minute interval
        for (let hour = dayStartHour; hour < dayEndHour; hour += 0.25) {
            let isGolden = true;
            
            // Check if this time is within working hours for all timezones
            for (const tz of state.timezones) {
                const localTime = getTimeInTimezone(state.selectedTime, tz.timezone);
                localTime.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
                
                const currentHour = localTime.getHours() + localTime.getMinutes() / 60;
                const workStartHour = tz.workingStart.hour + tz.workingStart.minute / 60;
                const workEndHour = tz.workingEnd.hour + tz.workingEnd.minute / 60;
                
                // Check if current time is within working hours
                if (currentHour < workStartHour || currentHour >= workEndHour) {
                    isGolden = false;
                    break;
                }
            }
            
            if (isGolden) {
                goldenHours.push(hour);
            }
        }
        
        // Group consecutive hours
        const grouped = [];
        let currentGroup = [];
        
        for (let i = 0; i < goldenHours.length; i++) {
            if (i === 0 || goldenHours[i] - goldenHours[i-1] <= 0.25) {
                currentGroup.push(goldenHours[i]);
            } else {
                grouped.push([...currentGroup]);
                currentGroup = [goldenHours[i]];
            }
        }
        
        if (currentGroup.length > 0) {
            grouped.push(currentGroup);
        }
        
        return grouped;
    }
    
    // Check if a timezone is in golden hour for selected time
    function isTimeInGoldenHour(timezone, goldenHours) {
        const localTime = getTimeInTimezone(state.selectedTime, timezone.timezone);
        const currentHour = localTime.getHours() + localTime.getMinutes() / 60;
        
        for (const group of goldenHours) {
            if (currentHour >= group[0] && currentHour <= group[group.length - 1] + 0.25) {
                return true;
            }
        }
        
        return false;
    }
    
    // Update golden hours info display
    function updateGoldenHoursInfo() {
        const goldenHours = calculateGoldenHours();
        const totalHours = goldenHours.reduce((total, group) => total + group.length * 0.25, 0);
        
        elements.goldenHoursCount.textContent = totalHours.toFixed(1);
        
        if (state.timezones.length === 0) {
            elements.goldenHoursInfo.style.display = 'none';
        } else {
            elements.goldenHoursInfo.style.display = 'flex';
        }
    }
    
    // Get time in a specific timezone
    function getTimeInTimezone(date, timezone) {
        return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    }
    
    // Format time based on 12/24 hour setting
    function formatTime(date, use24Hour = false) {
        if (use24Hour) {
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else {
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // Convert 0 to 12
            return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }
    }
    
    // Format hour and minute object
    function formatHourMinute(hm) {
        const hour = hm.hour % 12 || 12;
        const ampm = hm.hour >= 12 ? 'PM' : 'AM';
        return `${hour}:${hm.minute.toString().padStart(2, '0')} ${ampm}`;
    }
    
    // Update selected time from slider
    function updateTimeFromSlider() {
        const sliderValue = parseInt(elements.timeSlider.value);
        const dayStartHour = state.startHour;
        
        // Calculate hour based on slider (4 steps per hour)
        const hour = dayStartHour + (sliderValue / 4);
        const hourInt = Math.floor(hour);
        const minute = (hour % 1) * 60;
        
        // Update selected time
        state.selectedTime.setHours(hourInt, minute, 0, 0);
        
        // Update UI
        updateSelectedTimeDisplay();
        updateSliderPosition();
        updateTimezoneList();
        updateGoldenHoursInfo();
    }
    
    // Update slider position based on selected time
    function updateSliderPosition() {
        const dayStartHour = state.startHour;
        const dayEndHour = state.endHour;
        const dayDuration = dayEndHour - dayStartHour;
        
        const currentHour = state.selectedTime.getHours() + state.selectedTime.getMinutes() / 60;
        const percent = ((currentHour - dayStartHour) / dayDuration) * 100;
        
        // Clamp between 0 and 100
        const clampedPercent = Math.max(0, Math.min(100, percent));
        
        // Update meeting bar position
        elements.meetingBar.style.left = `${clampedPercent}%`;
        
        // Update slider value (4 steps per hour)
        const sliderValue = Math.round(((currentHour - dayStartHour) * 4));
        elements.timeSlider.value = Math.max(0, Math.min(96, sliderValue));
        
        // Update handle time
        elements.handleTime.textContent = formatTime(state.selectedTime, state.show24Hour);
    }
    
    // Update selected time display
    function updateSelectedTimeDisplay() {
        elements.selectedTime.textContent = formatTime(state.selectedTime, state.show24Hour);
        elements.selectedTimeLabel.textContent = `Selected Time (${getLocalTimezone()}):`;
    }
    
    // Get local timezone name
    function getLocalTimezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    
    // Adjust time by minutes
    function adjustTime(minutes) {
        state.selectedTime.setMinutes(state.selectedTime.getMinutes() + minutes);
        updateSelectedTimeDisplay();
        updateSliderPosition();
        updateTimezoneList();
        updateGoldenHoursInfo();
    }
    
    // Set selected time to current time
    function setToCurrentTime() {
        state.selectedTime = new Date();
        updateSelectedTimeDisplay();
        updateSliderPosition();
        updateTimezoneList();
        updateGoldenHoursInfo();
    }
    
    // Update day range (start/end hour)
    function updateDayRange() {
        state.startHour = parseInt(elements.startHour.value);
        state.endHour = parseInt(elements.endHour.value);
        
        // Update display values
        elements.startHourValue.textContent = formatHour(state.startHour);
        elements.endHourValue.textContent = formatHour(state.endHour);
        
        // Update time labels
        elements.startTimeLabel.textContent = formatHour(state.startHour);
        elements.endTimeLabel.textContent = formatHour(state.endHour);
        
        // Update UI
        updateSliderPosition();
        updateTimezoneList();
        updateGoldenHoursInfo();
    }
    
    // Format hour for display
    function formatHour(hour) {
        if (state.show24Hour) {
            return `${hour.toString().padStart(2, '0')}:00`;
        } else {
            const displayHour = hour % 12 || 12;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            return `${displayHour} ${ampm}`;
        }
    }
    
    // Update meeting duration
    function updateMeetingDuration() {
        state.meetingDuration = parseInt(elements.meetingDurationSelect.value);
        
        // Update visual duration
        const dayStartHour = state.startHour;
        const dayEndHour = state.endHour;
        const dayDuration = dayEndHour - dayStartHour;
        const durationPercent = (state.meetingDuration / 60 / dayDuration) * 100;
        
        elements.meetingDurationVisual.style.width = `${durationPercent}%`;
    }
    
    // Toggle highlight overlap
    function toggleHighlightOverlap() {
        state.highlightOverlap = elements.highlightOverlapCheckbox.checked;
        updateTimezoneList();
    }
    
    // Toggle 24 hour format
    function toggle24HourFormat() {
        state.show24Hour = elements.show24HourCheckbox.checked;
        updateSelectedTimeDisplay();
        updateTimezoneList();
        updateDayRange(); // This will update hour labels
    }
    
    // Initialize meeting bar drag functionality
    function initMeetingBarDrag() {
        let isDragging = false;
        let startX = 0;
        let startLeft = 0;
        
        elements.meetingBar.addEventListener('mousedown', startDrag);
        elements.meetingBar.addEventListener('touchstart', startDragTouch);
        
        function startDrag(e) {
            isDragging = true;
            startX = e.clientX;
            startLeft = parseFloat(elements.meetingBar.style.left) || 0;
            
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            
            e.preventDefault();
        }
        
        function startDragTouch(e) {
            isDragging = true;
            startX = e.touches[0].clientX;
            startLeft = parseFloat(elements.meetingBar.style.left) || 0;
            
            document.addEventListener('touchmove', dragTouch);
            document.addEventListener('touchend', stopDrag);
            
            e.preventDefault();
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const sliderWidth = elements.meetingBar.parentElement.offsetWidth;
            const deltaX = e.clientX - startX;
            const deltaPercent = (deltaX / sliderWidth) * 100;
            let newLeft = startLeft + deltaPercent;
            
            // Clamp between 0 and 100
            newLeft = Math.max(0, Math.min(100, newLeft));
            
            // Update position
            elements.meetingBar.style.left = `${newLeft}%`;
            
            // Update selected time
            const dayStartHour = state.startHour;
            const dayEndHour = state.endHour;
            const dayDuration = dayEndHour - dayStartHour;
            const currentHour = dayStartHour + (newLeft / 100) * dayDuration;
            
            const hourInt = Math.floor(currentHour);
            const minute = (currentHour % 1) * 60;
            
            state.selectedTime.setHours(hourInt, minute, 0, 0);
            
            // Update UI
            updateSelectedTimeDisplay();
            updateTimezoneList();
            updateGoldenHoursInfo();
            
            // Update slider input
            const sliderValue = Math.round(((currentHour - dayStartHour) * 4));
            elements.timeSlider.value = Math.max(0, Math.min(96, sliderValue));
        }
        
        function dragTouch(e) {
            if (!isDragging) return;
            
            const sliderWidth = elements.meetingBar.parentElement.offsetWidth;
            const deltaX = e.touches[0].clientX - startX;
            const deltaPercent = (deltaX / sliderWidth) * 100;
            let newLeft = startLeft + deltaPercent;
            
            // Clamp between 0 and 100
            newLeft = Math.max(0, Math.min(100, newLeft));
            
            // Update position
            elements.meetingBar.style.left = `${newLeft}%`;
            
            // Update selected time
            const dayStartHour = state.startHour;
            const dayEndHour = state.endHour;
            const dayDuration = dayEndHour - dayStartHour;
            const currentHour = dayStartHour + (newLeft / 100) * dayDuration;
            
            const hourInt = Math.floor(currentHour);
            const minute = (currentHour % 1) * 60;
            
            state.selectedTime.setHours(hourInt, minute, 0, 0);
            
            // Update UI
            updateSelectedTimeDisplay();
            updateTimezoneList();
            updateGoldenHoursInfo();
            
            // Update slider input
            const sliderValue = Math.round(((currentHour - dayStartHour) * 4));
            elements.timeSlider.value = Math.max(0, Math.min(96, sliderValue));
            
            e.preventDefault();
        }
        
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('touchmove', dragTouch);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
        }
    }
    
    // Update invite text
    function updateInviteText() {
        if (state.timezones.length === 0) {
            elements.inviteText.textContent = 'Add timezones and select a meeting time to generate invite text.';
            return;
        }
        
        const formattedDate = state.selectedTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let invite = `Meeting Proposal\n`;
        invite += `Date: ${formattedDate}\n`;
        invite += `Time: ${formatTime(state.selectedTime, false)}\n`;
        invite += `Duration: ${state.meetingDuration} minutes\n\n`;
        invite += `Local Times:\n`;
        
        // Add times for each timezone
        state.timezones.forEach(tz => {
            const localTime = getTimeInTimezone(state.selectedTime, tz.timezone);
            const formattedLocalTime = formatTime(localTime, false);
            const offset = getTimezoneOffset(tz.timezone);
            const offsetStr = formatTimezoneOffset(offset);
            
            invite += `• ${tz.city}: ${formattedLocalTime} (UTC${offsetStr})\n`;
        });
        
        // Add end time
        const endTime = new Date(state.selectedTime.getTime() + state.meetingDuration * 60000);
        invite += `\nMeeting ends at: ${formatTime(endTime, false)}\n`;
        
        // Add note about golden hours if applicable
        const goldenHours = calculateGoldenHours();
        if (goldenHours.length > 0 && state.highlightOverlap) {
            invite += `\n✅ This time falls within overlapping working hours for all participants.`;
        }
        
        elements.inviteText.textContent = invite;
    }
    
    // Copy invite text to clipboard
    function copyInviteText() {
        if (state.timezones.length === 0) {
            showToast('Add timezones first to generate invite text', 'warning');
            return;
        }
        
        navigator.clipboard.writeText(elements.inviteText.textContent)
            .then(() => {
                showToast('Invite text copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                showToast('Failed to copy text to clipboard', 'error');
            });
    }
    
    // Clear invite text
    function clearInviteText() {
        elements.inviteText.textContent = 'Add timezones and select a meeting time to generate invite text.';
    }
    
    // Reset all timezones and settings
    function resetAll() {
        if (confirm('Are you sure you want to reset all timezones and settings?')) {
            state.timezones = [];
            state.selectedTime = new Date();
            state.selectedTime.setHours(9, 0, 0, 0);
            
            // Reset form values
            elements.cityName.value = '';
            elements.timezoneSelect.value = '';
            elements.workingStart.value = '09:00';
            elements.workingEnd.value = '17:00';
            
            // Reset settings
            elements.meetingDurationSelect.value = '60';
            elements.highlightOverlapCheckbox.checked = true;
            elements.show24HourCheckbox.checked = false;
            elements.startHour.value = '6';
            elements.endHour.value = '22';
            
            // Update state
            state.meetingDuration = 60;
            state.highlightOverlap = true;
            state.show24Hour = false;
            state.startHour = 6;
            state.endHour = 22;
            
            // Update UI
            updateTimezoneList();
            updateSliderPosition();
            updateDayRange();
            updateMeetingDuration();
            updateInviteText();
            updateGoldenHoursInfo();
            
            // Clear localStorage
            localStorage.removeItem('timezoneMeetingPlanner_timezones');
            
            showToast('All timezones and settings have been reset', 'success');
        }
    }
    
    // Update current time display
    function updateCurrentTime() {
        const now = new Date();
        const timeStr = formatTime(now, state.show24Hour);
        const dateStr = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        elements.currentTimeDisplay.textContent = timeStr;
        elements.currentDateDisplay.textContent = dateStr;
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = elements.toast;
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');
        
        // Update content
        toastMessage.textContent = message;
        
        // Update icon based on type
        switch(type) {
            case 'success':
                toastIcon.className = 'fas fa-check-circle toast-icon';
                toast.style.backgroundColor = 'var(--success-color)';
                break;
            case 'warning':
                toastIcon.className = 'fas fa-exclamation-triangle toast-icon';
                toast.style.backgroundColor = 'var(--warning-color)';
                break;
            case 'error':
                toastIcon.className = 'fas fa-times-circle toast-icon';
                toast.style.backgroundColor = 'var(--danger-color)';
                break;
        }
        
        // Show toast
        toast.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Initialize the app
    init();
});