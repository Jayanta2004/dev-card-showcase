
// ================== CONFIG & STATE ==================
const STORAGE_KEY = 'habit-tracker-data-v1';
let habits = [];
let selectedHabitId = null;
let reminders = {};

// ================== DOM ELEMENTS ==================
const el = {
	habitList: document.getElementById('habitList'),
	addHabitBtn: document.getElementById('addHabitBtn'),
	habitModal: document.getElementById('habitModal'),
	habitForm: document.getElementById('habitForm'),
	habitName: document.getElementById('habitName'),
	habitColor: document.getElementById('habitColor'),
	habitReminder: document.getElementById('habitReminder'),
	modalTitle: document.getElementById('modalTitle'),
	deleteHabitBtn: document.getElementById('deleteHabitBtn'),
	closeModalBtn: document.getElementById('closeModalBtn'),
	calendar: document.getElementById('calendar'),
	calendarTitle: document.getElementById('calendarTitle'),
	progressChart: document.getElementById('progressChart'),
	badges: document.getElementById('badges'),
	exportBtn: document.getElementById('exportBtn'),
	importBtn: document.getElementById('importBtn'),
	importFile: document.getElementById('importFile'),
	toastContainer: document.getElementById('toastContainer'),
	toggleTheme: document.getElementById('toggleTheme'),
	body: document.body
};

// ================== INIT ==================
document.addEventListener('DOMContentLoaded', () => {
	loadHabits();
	renderHabitList();
	if (habits.length) selectHabit(habits[0].id);
	setupEventListeners();
	applyTheme();
});

// ================== HABIT CRUD ==================
function loadHabits() {
	try {
		const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
		if (data && Array.isArray(data.habits)) {
			habits = data.habits;
			reminders = data.reminders || {};
		} else {
			habits = [];
			reminders = {};
		}
	} catch {
		habits = [];
		reminders = {};
	}
}

function saveHabits() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits, reminders }));
}

function addHabit(habit) {
	habits.push(habit);
	saveHabits();
	renderHabitList();
	selectHabit(habit.id);
	showToast('Habit added!', 'success');
}

function updateHabit(id, updates) {
	const habit = habits.find(h => h.id === id);
	if (!habit) return;
	Object.assign(habit, updates);
	saveHabits();
	renderHabitList();
	selectHabit(id);
	showToast('Habit updated!', 'success');
}

function deleteHabit(id) {
	habits = habits.filter(h => h.id !== id);
	saveHabits();
	renderHabitList();
	if (habits.length) selectHabit(habits[0].id);
	else {
		selectedHabitId = null;
		el.calendar.innerHTML = '';
		el.calendarTitle.textContent = 'Calendar';
		renderAnalytics();
	}
	showToast('Habit deleted!', 'success');
}

// ================== HABIT LIST UI ==================
function renderHabitList() {
	el.habitList.innerHTML = habits.map(habit => `
		<li data-id="${habit.id}" style="border-left: 8px solid ${habit.color};${selectedHabitId===habit.id?' background:var(--habit-primary);color:#fff;':''}">
			<span>${habit.name}</span>
			${habit.reminder ? `<i class='fas fa-bell' title='Reminder: ${habit.reminder}'></i>` : ''}
		</li>
	`).join('') || '<li style="color:#64748b;">No habits yet.</li>';
}

function selectHabit(id) {
	selectedHabitId = id;
	renderHabitList();
	renderCalendar();
	renderAnalytics();
}

