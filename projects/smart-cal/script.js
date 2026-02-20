    (function() {
        // ---------- data model ----------
        let events = [];
        let nextId = 100;

        // current selected date (YYYY-MM-DD)
        let selectedDate = '2025-03-15'; // default demo

        // ---------- helper: date utilities ----------
        function formatDate(year, month, day) {
            return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        }

        // get events for a specific date
        function getEventsForDate(dateStr) {
            return events.filter(e => e.date === dateStr);
        }

        // ---------- conflict detection ----------
        function checkConflictsOnDate(dateStr) {
            const dayEvents = getEventsForDate(dateStr);
            if (dayEvents.length < 2) return false;

            // sort by start time
            const sorted = [...dayEvents].sort((a,b) => a.start.localeCompare(b.start));
            for (let i = 0; i < sorted.length - 1; i++) {
                const current = sorted[i];
                const next = sorted[i+1];
                if (current.end > next.start) {
                    return true; // overlap
                }
            }
            return false;
        }

        // get all dates with conflicts (set)
        function getConflictDatesSet() {
            const conflictDates = new Set();
            const dates = [...new Set(events.map(e => e.date))];
            dates.forEach(d => {
                if (checkConflictsOnDate(d)) conflictDates.add(d);
            });
            return conflictDates;
        }

        // ---------- generate month view (March 2025 as demo) ----------
        function renderCalendar() {
            const year = 2025;
            const month = 2; // march (0-index) -> 2 = March
            const firstDay = new Date(year, month, 1).getDay(); // 0 = sun, we need mon=0 .. sun=6
            // adjust: our week starts monday (0 = monday) -> if sunday (0) becomes 6; if monday (1) becomes 0.
            let startOffset = (firstDay === 0) ? 6 : firstDay - 1; // mon=0 .. sun=6

            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const grid = document.getElementById('daysGrid');
            grid.innerHTML = '';

            const todayStr = '2025-03-15'; // static "today" for demo
            const conflictSet = getConflictDatesSet();

            for (let i = 0; i < startOffset; i++) {
                // empty cells
                const emptyCell = document.createElement('div');
                emptyCell.className = 'day-cell';
                emptyCell.style.background = 'transparent';
                emptyCell.style.boxShadow = 'none';
                emptyCell.style.border = '2px solid transparent';
                grid.appendChild(emptyCell);
            }

            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = formatDate(year, month+1, d);
                const dayEvents = getEventsForDate(dateStr);
                const hasEvents = dayEvents.length > 0;
                const isToday = (dateStr === todayStr);
                const isConflict = conflictSet.has(dateStr);

                const cell = document.createElement('div');
                cell.className = 'day-cell';
                if (isToday) cell.classList.add('today');
                if (hasEvents) cell.classList.add('has-events');
                if (isConflict) cell.classList.add('conflict-day');

                // day number
                const numberDiv = document.createElement('div');
                numberDiv.className = 'day-number';
                numberDiv.innerText = d;
                cell.appendChild(numberDiv);

                // show up to 2 events preview
                const maxPreview = 2;
                for (let j = 0; j < Math.min(dayEvents.length, maxPreview); j++) {
                    const ev = dayEvents[j];
                    const preview = document.createElement('div');
                    preview.className = `event-preview ${ev.priority}`;
                    preview.innerText = ev.title.substring(0, 4) + (ev.title.length>4?'..':'');
                    cell.appendChild(preview);
                }
                if (dayEvents.length > maxPreview) {
                    const more = document.createElement('div');
                    more.style.fontSize = '0.6rem';
                    more.innerText = `+${dayEvents.length-maxPreview}`;
                    cell.appendChild(more);
                }

                cell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedDate = dateStr;
                    renderCalendar(); // re-highlight
                    renderEventSidebar();
                });

                grid.appendChild(cell);
            }

            // highlight selected date border (if visible)
            // we can walk cells and compare date
            const cells = document.querySelectorAll('.day-cell');
            // remove any previous 'selected' style
            cells.forEach(c => c.style.border = ''); // reset
            // find cell with matching date (by comparing data attribute we could set)
            // easier: set dataset on cell
            cells.forEach((cell, idx) => {
                const dayNum = cell.querySelector('.day-number')?.innerText;
                if (dayNum) {
                    const dayInt = parseInt(dayNum, 10);
                    const dateStrCell = formatDate(year, month+1, dayInt);
                    if (dateStrCell === selectedDate) {
                        cell.style.border = '4px solid #1b7fb0';
                    }
                }
            });

            // update conflict badge
            const conflictBadge = document.getElementById('conflictWarning');
            if (conflictSet.size > 0) {
                conflictBadge.innerHTML = `⚠️ ${conflictSet.size} day(s) with conflicts`;
            } else {
                conflictBadge.innerHTML = '✅ no conflicts';
            }
        }

        // ---------- render right panel: events for selected date ----------
        function renderEventSidebar() {
            const displayEl = document.getElementById('selectedDateDisplay');
            displayEl.innerHTML = `${selectedDate} <small>click day to change</small>`;

            const dayEvents = getEventsForDate(selectedDate);
            dayEvents.sort((a,b) => a.start.localeCompare(b.start));

            const conflictDates = getConflictDatesSet();
            const hasConflictToday = conflictDates.has(selectedDate);

            const container = document.getElementById('eventListContainer');
            if (dayEvents.length === 0) {
                container.innerHTML = '<div style="color:#6b93b0;">✨ no events</div>';
                return;
            }

            let html = '';
            dayEvents.forEach(ev => {
                const conflictClass = hasConflictToday ? 'conflict' : '';
                html += `
                    <div class="event-item ${ev.priority} ${conflictClass}" data-event-id="${ev.id}">
                        <div class="event-info">
                            <span class="event-title">${ev.title}</span>
                            <span class="event-time">${ev.start} – ${ev.end}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span class="event-priority">${ev.priority}</span>
                            <button class="delete-event" data-id="${ev.id}">✕</button>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;

            // attach delete listeners
            document.querySelectorAll('.delete-event').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id, 10);
                    events = events.filter(e => e.id !== id);
                    renderCalendar();
                    renderEventSidebar();
                });
            });
        }

        // ---------- add new event ----------
        function addEvent() {
            const title = document.getElementById('eventTitle').value.trim() || 'untitled';
            const start = document.getElementById('startTime').value;
            const end = document.getElementById('endTime').value;
            const priority = document.getElementById('prioritySelect').value;

            if (!start || !end) {
                alert('set start/end time');
                return;
            }
            if (start >= end) {
                alert('end must be after start');
                return;
            }

            const newEvent = {
                id: nextId++,
                date: selectedDate,
                title: title,
                start: start,
                end: end,
                priority: priority
            };
            events.push(newEvent);
            renderCalendar();
            renderEventSidebar();
        }

        // ---------- seed demo events with overlapping for conflict example ----------
        function seedEvents() {
            events = [
                { id: 1, date: '2025-03-15', title: 'standup', start: '09:30', end: '10:30', priority: 'medium' },
                { id: 2, date: '2025-03-15', title: 'client call', start: '10:00', end: '11:15', priority: 'high' }, // conflict
                { id: 3, date: '2025-03-15', title: 'lunch', start: '12:00', end: '13:00', priority: 'low' },
                { id: 4, date: '2025-03-16', title: 'workshop', start: '14:00', end: '16:00', priority: 'high' },
                { id: 5, date: '2025-03-18', title: 'review', start: '11:00', end: '12:00', priority: 'medium' },
                { id: 6, date: '2025-03-18', title: 'planning', start: '11:30', end: '12:30', priority: 'medium' }, // conflict
                { id: 7, date: '2025-03-20', title: 'design critique', start: '15:00', end: '16:30', priority: 'low' },
            ];
            nextId = 100;
        }
        seedEvents();

        // ---------- attach listeners ----------
        document.getElementById('addEventBtn').addEventListener('click', addEvent);

        // initial render
        renderCalendar();
        renderEventSidebar();

        // also update conflict badge when events change
        window.updateAll = function() {
            renderCalendar();
            renderEventSidebar();
        };

        // optional: auto refresh after any delete (already)
    })();