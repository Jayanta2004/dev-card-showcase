// cognitive-load-sleep-analyzer.js

let entries = JSON.parse(localStorage.getItem('cognitiveLoadSleepEntries')) || [];
let sleepGoal = parseFloat(localStorage.getItem('sleepGoal')) || 8.0;
let chartInstance = null;

// Filter state
let filters = {
    dateFrom: null,
    dateTo: null,
    loadMin: 1,
    loadMax: 10,
    qualityMin: 1,
    qualityMax: 10,
    sleepHoursMin: 0,
    sleepHoursMax: 24,
    workHoursMin: 0,
    workHoursMax: 24,
    searchText: ''
};

let filtersVisible = false;

document.addEventListener('DOMContentLoaded', function() {
    const sleepGoalInput = document.getElementById('sleepGoal');
    if (sleepGoalInput) {
        sleepGoalInput.value = sleepGoal;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('logDate');
    if (dateInput) {
        dateInput.value = today;
    }

    updateLoadValue();
    updateQualityValue();
    updateStats(); 
    updateChart();
    updateEntriesList();
    updateSleepDebtCalculator();
    
    initializeCharacterCounters();
    initializeFilters();
    initializeFilterEventListeners();
});

function initializeFilters() {
    // Set default values for filter inputs
    const loadMinInput = document.getElementById('filterLoadMin');
    const loadMaxInput = document.getElementById('filterLoadMax');
    const loadMinSlider = document.getElementById('filterLoadMinSlider');
    const loadMaxSlider = document.getElementById('filterLoadMaxSlider');
    
    if (loadMinInput) loadMinInput.value = 1;
    if (loadMaxInput) loadMaxInput.value = 10;
    if (loadMinSlider) loadMinSlider.value = 1;
    if (loadMaxSlider) loadMaxSlider.value = 10;
    
    const qualityMinInput = document.getElementById('filterQualityMin');
    const qualityMaxInput = document.getElementById('filterQualityMax');
    const qualityMinSlider = document.getElementById('filterQualityMinSlider');
    const qualityMaxSlider = document.getElementById('filterQualityMaxSlider');
    
    if (qualityMinInput) qualityMinInput.value = 1;
    if (qualityMaxInput) qualityMaxInput.value = 10;
    if (qualityMinSlider) qualityMinSlider.value = 1;
    if (qualityMaxSlider) qualityMaxSlider.value = 10;
    
    const sleepHoursMinInput = document.getElementById('filterSleepHoursMin');
    const sleepHoursMaxInput = document.getElementById('filterSleepHoursMax');
    const sleepHoursMinSlider = document.getElementById('filterSleepHoursMinSlider');
    const sleepHoursMaxSlider = document.getElementById('filterSleepHoursMaxSlider');
    
    if (sleepHoursMinInput) sleepHoursMinInput.value = 0;
    if (sleepHoursMaxInput) sleepHoursMaxInput.value = 24;
    if (sleepHoursMinSlider) sleepHoursMinSlider.value = 0;
    if (sleepHoursMaxSlider) sleepHoursMaxSlider.value = 24;
    
    const workHoursMinInput = document.getElementById('filterWorkHoursMin');
    const workHoursMaxInput = document.getElementById('filterWorkHoursMax');
    const workHoursMinSlider = document.getElementById('filterWorkHoursMinSlider');
    const workHoursMaxSlider = document.getElementById('filterWorkHoursMaxSlider');
    
    if (workHoursMinInput) workHoursMinInput.value = 0;
    if (workHoursMaxInput) workHoursMaxInput.value = 24;
    if (workHoursMinSlider) workHoursMinSlider.value = 0;
    if (workHoursMaxSlider) workHoursMaxSlider.value = 24;
    
    // Hide filter section initially
    const filterSection = document.getElementById('filterSection');
    if (filterSection) {
        filterSection.style.display = 'none';
    }
    
    // Hide active filter indicator
    const indicator = document.getElementById('activeFilterIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

function initializeFilterEventListeners() {
    // Load min input
    const filterLoadMin = document.getElementById('filterLoadMin');
    if (filterLoadMin) {
        filterLoadMin.addEventListener('input', function() {
            let value = parseInt(this.value) || 1;
            value = Math.max(1, Math.min(10, value));
            const max = parseInt(document.getElementById('filterLoadMax').value);
            
            if (value > max) {
                value = max;
                this.value = max;
            }
            
            const slider = document.getElementById('filterLoadMinSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Load max input
    const filterLoadMax = document.getElementById('filterLoadMax');
    if (filterLoadMax) {
        filterLoadMax.addEventListener('input', function() {
            let value = parseInt(this.value) || 10;
            value = Math.max(1, Math.min(10, value));
            const min = parseInt(document.getElementById('filterLoadMin').value);
            
            if (value < min) {
                value = min;
                this.value = min;
            }
            
            const slider = document.getElementById('filterLoadMaxSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Quality min input
    const filterQualityMin = document.getElementById('filterQualityMin');
    if (filterQualityMin) {
        filterQualityMin.addEventListener('input', function() {
            let value = parseInt(this.value) || 1;
            value = Math.max(1, Math.min(10, value));
            const max = parseInt(document.getElementById('filterQualityMax').value);
            
            if (value > max) {
                value = max;
                this.value = max;
            }
            
            const slider = document.getElementById('filterQualityMinSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Quality max input
    const filterQualityMax = document.getElementById('filterQualityMax');
    if (filterQualityMax) {
        filterQualityMax.addEventListener('input', function() {
            let value = parseInt(this.value) || 10;
            value = Math.max(1, Math.min(10, value));
            const min = parseInt(document.getElementById('filterQualityMin').value);
            
            if (value < min) {
                value = min;
                this.value = min;
            }
            
            const slider = document.getElementById('filterQualityMaxSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Sleep hours min input
    const filterSleepHoursMin = document.getElementById('filterSleepHoursMin');
    if (filterSleepHoursMin) {
        filterSleepHoursMin.addEventListener('input', function() {
            let value = parseFloat(this.value) || 0;
            value = Math.max(0, Math.min(24, value));
            const max = parseFloat(document.getElementById('filterSleepHoursMax').value);
            
            if (value > max) {
                value = max;
                this.value = max;
            }
            
            const slider = document.getElementById('filterSleepHoursMinSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Sleep hours max input
    const filterSleepHoursMax = document.getElementById('filterSleepHoursMax');
    if (filterSleepHoursMax) {
        filterSleepHoursMax.addEventListener('input', function() {
            let value = parseFloat(this.value) || 24;
            value = Math.max(0, Math.min(24, value));
            const min = parseFloat(document.getElementById('filterSleepHoursMin').value);
            
            if (value < min) {
                value = min;
                this.value = min;
            }
            
            const slider = document.getElementById('filterSleepHoursMaxSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Work hours min input
    const filterWorkHoursMin = document.getElementById('filterWorkHoursMin');
    if (filterWorkHoursMin) {
        filterWorkHoursMin.addEventListener('input', function() {
            let value = parseFloat(this.value) || 0;
            value = Math.max(0, Math.min(24, value));
            const max = parseFloat(document.getElementById('filterWorkHoursMax').value);
            
            if (value > max) {
                value = max;
                this.value = max;
            }
            
            const slider = document.getElementById('filterWorkHoursMinSlider');
            if (slider) slider.value = value;
        });
    }
    
    // Work hours max input
    const filterWorkHoursMax = document.getElementById('filterWorkHoursMax');
    if (filterWorkHoursMax) {
        filterWorkHoursMax.addEventListener('input', function() {
            let value = parseFloat(this.value) || 24;
            value = Math.max(0, Math.min(24, value));
            const min = parseFloat(document.getElementById('filterWorkHoursMin').value);
            
            if (value < min) {
                value = min;
                this.value = min;
            }
            
            const slider = document.getElementById('filterWorkHoursMaxSlider');
            if (slider) slider.value = value;
        });
    }
}

function updateLoadValue() {
    const value = document.getElementById('cognitiveLoad').value;
    const display = document.getElementById('currentLoadValue');
    if (display) display.textContent = value;
}

function updateQualityValue() {
    const value = document.getElementById('sleepQuality').value;
    const display = document.getElementById('currentQualityValue');
    if (display) display.textContent = value;
}

function calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : (numerator / denominator).toFixed(2);
}

function updateStats() {
    // Calculate stats for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = entries.filter(entry => new Date(entry.date) >= sevenDaysAgo);

    const correlationEl = document.getElementById('correlation');
    const avgWorkHoursEl = document.getElementById('avgWorkHours');
    const avgSleepQualityEl = document.getElementById('avgSleepQuality');

    if (recentEntries.length < 2) {
        if (correlationEl) correlationEl.textContent = 'N/A';
        if (avgWorkHoursEl) avgWorkHoursEl.textContent = '0.0h';
        if (avgSleepQualityEl) avgSleepQualityEl.textContent = '0.0';
    } else {
        // Calculate correlation between cognitive load and sleep quality
        const workLoads = recentEntries.map(entry => entry.cognitiveLoad);
        const sleepQualities = recentEntries.map(entry => entry.sleepQuality);
        const correlation = calculateCorrelation(workLoads, sleepQualities);

        // Calculate averages
        const avgWorkHours = (recentEntries.reduce((sum, entry) => sum + entry.workHours, 0) / recentEntries.length).toFixed(1);
        const avgSleepQuality = (recentEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / recentEntries.length).toFixed(1);

        if (correlationEl) correlationEl.textContent = correlation;
        if (avgWorkHoursEl) avgWorkHoursEl.textContent = `${avgWorkHours}h`;
        if (avgSleepQualityEl) avgSleepQualityEl.textContent = avgSleepQuality;
    }
    
    // Update weekly summary
    updateWeeklySummary();
}

function updateWeeklySummary() {
    // Get entries from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = entries.filter(entry => new Date(entry.date) >= sevenDaysAgo);
    
    // Get summary elements
    const bestSleepDayEl = document.getElementById('bestSleepDay');
    const bestSleepDetailsEl = document.getElementById('bestSleepDetails');
    const bestSleepDateEl = document.getElementById('bestSleepDate');
    
    const highestLoadDayEl = document.getElementById('highestLoadDay');
    const highestLoadDetailsEl = document.getElementById('highestLoadDetails');
    const highestLoadDateEl = document.getElementById('highestLoadDate');
    
    const mostProductiveDayEl = document.getElementById('mostProductiveDay');
    const mostProductiveDetailsEl = document.getElementById('mostProductiveDetails');
    const mostProductiveDateEl = document.getElementById('mostProductiveDate');
    
    if (recentEntries.length === 0) {
        // No data in last 7 days
        if (bestSleepDayEl) {
            bestSleepDayEl.textContent = 'No Data';
            if (bestSleepDetailsEl) bestSleepDetailsEl.innerHTML = '<i class="fas fa-info-circle"></i><span>Log entries to see insights</span>';
            if (bestSleepDateEl) bestSleepDateEl.innerHTML = '<i class="far fa-calendar-alt"></i><span>Last 7 days</span>';
        }
        
        if (highestLoadDayEl) {
            highestLoadDayEl.textContent = 'No Data';
            if (highestLoadDetailsEl) highestLoadDetailsEl.innerHTML = '<i class="fas fa-info-circle"></i><span>Log entries to see insights</span>';
            if (highestLoadDateEl) highestLoadDateEl.innerHTML = '<i class="far fa-calendar-alt"></i><span>Last 7 days</span>';
        }
        
        if (mostProductiveDayEl) {
            mostProductiveDayEl.textContent = 'No Data';
            if (mostProductiveDetailsEl) mostProductiveDetailsEl.innerHTML = '<i class="fas fa-info-circle"></i><span>Log entries to see insights</span>';
            if (mostProductiveDateEl) mostProductiveDateEl.innerHTML = '<i class="far fa-calendar-alt"></i><span>Last 7 days</span>';
        }
        return;
    }
    
    // 1. Best Sleep Day (highest sleep quality)
    const bestSleepEntry = recentEntries.reduce((best, current) => {
        return (current.sleepQuality > best.sleepQuality) ? current : best;
    }, recentEntries[0]);
    
    const bestSleepDate = new Date(bestSleepEntry.date);
    if (bestSleepDayEl) bestSleepDayEl.textContent = bestSleepDate.toLocaleDateString('en-US', { weekday: 'long' });
    if (bestSleepDetailsEl) {
        bestSleepDetailsEl.innerHTML = `
            <i class="fas fa-star"></i>
            <span>Quality: ${bestSleepEntry.sleepQuality}/10 (${bestSleepEntry.sleepHours}h)</span>
        `;
    }
    if (bestSleepDateEl) {
        bestSleepDateEl.innerHTML = `
            <i class="far fa-calendar-alt"></i>
            <span>${bestSleepDate.toLocaleDateString()}</span>
        `;
    }
    
    // 2. Highest Cognitive Load Day
    const highestLoadEntry = recentEntries.reduce((highest, current) => {
        return (current.cognitiveLoad > highest.cognitiveLoad) ? current : highest;
    }, recentEntries[0]);
    
    const highestLoadDate = new Date(highestLoadEntry.date);
    if (highestLoadDayEl) highestLoadDayEl.textContent = highestLoadDate.toLocaleDateString('en-US', { weekday: 'long' });
    if (highestLoadDetailsEl) {
        highestLoadDetailsEl.innerHTML = `
            <i class="fas fa-tachometer-alt"></i>
            <span>Load: ${highestLoadEntry.cognitiveLoad}/10 (${highestLoadEntry.workHours}h)</span>
        `;
    }
    if (highestLoadDateEl) {
        highestLoadDateEl.innerHTML = `
            <i class="far fa-calendar-alt"></i>
            <span>${highestLoadDate.toLocaleDateString()}</span>
        `;
    }
    
    const productiveEntries = recentEntries.map(entry => ({
        ...entry,
        productivityScore: (entry.workHours * (entry.sleepQuality / 10)) // Work hours weighted by sleep quality
    }));
    
    const mostProductiveEntry = productiveEntries.reduce((best, current) => {
        return (current.productivityScore > best.productivityScore) ? current : best;
    }, productiveEntries[0]);
    
    const productiveDate = new Date(mostProductiveEntry.date);
    if (mostProductiveDayEl) mostProductiveDayEl.textContent = productiveDate.toLocaleDateString('en-US', { weekday: 'long' });
    if (mostProductiveDetailsEl) {
        mostProductiveDetailsEl.innerHTML = `
            <i class="fas fa-clock"></i>
            <span>Work: ${mostProductiveEntry.workHours}h (Quality: ${mostProductiveEntry.sleepQuality}/10)</span>
        `;
    }
    if (mostProductiveDateEl) {
        mostProductiveDateEl.innerHTML = `
            <i class="far fa-calendar-alt"></i>
            <span>${productiveDate.toLocaleDateString()}</span>
        `;
    }
    
    addInsightBadges(recentEntries);
}

function addInsightBadges(recentEntries) {
    const summaryCards = document.querySelectorAll('.summary-card');
    
    summaryCards.forEach(card => {
        const existingBadge = card.querySelector('.insight-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
    });
    
    if (recentEntries.length < 3) return;
    
    const avgSleepQuality = recentEntries.reduce((sum, e) => sum + e.sleepQuality, 0) / recentEntries.length;
    const avgCognitiveLoad = recentEntries.reduce((sum, e) => sum + e.cognitiveLoad, 0) / recentEntries.length;
    const avgWorkHours = recentEntries.reduce((sum, e) => sum + e.workHours, 0) / recentEntries.length;
    
    if (avgSleepQuality < 5 && summaryCards[0]) {
        const bestSleepCard = summaryCards[0];
        const badge = document.createElement('div');
        badge.className = 'insight-badge';
        badge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Sleep quality needs improvement';
        bestSleepCard.appendChild(badge);
    }
   
    if (avgCognitiveLoad > 7 && summaryCards[1]) {
        const highestLoadCard = summaryCards[1];
        const badge = document.createElement('div');
        badge.className = 'insight-badge';
        badge.innerHTML = '<i class="fas fa-exclamation-circle"></i> High cognitive load this week';
        highestLoadCard.appendChild(badge);
    }
    
    if (avgWorkHours > 8 && avgSleepQuality < 6 && summaryCards[2]) {
        const productiveCard = summaryCards[2];
        const badge = document.createElement('div');
        badge.className = 'insight-badge';
        badge.innerHTML = '<i class="fas fa-lightbulb"></i> Consider work-life balance';
        productiveCard.appendChild(badge);
    }
}

function updateChart() {
    const ctx = document.getElementById('correlationChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Prepare data for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const chartEntries = entries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);

    if (chartEntries.length === 0) return;

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const workLoadData = chartEntries.map(entry => entry.cognitiveLoad);
    const sleepQualityData = chartEntries.map(entry => entry.sleepQuality);
    const workHoursData = chartEntries.map(entry => entry.workHours);

    chartInstance = new Chart(context, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cognitive Load',
                data: workLoadData,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Sleep Quality',
                data: sleepQualityData,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Work Hours',
                data: workHoursData,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Load/Quality (1-10)'
                    },
                    min: 1,
                    max: 10
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Work Hours'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

// Toggle filters visibility
function toggleFilters() {
    const filterSection = document.getElementById('filterSection');
    const toggleBtn = document.querySelector('.toggle-filters-btn');
    
    if (!filterSection || !toggleBtn) return;
    
    filtersVisible = !filtersVisible;
    filterSection.style.display = filtersVisible ? 'block' : 'none';
    toggleBtn.innerHTML = filtersVisible ? 
        '<i class="fas fa-sliders-h"></i> Hide Filters' : 
        '<i class="fas fa-sliders-h"></i> Show Filters';
}

// Toggle filter panel content
function toggleFilterPanel() {
    const filterContent = document.getElementById('filterContent');
    const chevron = document.getElementById('filterChevron');
    
    if (!filterContent || !chevron) return;
    
    filterContent.classList.toggle('collapsed');
    chevron.classList.toggle('fa-chevron-up');
    chevron.classList.toggle('fa-chevron-down');
}

// Sync functions for range inputs
function syncLoadMin() {
    const slider = document.getElementById('filterLoadMinSlider');
    const input = document.getElementById('filterLoadMin');
    const maxSlider = document.getElementById('filterLoadMaxSlider');
    
    if (!slider || !input || !maxSlider) return;
    
    let value = parseInt(slider.value);
    let max = parseInt(maxSlider.value);
    
    if (value > max) {
        value = max;
        slider.value = max;
    }
    
    input.value = value;
}

function syncLoadMax() {
    const slider = document.getElementById('filterLoadMaxSlider');
    const input = document.getElementById('filterLoadMax');
    const minSlider = document.getElementById('filterLoadMinSlider');
    
    if (!slider || !input || !minSlider) return;
    
    let value = parseInt(slider.value);
    let min = parseInt(minSlider.value);
    
    if (value < min) {
        value = min;
        slider.value = min;
    }
    
    input.value = value;
}

function syncQualityMin() {
    const slider = document.getElementById('filterQualityMinSlider');
    const input = document.getElementById('filterQualityMin');
    const maxSlider = document.getElementById('filterQualityMaxSlider');
    
    if (!slider || !input || !maxSlider) return;
    
    let value = parseInt(slider.value);
    let max = parseInt(maxSlider.value);
    
    if (value > max) {
        value = max;
        slider.value = max;
    }
    
    input.value = value;
}

function syncQualityMax() {
    const slider = document.getElementById('filterQualityMaxSlider');
    const input = document.getElementById('filterQualityMax');
    const minSlider = document.getElementById('filterQualityMinSlider');
    
    if (!slider || !input || !minSlider) return;
    
    let value = parseInt(slider.value);
    let min = parseInt(minSlider.value);
    
    if (value < min) {
        value = min;
        slider.value = min;
    }
    
    input.value = value;
}

function syncSleepHoursMin() {
    const slider = document.getElementById('filterSleepHoursMinSlider');
    const input = document.getElementById('filterSleepHoursMin');
    const maxSlider = document.getElementById('filterSleepHoursMaxSlider');
    
    if (!slider || !input || !maxSlider) return;
    
    let value = parseFloat(slider.value);
    let max = parseFloat(maxSlider.value);
    
    if (value > max) {
        value = max;
        slider.value = max;
    }
    
    input.value = value;
}

function syncSleepHoursMax() {
    const slider = document.getElementById('filterSleepHoursMaxSlider');
    const input = document.getElementById('filterSleepHoursMax');
    const minSlider = document.getElementById('filterSleepHoursMinSlider');
    
    if (!slider || !input || !minSlider) return;
    
    let value = parseFloat(slider.value);
    let min = parseFloat(minSlider.value);
    
    if (value < min) {
        value = min;
        slider.value = min;
    }
    
    input.value = value;
}

function syncWorkHoursMin() {
    const slider = document.getElementById('filterWorkHoursMinSlider');
    const input = document.getElementById('filterWorkHoursMin');
    const maxSlider = document.getElementById('filterWorkHoursMaxSlider');
    
    if (!slider || !input || !maxSlider) return;
    
    let value = parseFloat(slider.value);
    let max = parseFloat(maxSlider.value);
    
    if (value > max) {
        value = max;
        slider.value = max;
    }
    
    input.value = value;
}

function syncWorkHoursMax() {
    const slider = document.getElementById('filterWorkHoursMaxSlider');
    const input = document.getElementById('filterWorkHoursMax');
    const minSlider = document.getElementById('filterWorkHoursMinSlider');
    
    if (!slider || !input || !minSlider) return;
    
    let value = parseFloat(slider.value);
    let min = parseFloat(minSlider.value);
    
    if (value < min) {
        value = min;
        slider.value = min;
    }
    
    input.value = value;
}

// Apply filters
function applyFilters() {
    // Get filter values
    const dateFromInput = document.getElementById('filterDateFrom');
    const dateToInput = document.getElementById('filterDateTo');
    const loadMinInput = document.getElementById('filterLoadMin');
    const loadMaxInput = document.getElementById('filterLoadMax');
    const qualityMinInput = document.getElementById('filterQualityMin');
    const qualityMaxInput = document.getElementById('filterQualityMax');
    const sleepHoursMinInput = document.getElementById('filterSleepHoursMin');
    const sleepHoursMaxInput = document.getElementById('filterSleepHoursMax');
    const workHoursMinInput = document.getElementById('filterWorkHoursMin');
    const workHoursMaxInput = document.getElementById('filterWorkHoursMax');
    const searchInput = document.getElementById('filterSearch');
    
    filters.dateFrom = dateFromInput ? dateFromInput.value || null : null;
    filters.dateTo = dateToInput ? dateToInput.value || null : null;
    filters.loadMin = loadMinInput ? parseInt(loadMinInput.value) || 1 : 1;
    filters.loadMax = loadMaxInput ? parseInt(loadMaxInput.value) || 10 : 10;
    filters.qualityMin = qualityMinInput ? parseInt(qualityMinInput.value) || 1 : 1;
    filters.qualityMax = qualityMaxInput ? parseInt(qualityMaxInput.value) || 10 : 10;
    filters.sleepHoursMin = sleepHoursMinInput ? parseFloat(sleepHoursMinInput.value) || 0 : 0;
    filters.sleepHoursMax = sleepHoursMaxInput ? parseFloat(sleepHoursMaxInput.value) || 24 : 24;
    filters.workHoursMin = workHoursMinInput ? parseFloat(workHoursMinInput.value) || 0 : 0;
    filters.workHoursMax = workHoursMaxInput ? parseFloat(workHoursMaxInput.value) || 24 : 24;
    filters.searchText = searchInput ? searchInput.value.toLowerCase() : '';
    
    // Update active filters display
    updateActiveFiltersDisplay();
    
    // Update entries list with filters
    updateFilteredEntriesList();
}

// Reset all filters
function resetFilters() {
    // Reset date inputs
    const dateFromInput = document.getElementById('filterDateFrom');
    const dateToInput = document.getElementById('filterDateTo');
    if (dateFromInput) dateFromInput.value = '';
    if (dateToInput) dateToInput.value = '';
    
    // Reset load range
    const loadMinInput = document.getElementById('filterLoadMin');
    const loadMaxInput = document.getElementById('filterLoadMax');
    const loadMinSlider = document.getElementById('filterLoadMinSlider');
    const loadMaxSlider = document.getElementById('filterLoadMaxSlider');
    
    if (loadMinInput) loadMinInput.value = 1;
    if (loadMaxInput) loadMaxInput.value = 10;
    if (loadMinSlider) loadMinSlider.value = 1;
    if (loadMaxSlider) loadMaxSlider.value = 10;
    
    // Reset quality range
    const qualityMinInput = document.getElementById('filterQualityMin');
    const qualityMaxInput = document.getElementById('filterQualityMax');
    const qualityMinSlider = document.getElementById('filterQualityMinSlider');
    const qualityMaxSlider = document.getElementById('filterQualityMaxSlider');
    
    if (qualityMinInput) qualityMinInput.value = 1;
    if (qualityMaxInput) qualityMaxInput.value = 10;
    if (qualityMinSlider) qualityMinSlider.value = 1;
    if (qualityMaxSlider) qualityMaxSlider.value = 10;
    
    // Reset sleep hours range
    const sleepHoursMinInput = document.getElementById('filterSleepHoursMin');
    const sleepHoursMaxInput = document.getElementById('filterSleepHoursMax');
    const sleepHoursMinSlider = document.getElementById('filterSleepHoursMinSlider');
    const sleepHoursMaxSlider = document.getElementById('filterSleepHoursMaxSlider');
    
    if (sleepHoursMinInput) sleepHoursMinInput.value = 0;
    if (sleepHoursMaxInput) sleepHoursMaxInput.value = 24;
    if (sleepHoursMinSlider) sleepHoursMinSlider.value = 0;
    if (sleepHoursMaxSlider) sleepHoursMaxSlider.value = 24;
    
    // Reset work hours range
    const workHoursMinInput = document.getElementById('filterWorkHoursMin');
    const workHoursMaxInput = document.getElementById('filterWorkHoursMax');
    const workHoursMinSlider = document.getElementById('filterWorkHoursMinSlider');
    const workHoursMaxSlider = document.getElementById('filterWorkHoursMaxSlider');
    
    if (workHoursMinInput) workHoursMinInput.value = 0;
    if (workHoursMaxInput) workHoursMaxInput.value = 24;
    if (workHoursMinSlider) workHoursMinSlider.value = 0;
    if (workHoursMaxSlider) workHoursMaxSlider.value = 24;
    
    // Reset search
    const searchInput = document.getElementById('filterSearch');
    if (searchInput) searchInput.value = '';
    
    // Reset filter object
    filters = {
        dateFrom: null,
        dateTo: null,
        loadMin: 1,
        loadMax: 10,
        qualityMin: 1,
        qualityMax: 10,
        sleepHoursMin: 0,
        sleepHoursMax: 24,
        workHoursMin: 0,
        workHoursMax: 24,
        searchText: ''
    };
    
    const indicator = document.getElementById('activeFilterIndicator');
    if (indicator) indicator.style.display = 'none';
    
    const activeFiltersDiv = document.getElementById('activeFilters');
    if (activeFiltersDiv) activeFiltersDiv.innerHTML = '';
    
    updateFilteredEntriesList();
}

// Update active filters display
function updateActiveFiltersDisplay() {
    const activeFiltersDiv = document.getElementById('activeFilters');
    const indicator = document.getElementById('activeFilterIndicator');
    
    if (!activeFiltersDiv || !indicator) return;
    
    let activeFiltersHtml = '<i class="fas fa-filter"></i> Active Filters: ';
    let hasActiveFilters = false;
    
    if (filters.dateFrom) {
        activeFiltersHtml += `<span class="filter-badge">Date from: ${new Date(filters.dateFrom).toLocaleDateString()} <i class="fas fa-times" onclick="removeFilter('dateFrom')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.dateTo) {
        activeFiltersHtml += `<span class="filter-badge">Date to: ${new Date(filters.dateTo).toLocaleDateString()} <i class="fas fa-times" onclick="removeFilter('dateTo')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.loadMin > 1 || filters.loadMax < 10) {
        activeFiltersHtml += `<span class="filter-badge">Load: ${filters.loadMin}-${filters.loadMax} <i class="fas fa-times" onclick="removeFilter('load')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.qualityMin > 1 || filters.qualityMax < 10) {
        activeFiltersHtml += `<span class="filter-badge">Quality: ${filters.qualityMin}-${filters.qualityMax} <i class="fas fa-times" onclick="removeFilter('quality')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.sleepHoursMin > 0 || filters.sleepHoursMax < 24) {
        activeFiltersHtml += `<span class="filter-badge">Sleep Hours: ${filters.sleepHoursMin}-${filters.sleepHoursMax} <i class="fas fa-times" onclick="removeFilter('sleepHours')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.workHoursMin > 0 || filters.workHoursMax < 24) {
        activeFiltersHtml += `<span class="filter-badge">Work Hours: ${filters.workHoursMin}-${filters.workHoursMax} <i class="fas fa-times" onclick="removeFilter('workHours')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (filters.searchText) {
        activeFiltersHtml += `<span class="filter-badge">Search: "${filters.searchText}" <i class="fas fa-times" onclick="removeFilter('search')"></i></span>`;
        hasActiveFilters = true;
    }
    
    if (hasActiveFilters) {
        activeFiltersDiv.innerHTML = activeFiltersHtml;
        indicator.style.display = 'inline-flex';
    } else {
        activeFiltersDiv.innerHTML = '<i class="fas fa-info-circle"></i> No active filters';
        indicator.style.display = 'none';
    }
}

// Remove specific filter
function removeFilter(filterType) {
    switch(filterType) {
        case 'dateFrom':
            const dateFromInput = document.getElementById('filterDateFrom');
            if (dateFromInput) dateFromInput.value = '';
            filters.dateFrom = null;
            break;
        case 'dateTo':
            const dateToInput = document.getElementById('filterDateTo');
            if (dateToInput) dateToInput.value = '';
            filters.dateTo = null;
            break;
        case 'load':
            const loadMinInput = document.getElementById('filterLoadMin');
            const loadMaxInput = document.getElementById('filterLoadMax');
            const loadMinSlider = document.getElementById('filterLoadMinSlider');
            const loadMaxSlider = document.getElementById('filterLoadMaxSlider');
            
            if (loadMinInput) loadMinInput.value = 1;
            if (loadMaxInput) loadMaxInput.value = 10;
            if (loadMinSlider) loadMinSlider.value = 1;
            if (loadMaxSlider) loadMaxSlider.value = 10;
            
            filters.loadMin = 1;
            filters.loadMax = 10;
            break;
        case 'quality':
            const qualityMinInput = document.getElementById('filterQualityMin');
            const qualityMaxInput = document.getElementById('filterQualityMax');
            const qualityMinSlider = document.getElementById('filterQualityMinSlider');
            const qualityMaxSlider = document.getElementById('filterQualityMaxSlider');
            
            if (qualityMinInput) qualityMinInput.value = 1;
            if (qualityMaxInput) qualityMaxInput.value = 10;
            if (qualityMinSlider) qualityMinSlider.value = 1;
            if (qualityMaxSlider) qualityMaxSlider.value = 10;
            
            filters.qualityMin = 1;
            filters.qualityMax = 10;
            break;
        case 'sleepHours':
            const sleepHoursMinInput = document.getElementById('filterSleepHoursMin');
            const sleepHoursMaxInput = document.getElementById('filterSleepHoursMax');
            const sleepHoursMinSlider = document.getElementById('filterSleepHoursMinSlider');
            const sleepHoursMaxSlider = document.getElementById('filterSleepHoursMaxSlider');
            
            if (sleepHoursMinInput) sleepHoursMinInput.value = 0;
            if (sleepHoursMaxInput) sleepHoursMaxInput.value = 24;
            if (sleepHoursMinSlider) sleepHoursMinSlider.value = 0;
            if (sleepHoursMaxSlider) sleepHoursMaxSlider.value = 24;
            
            filters.sleepHoursMin = 0;
            filters.sleepHoursMax = 24;
            break;
        case 'workHours':
            const workHoursMinInput = document.getElementById('filterWorkHoursMin');
            const workHoursMaxInput = document.getElementById('filterWorkHoursMax');
            const workHoursMinSlider = document.getElementById('filterWorkHoursMinSlider');
            const workHoursMaxSlider = document.getElementById('filterWorkHoursMaxSlider');
            
            if (workHoursMinInput) workHoursMinInput.value = 0;
            if (workHoursMaxInput) workHoursMaxInput.value = 24;
            if (workHoursMinSlider) workHoursMinSlider.value = 0;
            if (workHoursMaxSlider) workHoursMaxSlider.value = 24;
            
            filters.workHoursMin = 0;
            filters.workHoursMax = 24;
            break;
        case 'search':
            const searchInput = document.getElementById('filterSearch');
            if (searchInput) searchInput.value = '';
            filters.searchText = '';
            break;
    }
    
    applyFilters();
}

// Filter entries based on current filters
function filterEntries(entriesToFilter = entries) {
    return entriesToFilter.filter(entry => {
        // Date range filter
        if (filters.dateFrom && new Date(entry.date) < new Date(filters.dateFrom)) {
            return false;
        }
        if (filters.dateTo) {
            const entryDate = new Date(entry.date);
            const filterDateTo = new Date(filters.dateTo);
            filterDateTo.setHours(23, 59, 59, 999); // Include the entire end date
            if (entryDate > filterDateTo) {
                return false;
            }
        }
        
        // Cognitive load range
        if (entry.cognitiveLoad < filters.loadMin || entry.cognitiveLoad > filters.loadMax) {
            return false;
        }
        
        // Sleep quality range
        if (entry.sleepQuality < filters.qualityMin || entry.sleepQuality > filters.qualityMax) {
            return false;
        }
        
        // Sleep hours range
        if (entry.sleepHours < filters.sleepHoursMin || entry.sleepHours > filters.sleepHoursMax) {
            return false;
        }
        
        // Work hours range
        if (entry.workHours < filters.workHoursMin || entry.workHours > filters.workHoursMax) {
            return false;
        }
        
        // Text search in notes
        if (filters.searchText) {
            const workNotesMatch = entry.workNotes && entry.workNotes.toLowerCase().includes(filters.searchText);
            const sleepNotesMatch = entry.sleepNotes && entry.sleepNotes.toLowerCase().includes(filters.searchText);
            if (!workNotesMatch && !sleepNotesMatch) {
                return false;
            }
        }
        
        return true;
    });
}

// Update entries list with filters
function updateFilteredEntriesList() {
    const entriesList = document.getElementById('entriesList');
    if (!entriesList) return;
    
    const filteredEntries = filterEntries();
    const filteredCount = filteredEntries.length;
    const totalCount = entries.length;
    
    if (filteredEntries.length === 0) {
        entriesList.innerHTML = `
            <div class="no-filter-results">
                <i class="fas fa-filter"></i>
                <p>No entries match your filters</p>
                <button onclick="resetFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }
    
    // Show last 7 filtered entries
    const recentFilteredEntries = filteredEntries.slice(-7).reverse();
    
    entriesList.innerHTML = '';
    
    // Add filter summary
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'filter-stats';
    summaryDiv.innerHTML = `
        <i class="fas fa-list"></i> Showing ${filteredCount} of ${totalCount} entries
        ${filteredCount !== totalCount ? '(filtered)' : ''}
    `;
    entriesList.appendChild(summaryDiv);
    
    recentFilteredEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';
        
        // Add highlight class if entry matches search
        if (filters.searchText && (
            (entry.workNotes && entry.workNotes.toLowerCase().includes(filters.searchText)) ||
            (entry.sleepNotes && entry.sleepNotes.toLowerCase().includes(filters.searchText))
        )) {
            entryDiv.classList.add('filtered-match');
        }
        
        const workLoadClass = entry.cognitiveLoad >= 8 ? 'work-high' :
                            entry.cognitiveLoad >= 5 ? 'work-medium' : 'work-low';
        const sleepQualityClass = entry.sleepQuality >= 8 ? 'sleep-high' :
                                entry.sleepQuality >= 5 ? 'sleep-medium' : 'sleep-low';
        
        // Highlight search text in notes
        let workNotesHtml = entry.workNotes || '';
        let sleepNotesHtml = entry.sleepNotes || '';
        
        if (filters.searchText) {
            const regex = new RegExp(`(${filters.searchText})`, 'gi');
            workNotesHtml = workNotesHtml.replace(regex, '<mark>$1</mark>');
            sleepNotesHtml = sleepNotesHtml.replace(regex, '<mark>$1</mark>');
        }
        
        entryDiv.innerHTML = `
            <div class="entry-date">${new Date(entry.date).toLocaleDateString()}</div>
            
            <div class="work-data">
                <h4>Work</h4>
                <div class="work-metric">
                    <span class="metric-label">Hours:</span>
                    <span class="metric-value">${entry.workHours}h</span>
                </div>
                <div class="work-metric">
                    <span class="metric-label">Load:</span>
                    <span class="metric-value ${workLoadClass}">${entry.cognitiveLoad}/10</span>
                </div>
            </div>
            
            <div class="sleep-data">
                <h4>Sleep</h4>
                <div class="sleep-metric">
                    <span class="metric-label">Hours:</span>
                    <span class="metric-value">${entry.sleepHours}h</span>
                </div>
                <div class="sleep-metric">
                    <span class="metric-label">Quality:</span>
                    <span class="metric-value ${sleepQualityClass}">${entry.sleepQuality}/10</span>
                </div>
            </div>
            
            ${(entry.workNotes || entry.sleepNotes) ? `
            <div class="entry-notes">
                ${entry.workNotes ? `<div><strong>Work Notes:</strong> ${workNotesHtml}</div>` : ''}
                ${entry.sleepNotes ? `<div><strong>Sleep Notes:</strong> ${sleepNotesHtml}</div>` : ''}
            </div>
            ` : ''}
            
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;
        
        entriesList.appendChild(entryDiv);
    });
}

// Override the original updateEntriesList to use filtered version
function updateEntriesList() {
    updateFilteredEntriesList();
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entries = entries.filter(entry => entry.id !== id);
        localStorage.setItem('cognitiveLoadSleepEntries', JSON.stringify(entries));
        updateStats(); 
        updateChart();
        updateEntriesList();
        updateSleepDebtCalculator();
    }
}

// Add character counter functionality
function initializeCharacterCounters() {
    const workNotes = document.getElementById('workNotes');
    const sleepNotes = document.getElementById('sleepNotes');
    const workCounter = document.getElementById('workNotesCounter');
    const sleepCounter = document.getElementById('sleepNotesCounter');
    
    const MAX_CHARS = 500;
    
    function updateCounter(textarea, counterElement) {
        if (!textarea || !counterElement) return;
        
        const currentLength = textarea.value.length;
        counterElement.textContent = `${currentLength}/${MAX_CHARS} characters`;
        
        counterElement.classList.remove('warning', 'danger');
        
        if (currentLength >= MAX_CHARS) {
            counterElement.classList.add('danger');
        } else if (currentLength >= MAX_CHARS * 0.8) { 
            counterElement.classList.add('warning');
        }
    }
    
    if (workNotes && workCounter) {
        workNotes.addEventListener('input', function() {
            updateCounter(this, workCounter);
        });
        updateCounter(workNotes, workCounter);
    }
    
    if (sleepNotes && sleepCounter) {
        sleepNotes.addEventListener('input', function() {
            updateCounter(this, sleepCounter);
        });
        updateCounter(sleepNotes, sleepCounter);
    }
}

function logEntry() {
    const date = document.getElementById('logDate').value;
    const workHours = parseFloat(document.getElementById('workHours').value);
    const cognitiveLoad = parseInt(document.getElementById('cognitiveLoad').value);
    const sleepHours = parseFloat(document.getElementById('sleepHours').value);
    const sleepQuality = parseInt(document.getElementById('sleepQuality').value);
    const workNotes = document.getElementById('workNotes').value.trim();
    const sleepNotes = document.getElementById('sleepNotes').value.trim();
    
    const MAX_CHARS = 500;
    if (workNotes.length > MAX_CHARS || sleepNotes.length > MAX_CHARS) {
        alert(`Notes cannot exceed ${MAX_CHARS} characters. Please shorten your notes.`);
        return;
    }

    if (!date) {
        alert('Please select a date.');
        return;
    }

    if (isNaN(workHours) || workHours < 0 || workHours > 24) {
        alert('Please enter valid work hours (0-24).');
        return;
    }

    if (isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24) {
        alert('Please enter valid sleep hours (0-24).');
        return;
    }

    const existingEntry = entries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        entries = entries.filter(entry => entry.date !== date);
    }

    const entry = {
        id: Date.now(),
        date,
        workHours,
        cognitiveLoad,
        sleepHours,
        sleepQuality,
        workNotes,
        sleepNotes
    };

    entries.push(entry);

    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (entries.length > 100) {
        entries = entries.slice(-100);
    }

    localStorage.setItem('cognitiveLoadSleepEntries', JSON.stringify(entries));

    resetForm();

    updateStats(); 
    updateChart();
    updateEntriesList();
    updateSleepDebtCalculator();
}

function resetForm() {
    const dateInput = document.getElementById('logDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    const workHoursInput = document.getElementById('workHours');
    if (workHoursInput) workHoursInput.value = '';
    
    const cognitiveLoadInput = document.getElementById('cognitiveLoad');
    if (cognitiveLoadInput) cognitiveLoadInput.value = 5;
    
    const sleepHoursInput = document.getElementById('sleepHours');
    if (sleepHoursInput) sleepHoursInput.value = '';
    
    const sleepQualityInput = document.getElementById('sleepQuality');
    if (sleepQualityInput) sleepQualityInput.value = 7;
    
    const workNotes = document.getElementById('workNotes');
    const sleepNotes = document.getElementById('sleepNotes');
    if (workNotes) workNotes.value = '';
    if (sleepNotes) sleepNotes.value = '';
    
    updateLoadValue();
    updateQualityValue();
    
    const workCounter = document.getElementById('workNotesCounter');
    const sleepCounter = document.getElementById('sleepNotesCounter');
    if (workCounter) workCounter.textContent = '0/500 characters';
    if (sleepCounter) sleepCounter.textContent = '0/500 characters';
    
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            resetBtn.style.backgroundColor = '#6c757d';
        }, 200);
    }
}

function updateSleepGoal() {
    const goalInput = document.getElementById('sleepGoal');
    if (!goalInput) return;
    
    const newGoal = parseFloat(goalInput.value);
    
    if (isNaN(newGoal) || newGoal < 4 || newGoal > 12) {
        alert('Please enter a valid sleep goal between 4 and 12 hours.');
        goalInput.value = sleepGoal;
        return;
    }
    
    sleepGoal = newGoal;
    localStorage.setItem('sleepGoal', sleepGoal);
    
    goalInput.style.borderColor = '#28a745';
    setTimeout(() => {
        goalInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }, 500);
    
    updateSleepDebtCalculator();
}

function calculateSleepDebt() {
    if (entries.length === 0) {
        return {
            totalDebt: 0,
            weeklyDebt: 0,
            avgSleep: 0,
            dailyDebts: []
        };
    }
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let totalDebt = 0;
    const dailyDebts = [];
    
    sortedEntries.forEach(entry => {
        const debt = entry.sleepHours - sleepGoal;
        totalDebt += debt;
        dailyDebts.push({
            date: entry.date,
            debt: debt,
            sleepHours: entry.sleepHours
        });
    });
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = sortedEntries.filter(entry => new Date(entry.date) >= sevenDaysAgo);
    
    const weeklyDebt = recentEntries.reduce((sum, entry) => sum + (entry.sleepHours - sleepGoal), 0);
    
    const avgSleep = entries.reduce((sum, entry) => sum + entry.sleepHours, 0) / entries.length;
    
    return {
        totalDebt: totalDebt,
        weeklyDebt: weeklyDebt,
        avgSleep: avgSleep,
        dailyDebts: dailyDebts.slice(-14) 
    };
}

function updateSleepDebtCalculator() {
    const debtData = calculateSleepDebt();
    
    const totalDebtEl = document.getElementById('totalSleepDebt');
    const avgSleepEl = document.getElementById('avgSleepHours');
    const avgVsGoalEl = document.getElementById('avgVsGoal');
    const weeklyDebtEl = document.getElementById('weeklySleepDebt');
    
    if (totalDebtEl) {
        const totalDebtFormatted = debtData.totalDebt.toFixed(1);
        totalDebtEl.textContent = `${totalDebtFormatted}h`;
        totalDebtEl.style.color = debtData.totalDebt < 0 ? '#dc3545' : '#28a745';
    }
    
    if (avgSleepEl) {
        avgSleepEl.textContent = `${debtData.avgSleep.toFixed(1)}h`;
    }
    
    if (avgVsGoalEl) {
        const diff = (debtData.avgSleep - sleepGoal).toFixed(1);
        avgVsGoalEl.textContent = `vs ${sleepGoal.toFixed(1)}h goal (${diff > 0 ? '+' : ''}${diff}h)`;
        avgVsGoalEl.style.color = diff < 0 ? '#dc3545' : '#28a745';
    }
    
    if (weeklyDebtEl) {
        weeklyDebtEl.textContent = `${debtData.weeklyDebt.toFixed(1)}h`;
        weeklyDebtEl.style.color = debtData.weeklyDebt < 0 ? '#dc3545' : '#28a745';
    }
    
    updateDebtAlertLevel(debtData);
    
    updateDebtHistory(debtData.dailyDebts);
}

function updateDebtAlertLevel(debtData) {
    const alertLevelEl = document.getElementById('debtAlertLevel');
    const progressFillEl = document.getElementById('debtProgressFill');
    const warningMessageEl = document.getElementById('debtWarningMessage');
    
    if (!alertLevelEl || !progressFillEl || !warningMessageEl) return;
    
    const totalDebt = debtData.totalDebt;
    const maxDebtThreshold = 14; 
    const debtPercentage = Math.min(Math.abs(Math.min(totalDebt, 0)) / maxDebtThreshold * 100, 100);
    
    progressFillEl.style.width = `${debtPercentage}%`;
    
    let alertLevel = 'Healthy';
    let alertClass = '';
    let message = '';
    
    if (totalDebt < -10) {
        alertLevel = 'Severe';
        alertClass = 'danger';
        message = '⚠️ Critical: You have accumulated severe sleep debt. Consider taking time to rest and recover.';
    } else if (totalDebt < -5) {
        alertLevel = 'High';
        alertClass = 'danger';
        message = '⚠️ Warning: Your sleep debt is building up. Try to get extra rest when possible.';
    } else if (totalDebt < -2) {
        alertLevel = 'Moderate';
        alertClass = 'warning';
        message = '⚡ Moderate sleep debt detected. Aim for a few early nights to catch up.';
    } else if (totalDebt < 0) {
        alertLevel = 'Low';
        alertClass = 'warning';
        message = '💤 Mild sleep debt. Pay attention to your sleep schedule.';
    } else {
        alertLevel = 'Healthy';
        alertClass = '';
        message = '✅ Great job! You\'re meeting or exceeding your sleep goal.';
    }
    
    alertLevelEl.textContent = alertLevel;
    alertLevelEl.className = alertClass;
    
    warningMessageEl.textContent = message;
    warningMessageEl.className = `debt-warning-message ${alertClass}`;
    
    if (totalDebt < -10) {
        progressFillEl.style.background = 'linear-gradient(90deg, #dc3545, #ff6b6b)';
    } else if (totalDebt < -5) {
        progressFillEl.style.background = 'linear-gradient(90deg, #ffc107, #dc3545)';
    } else if (totalDebt < 0) {
        progressFillEl.style.background = 'linear-gradient(90deg, #28a745, #ffc107)';
    } else {
        progressFillEl.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
    }
}

function updateDebtHistory(dailyDebts) {
    const debtHistoryEl = document.getElementById('debtHistory');
    if (!debtHistoryEl) return;
    
    if (dailyDebts.length === 0) {
        debtHistoryEl.innerHTML = '<div class="debt-history-item">No sleep data available</div>';
        return;
    }
    
    const recentDebts = dailyDebts.slice(-7).reverse();
    
    debtHistoryEl.innerHTML = recentDebts.map(day => {
        const date = new Date(day.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const debtValue = day.debt.toFixed(1);
        const debtClass = day.debt < 0 ? 'debt-history-deficit' : 'debt-history-surplus';
        const debtSymbol = day.debt < 0 ? '' : '+';
        
        return `
            <div class="debt-history-item">
                <span class="debt-history-date">${formattedDate}</span>
                <span class="debt-history-value ${debtClass}">
                    ${debtSymbol}${debtValue}h (${day.sleepHours.toFixed(1)}h)
                </span>
            </div>
        `;
    }).join('');
}

window.updateLoadValue = updateLoadValue;
window.updateQualityValue = updateQualityValue;
window.logEntry = logEntry;
window.deleteEntry = deleteEntry;
window.resetForm = resetForm;
window.updateSleepGoal = updateSleepGoal;
window.toggleFilters = toggleFilters;
window.toggleFilterPanel = toggleFilterPanel;
window.syncLoadMin = syncLoadMin;
window.syncLoadMax = syncLoadMax;
window.syncQualityMin = syncQualityMin;
window.syncQualityMax = syncQualityMax;
window.syncSleepHoursMin = syncSleepHoursMin;
window.syncSleepHoursMax = syncSleepHoursMax;
window.syncWorkHoursMin = syncWorkHoursMin;
window.syncWorkHoursMax = syncWorkHoursMax;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.removeFilter = removeFilter;