// ================== CALENDAR ==================
function renderCalendar() {
	const habit = habits.find(h => h.id === selectedHabitId);
	if (!habit) return;
	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth();
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const daysInMonth = lastDay.getDate();
	const startDay = firstDay.getDay();
	el.calendarTitle.textContent = `${habit.name} - ${today.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
	let html = '';
	// Weekdays header
	['S','M','T','W','T','F','S'].forEach(d => html += `<div class='calendar-day' style='background:none;color:#64748b;cursor:default;'>${d}</div>`);
	// Empty days
	for (let i = 0; i < startDay; i++) html += `<div></div>`;
	// Days
	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
		const completed = habit.completions && habit.completions.includes(dateStr);
		const isToday = d === today.getDate();
		html += `<div class="calendar-day${completed ? ' completed' : ''}${isToday ? ' today' : ''}" data-date="${dateStr}">${d}</div>`;
	}
	el.calendar.innerHTML = html;
}

function toggleCompletion(dateStr) {
	const habit = habits.find(h => h.id === selectedHabitId);
	if (!habit) return;
	if (!habit.completions) habit.completions = [];
	const idx = habit.completions.indexOf(dateStr);
	if (idx > -1) habit.completions.splice(idx, 1);
	else habit.completions.push(dateStr);
	saveHabits();
	renderCalendar();
	renderAnalytics();
}

// ================== ANALYTICS & BADGES ==================
function renderAnalytics() {
	const habit = habits.find(h => h.id === selectedHabitId);
	if (!habit) {
		el.progressChart && el.progressChart.getContext && el.progressChart.getContext('2d').clearRect(0,0,el.progressChart.width,el.progressChart.height);
		el.badges.innerHTML = '';
		return;
	}
	// Progress chart (last 30 days)
	const today = new Date();
	const labels = [];
	const data = [];
	let streak = 0, maxStreak = 0, currentStreak = 0;
	let prevCompleted = false;
	for (let i = 29; i >= 0; i--) {
		const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
		const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
		labels.push(`${d.getMonth()+1}/${d.getDate()}`);
		const completed = habit.completions && habit.completions.includes(dateStr);
		data.push(completed ? 1 : 0);
		if (completed) {
			streak++;
			if (prevCompleted) currentStreak++;
			else currentStreak = 1;
			maxStreak = Math.max(maxStreak, currentStreak);
		} else {
			currentStreak = 0;
		}
		prevCompleted = completed;
	}
	// Chart.js
	if (window.progressChartObj) window.progressChartObj.destroy();
	window.progressChartObj = new Chart(el.progressChart, {
		type: 'bar',
		data: { labels, datasets: [{ label: 'Completed', data, backgroundColor: habit.color }] },
		options: { scales: { y: { beginAtZero: true, max: 1, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }
	});
	// Badges
	el.badges.innerHTML = '';
	if (maxStreak >= 7) el.badges.innerHTML += `<span class='badge'><i class='fas fa-fire'></i> 7-day Streak!</span>`;
	if (maxStreak >= 30) el.badges.innerHTML += `<span class='badge'><i class='fas fa-crown'></i> 30-day Streak!</span>`;
	if ((habit.completions?.length || 0) >= 100) el.badges.innerHTML += `<span class='badge'><i class='fas fa-medal'></i> 100 Completions!</span>`;
	if (!el.badges.innerHTML) el.badges.innerHTML = `<span class='badge'>No badges yet. Keep going!</span>`;
}

// ================== REMINDERS ==================
function scheduleReminders() {
	// Browser notifications (if supported)
	if (!('Notification' in window)) return;
	Notification.requestPermission();
	setInterval(() => {
		const now = new Date();
		habits.forEach(habit => {
			if (!habit.reminder) return;
			const [h, m] = habit.reminder.split(':').map(Number);
			if (now.getHours() === h && now.getMinutes() === m && now.getSeconds() === 0) {
				new Notification(`Habit Reminder: ${habit.name}`, { body: 'Time to complete your habit!' });
			}
		});
	}, 1000 * 30); // check every 30s
}
scheduleReminders();

// ================== DATA EXPORT/IMPORT ==================
function exportData() {
	const data = JSON.stringify({ habits, reminders });
	const blob = new Blob([data], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'habit-tracker-data.json';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	showToast('Data exported!', 'success');
}

function importData(file) {
	const reader = new FileReader();
	reader.onload = function(e) {
		try {
			const data = JSON.parse(e.target.result);
			if (Array.isArray(data.habits)) {
				habits = data.habits;
				reminders = data.reminders || {};
				saveHabits();
				renderHabitList();
				if (habits.length) selectHabit(habits[0].id);
				showToast('Data imported!', 'success');
			} else {
				showToast('Invalid data file', 'error');
			}
		} catch {
			showToast('Import failed', 'error');
		}
	};
	reader.readAsText(file);
}

// ================== THEME ==================
function applyTheme() {
	const theme = localStorage.getItem('habit-theme');
	if (theme === 'dark') el.body.classList.add('dark-theme');
	else el.body.classList.remove('dark-theme');
}
function toggleTheme() {
	el.body.classList.toggle('dark-theme');
	localStorage.setItem('habit-theme', el.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// ================== TOAST ==================
function showToast(msg, type = 'info') {
	const toast = document.createElement('div');
	toast.className = `toast toast-${type}`;
	toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> <span>${msg}</span>`;
	el.toastContainer.appendChild(toast);
	setTimeout(() => toast.classList.add('show'), 10);
	setTimeout(() => {
		toast.classList.remove('show');
		setTimeout(() => toast.remove(), 300);
	}, 3000);
}

