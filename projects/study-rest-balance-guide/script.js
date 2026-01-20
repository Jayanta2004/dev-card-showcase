// Balance meter interaction
const meterScale = document.querySelector('.meter-scale');
const meterIndicator = document.getElementById('meterIndicator');
const balanceText = document.getElementById('balanceText');

let isDragging = false;

meterIndicator.addEventListener('mousedown', () => {
    isDragging = true;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

meterIndicator.addEventListener('touchstart', () => {
    isDragging = true;
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
});

function onMouseMove(e) {
    if (!isDragging) return;
    updateMeterPosition(e.clientX);
}

function onTouchMove(e) {
    if (!isDragging) return;
    updateMeterPosition(e.touches[0].clientX);
}

function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

function onTouchEnd() {
    isDragging = false;
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
}

function updateMeterPosition(clientX) {
    const scaleRect = meterScale.getBoundingClientRect();
    let position = (clientX - scaleRect.left) / scaleRect.width;
    
    // Clamp between 0 and 1
    position = Math.max(0, Math.min(1, position));
    
    // Update indicator position
    meterIndicator.style.left = `${position * 100}%`;
    
    // Update percentage text
    const studyPercent = Math.round(position * 100);
    const restPercent = 100 - studyPercent;
    meterIndicator.innerHTML = `<span>${studyPercent}%</span>`;
    
    // Update description text
    let description = "";
    if (studyPercent <= 30) {
        description = `Too much rest (${studyPercent}% study, ${restPercent}% rest): Learning progress may be too slow.`;
    } else if (studyPercent <= 60) {
        description = `Optimal balance (${studyPercent}% study, ${restPercent}% rest): Sustainable learning with good retention.`;
    } else if (studyPercent <= 80) {
        description = `Slightly imbalanced (${studyPercent}% study, ${restPercent}% rest): Risk of diminishing returns and fatigue.`;
    } else {
        description = `Highly imbalanced (${studyPercent}% study, ${restPercent}% rest): High risk of burnout with poor long-term retention.`;
    }
    
    balanceText.textContent = description;
    
    // Update charts based on balance
    updateCharts(studyPercent);
}

// Create schedule visualizations
function createScheduleVisualizations() {
    const balancedSchedule = document.getElementById('balancedSchedule');
    const imbalancedSchedule = document.getElementById('imbalancedSchedule');
    
    // Balanced schedule data
    const balancedData = [
        {label: "Study", value: 35, color: "bar-study"},
        {label: "Rest", value: 25, color: "bar-rest"},
        {label: "Sleep", value: 30, color: "bar-rest"},
        {label: "Other", value: 10, color: "bar-other"}
    ];
    
    // Imbalanced schedule data
    const imbalancedData = [
        {label: "Study", value: 60, color: "bar-study"},
        {label: "Rest", value: 10, color: "bar-rest"},
        {label: "Sleep", value: 20, color: "bar-rest"},
        {label: "Other", value: 10, color: "bar-other"}
    ];
    
    // Create bars for balanced schedule
    balancedData.forEach(item => {
        const bar = document.createElement('div');
        bar.className = `schedule-bar ${item.color}`;
        bar.style.height = `${item.value * 3}px`;
        bar.innerHTML = `<div class="schedule-label">${item.label}<br>${item.value}%</div>`;
        balancedSchedule.appendChild(bar);
    });
    
    // Create bars for imbalanced schedule
    imbalancedData.forEach(item => {
        const bar = document.createElement('div');
        bar.className = `schedule-bar ${item.color}`;
        bar.style.height = `${item.value * 3}px`;
        bar.innerHTML = `<div class="schedule-label">${item.label}<br>${item.value}%</div>`;
        imbalancedSchedule.appendChild(bar);
    });
}

// Chart.js implementation
let learningChart;
let currentChartType = 'retention';

function initializeChart() {
    const ctx = document.getElementById('learningChart').getContext('2d');
    
    // Initial data for memory retention
    const data = {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        datasets: [
            {
                label: 'Balanced (50% study, 50% rest)',
                data: [65, 70, 75, 82, 85, 88, 90],
                borderColor: '#4cc9f0',
                backgroundColor: 'rgba(76, 201, 240, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            },
            {
                label: 'Imbalanced (80% study, 20% rest)',
                data: [70, 75, 72, 68, 65, 60, 55],
                borderColor: '#f8961e',
                backgroundColor: 'rgba(248, 150, 30, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            },
            {
                label: 'Highly Imbalanced (90% study, 10% rest)',
                data: [75, 70, 60, 50, 40, 35, 30],
                borderColor: '#f72585',
                backgroundColor: 'rgba(247, 37, 133, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }
        ]
    };
    
    learningChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 14
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 20,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Memory Retention (%)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
}

// Update charts based on study percentage
function updateCharts(studyPercent) {
    if (!learningChart) return;
    
    // Calculate rest percentage
    const restPercent = 100 - studyPercent;
    
    // Update chart based on current chart type
    if (currentChartType === 'retention') {
        updateRetentionChart(studyPercent, restPercent);
    } else if (currentChartType === 'focus') {
        updateFocusChart(studyPercent, restPercent);
    } else if (currentChartType === 'stress') {
        updateStressChart(studyPercent, restPercent);
    }
}

function updateRetentionChart(studyPercent, restPercent) {
    // Generate data based on study-rest ratio
    const balancedData = [];
    const imbalancedData = [];
    const extremeData = [];
    
    // Balanced (close to 50/50)
    let balancedValue = 65;
    // Imbalanced (around 70/30)
    let imbalancedValue = 70;
    // Extreme (around 90/10)
    let extremeValue = 75;
    
    for (let i = 0; i < 7; i++) {
        // Balanced improves steadily
        balancedValue += 3 + Math.random() * 2;
        balancedData.push(Math.min(95, balancedValue));
        
        // Imbalanced peaks then declines
        if (i < 2) {
            imbalancedValue += 2 + Math.random() * 3;
        } else {
            imbalancedValue -= 3 + Math.random() * 4;
        }
        imbalancedData.push(Math.max(30, imbalancedValue));
        
        // Extreme declines quickly
        extremeValue -= 5 + Math.random() * 5;
        extremeData.push(Math.max(20, extremeValue));
    }
    
    learningChart.data.datasets[0].data = balancedData;
    learningChart.data.datasets[1].data = imbalancedData;
    learningChart.data.datasets[2].data = extremeData;
    
    learningChart.options.scales.y.title.text = 'Memory Retention (%)';
    learningChart.update();
}

function updateFocusChart(studyPercent, restPercent) {
    // Generate focus data
    const balancedData = [70, 72, 75, 78, 80, 82, 85];
    const imbalancedData = [75, 70, 65, 60, 55, 50, 45];
    const extremeData = [80, 65, 50, 40, 35, 30, 25];
    
    learningChart.data.datasets[0].data = balancedData;
    learningChart.data.datasets[1].data = imbalancedData;
    learningChart.data.datasets[2].data = extremeData;
    
    learningChart.options.scales.y.title.text = 'Focus Level (%)';
    learningChart.update();
}

function updateStressChart(studyPercent, restPercent) {
    // Generate stress data (inverted - higher is worse)
    const balancedData = [40, 38, 35, 32, 30, 28, 25];
    const imbalancedData = [45, 50, 55, 60, 65, 70, 75];
    const extremeData = [50, 60, 70, 80, 85, 90, 95];
    
    learningChart.data.datasets[0].data = balancedData;
    learningChart.data.datasets[1].data = imbalancedData;
    learningChart.data.datasets[2].data = extremeData;
    
    learningChart.options.scales.y.title.text = 'Stress Level (%)';
    learningChart.update();
}

// Chart type buttons
document.querySelectorAll('.chart-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Update active button
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Update chart type
        currentChartType = this.getAttribute('data-chart');
        
        // Get current study percentage from meter
        const meterLeft = parseFloat(meterIndicator.style.left);
        const studyPercent = Math.round(meterLeft);
        
        // Update chart
        updateCharts(studyPercent);
    });
});

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    createScheduleVisualizations();
    initializeChart();
    
    // Set initial position for meter indicator
    meterIndicator.style.left = "50%";
    
    // Set initial text
    balanceText.textContent = "Optimal balance (50% study, 50% rest): Sustainable learning with good retention.";
    
    // Add animation to cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });
});
