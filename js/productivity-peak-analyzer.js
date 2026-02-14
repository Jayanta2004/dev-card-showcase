// Productivity Peak Analyzer JavaScript

class ProductivityAnalyzer {
    constructor() {
        this.tasks = this.loadTasks();
        this.chart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDateTime();
        this.renderTasks();
        this.renderChart();
        this.updatePeakHours();
    }

    setupEventListeners() {
        const taskForm = document.getElementById('taskForm');
        const timeRange = document.getElementById('timeRange');
        const refreshChart = document.getElementById('refreshChart');
        const clearHistory = document.getElementById('clearHistory');

        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        timeRange.addEventListener('change', () => this.renderChart());
        refreshChart.addEventListener('click', () => this.renderChart());
        clearHistory.addEventListener('click', () => this.clearAllTasks());
    }

    setDefaultDateTime() {
        const now = new Date();
        const dateTimeInput = document.getElementById('taskTime');
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        dateTimeInput.value = localDateTime;
    }

    addTask() {
        const taskName = document.getElementById('taskName').value.trim();
        const taskTime = document.getElementById('taskTime').value;
        const taskCategory = document.getElementById('taskCategory').value;

        if (!taskName || !taskTime) return;

        const task = {
            id: Date.now(),
            name: taskName,
            time: new Date(taskTime).toISOString(),
            category: taskCategory
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.renderChart();
        this.updatePeakHours();

        // Reset form
        document.getElementById('taskForm').reset();
        this.setDefaultDateTime();
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        if (this.tasks.length === 0) {
            taskList.innerHTML = '<p style="text-align: center; color: var(--text-secondary, #718096);">No tasks logged yet. Start by logging your first completed task!</p>';
            return;
        }

        this.tasks.slice(0, 10).forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';

            const taskTime = new Date(task.time);
            const timeString = taskTime.toLocaleString();

            taskItem.innerHTML = `
                <div class="task-info">
                    <div class="task-name">${task.name}</div>
                    <div class="task-details">
                        ${timeString} • ${task.category}
                    </div>
                </div>
                <button class="task-delete" data-id="${task.id}">
                    <i data-lucide="x"></i>
                </button>
            `;

            taskList.appendChild(taskItem);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.task-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.currentTarget.dataset.id);
                this.deleteTask(taskId);
            });
        });

        // Re-render Lucide icons
        lucide.createIcons();
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.renderChart();
        this.updatePeakHours();
    }

    clearAllTasks() {
        if (confirm('Are you sure you want to clear all task history? This action cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.renderChart();
            this.updatePeakHours();
        }
    }

    renderChart() {
        const timeRange = parseInt(document.getElementById('timeRange').value);
        const filteredTasks = this.getTasksInRange(timeRange);
        const heatmapData = this.calculateHeatmapData(filteredTasks);

        const heatmapGrid = document.getElementById('heatmapGrid');
        heatmapGrid.innerHTML = '';

        // Create header row with day labels
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        heatmapGrid.appendChild(this.createCell('', 'header-corner'));

        days.forEach(day => {
            heatmapGrid.appendChild(this.createCell(day, 'day-label'));
        });

        // Create grid rows
        for (let hour = 0; hour < 24; hour++) {
            // Hour label
            heatmapGrid.appendChild(this.createCell(`${hour}:00`, 'hour-label'));

            // Data cells for each day
            for (let day = 0; day < 7; day++) {
                const count = heatmapData[day][hour] || 0;
                const cell = this.createCell('', 'data-cell');
                cell.style.backgroundColor = this.getHeatmapColor(count);
                cell.setAttribute('data-count', count);
                cell.setAttribute('data-hour', hour);
                cell.setAttribute('data-day', day);
                cell.title = `${days[day]} ${hour}:00 - ${count} tasks`;
                heatmapGrid.appendChild(cell);
            }
        }
    }

    createCell(content, className) {
        const cell = document.createElement('div');
        cell.className = `heatmap-cell ${className}`;
        cell.textContent = content;
        return cell;
    }

    getHeatmapColor(count) {
        if (count === 0) return '#f7fafc';
        if (count === 1) return '#c6f6d5';
        if (count === 2) return '#9ae6b4';
        if (count === 3) return '#68d391';
        if (count === 4) return '#48bb78';
        return '#38a169'; // 5+
    }

    getTasksInRange(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.tasks.filter(task => new Date(task.time) >= cutoffDate);
    }

    calculateHourlyData(tasks) {
        const hourlyCounts = new Array(24).fill(0);

        tasks.forEach(task => {
            const hour = new Date(task.time).getHours();
            hourlyCounts[hour]++;
        });

        return hourlyCounts;
    }

    calculateHeatmapData(tasks) {
        // Initialize 7x24 grid (7 days x 24 hours)
        const heatmapData = Array.from({length: 7}, () => Array(24).fill(0));

        tasks.forEach(task => {
            const taskDate = new Date(task.time);
            const dayOfWeek = taskDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const hour = taskDate.getHours();

            // Convert to Monday-first (0 = Monday, 6 = Sunday)
            const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

            heatmapData[adjustedDay][hour]++;
        });

        return heatmapData;
    }

    updatePeakHours() {
        const timeRange = parseInt(document.getElementById('timeRange').value);
        const filteredTasks = this.getTasksInRange(timeRange);
        const hourlyData = this.calculateHourlyData(filteredTasks);

        // Find top 3 peak hours
        const hourCounts = hourlyData.map((count, hour) => ({ hour, count }));
        hourCounts.sort((a, b) => b.count - a.count);

        const peakHoursDiv = document.getElementById('peakHours');
        peakHoursDiv.innerHTML = '';

        if (hourCounts[0].count === 0) {
            peakHoursDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary, #718096);">No data available for peak hours analysis.</p>';
            return;
        }

        const topHours = hourCounts.slice(0, 3);

        topHours.forEach(({ hour, count }) => {
            const hourCard = document.createElement('div');
            hourCard.className = 'peak-hour-card';
            hourCard.innerHTML = `
                <div class="hour">${hour}:00</div>
                <div class="count">${count} task${count !== 1 ? 's' : ''}</div>
            `;
            peakHoursDiv.appendChild(hourCard);
        });
    }

    loadTasks() {
        const tasks = localStorage.getItem('productivityTasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    saveTasks() {
        localStorage.setItem('productivityTasks', JSON.stringify(this.tasks));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNavbar();
    new ProductivityAnalyzer();
});

// Initialize navbar
function initializeNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error));
}