// ================== EVENT LISTENERS ==================
function setupEventListeners() {
	// Habit list click
	el.habitList.addEventListener('click', e => {
		const li = e.target.closest('li[data-id]');
		if (li) selectHabit(li.dataset.id);
	});
	// Add habit
	el.addHabitBtn.addEventListener('click', () => openHabitModal());
	// Modal close
	el.closeModalBtn.addEventListener('click', closeHabitModal);
	// Modal form submit
	el.habitForm.addEventListener('submit', e => {
		e.preventDefault();
		const name = el.habitName.value.trim();
		const color = el.habitColor.value;
		const reminder = el.habitReminder.value;
		if (!name) return showToast('Name required', 'error');
		if (el.habitForm.dataset.editing) {
			updateHabit(el.habitForm.dataset.editing, { name, color, reminder });
		} else {
			addHabit({ id: Date.now().toString(), name, color, reminder, completions: [] });
		}
		closeHabitModal();
	});
	// Edit habit (double click)
	el.habitList.addEventListener('dblclick', e => {
		const li = e.target.closest('li[data-id]');
		if (li) openHabitModal(li.dataset.id);
	});
	// Delete habit
	el.deleteHabitBtn.addEventListener('click', () => {
		if (el.habitForm.dataset.editing) {
			if (confirm('Delete this habit?')) {
				deleteHabit(el.habitForm.dataset.editing);
				closeHabitModal();
			}
		}
	});
	// Calendar day click
	el.calendar.addEventListener('click', e => {
		const day = e.target.closest('.calendar-day[data-date]');
		if (day) toggleCompletion(day.dataset.date);
	});
	// Export
	el.exportBtn.addEventListener('click', exportData);
	// Import
	el.importBtn.addEventListener('click', () => el.importFile.click());
	el.importFile.addEventListener('change', e => {
		if (e.target.files[0]) importData(e.target.files[0]);
	});
	// Theme
	el.toggleTheme.addEventListener('click', toggleTheme);
}

function openHabitModal(id) {
	if (id) {
		const habit = habits.find(h => h.id === id);
		if (!habit) return;
		el.modalTitle.textContent = 'Edit Habit';
		el.habitName.value = habit.name;
		el.habitColor.value = habit.color;
		el.habitReminder.value = habit.reminder || '';
		el.habitForm.dataset.editing = id;
		el.deleteHabitBtn.style.display = '';
	} else {
		el.modalTitle.textContent = 'Add Habit';
		el.habitName.value = '';
		el.habitColor.value = '#2563eb';
		el.habitReminder.value = '';
		delete el.habitForm.dataset.editing;
		el.deleteHabitBtn.style.display = 'none';
	}
	el.habitModal.classList.add('active');
}

function closeHabitModal() {
	el.habitModal.classList.remove('active');
}
