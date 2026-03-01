// detox-pathway-support-matrix.js

let activities = JSON.parse(localStorage.getItem('detoxPathwayActivities')) || [];
let supportChart = null;

function addActivity() {
    const name = document.getElementById('activityName').value.trim();
    const date = document.getElementById('activityDate').value;
    const frequency = parseFloat(document.getElementById('frequency').value);
    const liverSupport = parseInt(document.getElementById('liverSupport').value) || 0;
    const kidneySupport = parseInt(document.getElementById('kidneySupport').value) || 0;
    const skinSupport = parseInt(document.getElementById('skinSupport').value) || 0;
    const lungSupport = parseInt(document.getElementById('lungSupport').value) || 0;
    const lymphSupport = parseInt(document.getElementById('lymphSupport').value) || 0;
    const gutSupport = parseInt(document.getElementById('gutSupport').value) || 0;
    const category = document.getElementById('activityCategory').value;
    const notes = document.getElementById('activityNotes').value.trim();

    if (!name || !date || !category) {
        alert('Please fill in all required fields.');
        return;
    }

    // Calculate total impact
    const totalImpact = liverSupport + kidneySupport + skinSupport + lungSupport + lymphSupport + gutSupport;

    const activity = {
        id: Date.now(),
        name,
        date,
        frequency,
        liverSupport,
        kidneySupport,
        skinSupport,
        lungSupport,
        lymphSupport,
        gutSupport,
        totalImpact,
        category,
        notes,
        createdAt: new Date().toISOString()
    };

    activities.push(activity);

    // Sort by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    localStorage.setItem('detoxPathwayActivities', JSON.stringify(activities));

    // Clear form
    document.getElementById('activityName').value = '';
    document.getElementById('activityDate').value = '';
    document.getElementById('frequency').value = '1';
    document.getElementById('liverSupport').value = '0';
    document.getElementById('kidneySupport').value = '0';
    document.getElementById('skinSupport').value = '0';
    document.getElementById('lungSupport').value = '0';
    document.getElementById('lymphSupport').value = '0';
    document.getElementById('gutSupport').value = '0';
    document.getElementById('activityCategory').value = '';
    document.getElementById('activityNotes').value = '';

    updateMatrix();
    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateActivityList();
}

function calculatePathwaySupport() {
    const pathways = {
        liver: 0,
        kidney: 0,
        skin: 0,
        lung: 0,
        lymph: 0,
        gut: 0
    };

    // Get activities from the last 7 days for current support
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    activities.forEach(activity => {
        const activityDate = new Date(activity.date);
        if (activityDate >= sevenDaysAgo) {
            pathways.liver += activity.liverSupport * activity.frequency;
            pathways.kidney += activity.kidneySupport * activity.frequency;
            pathways.skin += activity.skinSupport * activity.frequency;
            pathways.lung += activity.lungSupport * activity.frequency;
            pathways.lymph += activity.lymphSupport * activity.frequency;
            pathways.gut += activity.gutSupport * activity.frequency;
        }
    });

    // Cap at 10 and normalize to 0-10 scale
    Object.keys(pathways).forEach(pathway => {
        pathways[pathway] = Math.min(10, pathways[pathway]);
    });

    return pathways;
}

function updateMatrix() {
    const pathways = calculatePathwaySupport();

    // Update bars
    document.getElementById('liverBar').style.width = `${pathways.liver * 10}%`;
    document.getElementById('kidneyBar').style.width = `${pathways.kidney * 10}%`;
    document.getElementById('skinBar').style.width = `${pathways.skin * 10}%`;
    document.getElementById('lungBar').style.width = `${pathways.lung * 10}%`;
    document.getElementById('lymphBar').style.width = `${pathways.lymph * 10}%`;
    document.getElementById('gutBar').style.width = `${pathways.gut * 10}%`;

    // Update values
    document.getElementById('liverValue').textContent = `${pathways.liver}/10`;
    document.getElementById('kidneyValue').textContent = `${pathways.kidney}/10`;
    document.getElementById('skinValue').textContent = `${pathways.skin}/10`;
    document.getElementById('lungValue').textContent = `${pathways.lung}/10`;
    document.getElementById('lymphValue').textContent = `${pathways.lymph}/10`;
    document.getElementById('gutValue').textContent = `${pathways.gut}/10`;
}

function updateStats() {
    const pathways = calculatePathwaySupport();
    const pathwayValues = Object.values(pathways);

    if (pathwayValues.length === 0) {
        document.getElementById('overallScore').textContent = '0%';
        document.getElementById('strongestPathway').textContent = 'None';
        document.getElementById('weakestPathway').textContent = 'None';
        document.getElementById('totalActivities').textContent = '0';
        return;
    }

    // Calculate overall score (average of all pathways)
    const overallScore = (pathwayValues.reduce((sum, val) => sum + val, 0) / pathwayValues.length * 10).toFixed(0);
    document.getElementById('overallScore').textContent = overallScore + '%';

    // Find strongest and weakest pathways
    const pathwayNames = Object.keys(pathways);
    const maxValue = Math.max(...pathwayValues);
    const minValue = Math.min(...pathwayValues);

    const strongest = pathwayNames.filter(name => pathways[name] === maxValue)[0];
    const weakest = pathwayNames.filter(name => pathways[name] === minValue)[0];

    document.getElementById('strongestPathway').textContent = strongest ? strongest.charAt(0).toUpperCase() + strongest.slice(1) : 'None';
    document.getElementById('weakestPathway').textContent = weakest ? weakest.charAt(0).toUpperCase() + weakest.slice(1) : 'None';

    document.getElementById('totalActivities').textContent = activities.length;
}

function updateAlert() {
    const alertDiv = document.getElementById('detoxAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');

    const pathways = calculatePathwaySupport();
    const pathwayValues = Object.values(pathways);

    if (pathwayValues.length === 0) {
        alertDiv.classList.add('hidden');
        return;
    }

    const maxSupport = Math.max(...pathwayValues);
    const minSupport = Math.min(...pathwayValues);
    const imbalanceRatio = maxSupport / (minSupport || 1);

    if (minSupport < 3) {
        alertDiv.classList.remove('hidden', 'warning');
        alertTitle.textContent = 'Low Detox Support Detected';
        alertMessage.textContent = `Some detoxification pathways have low support levels. Consider adding activities to strengthen weaker pathways for optimal detoxification.`;
    } else if (imbalanceRatio > 2) {
        alertDiv.classList.remove('hidden');
        alertDiv.classList.add('warning');
        alertTitle.textContent = 'Pathway Imbalance Detected';
        alertMessage.textContent = `Your detox support shows significant imbalance (${imbalanceRatio.toFixed(1)}x difference). Focus on strengthening weaker pathways for balanced detoxification.`;
    } else {
        alertDiv.classList.add('hidden');
    }
}

function updateChart() {
    const pathways = calculatePathwaySupport();

    const ctx = document.getElementById('supportChart').getContext('2d');

    if (supportChart) {
        supportChart.destroy();
    }

    const data = {
        labels: ['Liver', 'Kidneys', 'Skin', 'Lungs', 'Lymphatic', 'Gut/Intestines'],
        datasets: [{
            label: 'Support Level',
            data: [pathways.liver, pathways.kidney, pathways.skin, pathways.lung, pathways.lymph, pathways.gut],
            backgroundColor: [
                'rgba(76, 175, 80, 0.8)',
                'rgba(33, 150, 243, 0.8)',
                'rgba(255, 193, 7, 0.8)',
                'rgba(156, 39, 176, 0.8)',
                'rgba(255, 87, 34, 0.8)',
                'rgba(0, 188, 212, 0.8)'
            ],
            borderColor: [
                'rgba(76, 175, 80, 1)',
                'rgba(33, 150, 243, 1)',
                'rgba(255, 193, 7, 1)',
                'rgba(156, 39, 176, 1)',
                'rgba(255, 87, 34, 1)',
                'rgba(0, 188, 212, 1)'
            ],
            borderWidth: 2
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}/10`;
                        }
                    }
                }
            }
        }
    };

    supportChart = new Chart(ctx, config);
}

function updateInsights() {
    const insightsDiv = document.getElementById('insights');
    const pathways = calculatePathwaySupport();
    const pathwayValues = Object.values(pathways);
    const pathwayNames = Object.keys(pathways);

    if (pathwayValues.length === 0) {
        insightsDiv.innerHTML = '<p>Add support activities to receive personalized insights about your detoxification pathway optimization.</p>';
        return;
    }

    const minSupport = Math.min(...pathwayValues);
    const weakestPathway = pathwayNames[pathwayValues.indexOf(minSupport)];

    let insights = '<div class="insights-content">';

    if (minSupport < 5) {
        insights += `<div class="insight-item">
            <h4><i class="fas fa-exclamation-triangle"></i> Strengthen ${weakestPathway.charAt(0).toUpperCase() + weakestPathway.slice(1)} Support</h4>
            <p>Your ${weakestPathway} detoxification pathway could benefit from additional support. Consider adding relevant foods, supplements, or activities.</p>
        </div>`;
    }

    const avgSupport = pathwayValues.reduce((sum, val) => sum + val, 0) / pathwayValues.length;
    if (avgSupport >= 7) {
        insights += `<div class="insight-item">
            <h4><i class="fas fa-check-circle"></i> Excellent Detox Support</h4>
            <p>Your overall detoxification support is strong! Continue maintaining this balanced approach for optimal health.</p>
        </div>`;
    }

    const recentActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return activityDate >= weekAgo;
    });

    if (recentActivities.length > 0) {
        insights += `<div class="insight-item">
            <h4><i class="fas fa-calendar-alt"></i> Recent Activity Impact</h4>
            <p>You've added ${recentActivities.length} support activit${recentActivities.length === 1 ? 'y' : 'ies'} in the past week. Monitor how these affect your pathway support levels.</p>
        </div>`;
    }

    insights += '</div>';
    insightsDiv.innerHTML = insights;
}

function updateActivityList() {
    const activityList = document.getElementById('activityList');
    const filterCategory = document.getElementById('filterCategory').value;
    const sortBy = document.getElementById('sortBy').value;

    let filteredActivities = activities;

    if (filterCategory !== 'all') {
        filteredActivities = activities.filter(activity => activity.category === filterCategory);
    }

    // Sort activities
    filteredActivities.sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.date) - new Date(a.date);
            case 'impact':
                return b.totalImpact - a.totalImpact;
            case 'category':
                return a.category.localeCompare(b.category);
            default:
                return 0;
        }
    });

    if (filteredActivities.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No activities found. Add your first detox support activity above!</p>';
        return;
    }

    activityList.innerHTML = filteredActivities.map(activity => {
        const pathways = [];
        if (activity.liverSupport > 0) pathways.push(`Liver: ${activity.liverSupport}`);
        if (activity.kidneySupport > 0) pathways.push(`Kidneys: ${activity.kidneySupport}`);
        if (activity.skinSupport > 0) pathways.push(`Skin: ${activity.skinSupport}`);
        if (activity.lungSupport > 0) pathways.push(`Lungs: ${activity.lungSupport}`);
        if (activity.lymphSupport > 0) pathways.push(`Lymph: ${activity.lymphSupport}`);
        if (activity.gutSupport > 0) pathways.push(`Gut: ${activity.gutSupport}`);

        return `
            <div class="activity-item">
                <div class="activity-info">
                    <div class="activity-name">${activity.name}</div>
                    <div class="activity-details">
                        ${new Date(activity.date).toLocaleDateString()} • ${activity.frequency}x daily • ${activity.category}
                        ${activity.notes ? ` • ${activity.notes}` : ''}
                    </div>
                    <div class="activity-pathways">
                        ${pathways.map(pathway => `<span class="pathway-tag">${pathway}</span>`).join('')}
                    </div>
                </div>
                <div class="activity-actions">
                    <button class="btn-secondary" onclick="editActivity(${activity.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-danger" onclick="deleteActivity(${activity.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function editActivity(id) {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    // Populate form with activity data
    document.getElementById('activityName').value = activity.name;
    document.getElementById('activityDate').value = activity.date;
    document.getElementById('frequency').value = activity.frequency;
    document.getElementById('liverSupport').value = activity.liverSupport;
    document.getElementById('kidneySupport').value = activity.kidneySupport;
    document.getElementById('skinSupport').value = activity.skinSupport;
    document.getElementById('lungSupport').value = activity.lungSupport;
    document.getElementById('lymphSupport').value = activity.lymphSupport;
    document.getElementById('gutSupport').value = activity.gutSupport;
    document.getElementById('activityCategory').value = activity.category;
    document.getElementById('activityNotes').value = activity.notes;

    // Change button to update
    const submitBtn = document.querySelector('#supportForm button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Activity';
    submitBtn.onclick = () => updateActivity(id);

    // Scroll to form
    document.getElementById('supportForm').scrollIntoView({ behavior: 'smooth' });
}

function updateActivity(id) {
    const activityIndex = activities.findIndex(a => a.id === id);
    if (activityIndex === -1) return;

    const name = document.getElementById('activityName').value.trim();
    const date = document.getElementById('activityDate').value;
    const frequency = parseFloat(document.getElementById('frequency').value);
    const liverSupport = parseInt(document.getElementById('liverSupport').value) || 0;
    const kidneySupport = parseInt(document.getElementById('kidneySupport').value) || 0;
    const skinSupport = parseInt(document.getElementById('skinSupport').value) || 0;
    const lungSupport = parseInt(document.getElementById('lungSupport').value) || 0;
    const lymphSupport = parseInt(document.getElementById('lymphSupport').value) || 0;
    const gutSupport = parseInt(document.getElementById('gutSupport').value) || 0;
    const category = document.getElementById('activityCategory').value;
    const notes = document.getElementById('activityNotes').value.trim();

    if (!name || !date || !category) {
        alert('Please fill in all required fields.');
        return;
    }

    const totalImpact = liverSupport + kidneySupport + skinSupport + lungSupport + lymphSupport + gutSupport;

    activities[activityIndex] = {
        ...activities[activityIndex],
        name,
        date,
        frequency,
        liverSupport,
        kidneySupport,
        skinSupport,
        lungSupport,
        lymphSupport,
        gutSupport,
        totalImpact,
        category,
        notes
    };

    localStorage.setItem('detoxPathwayActivities', JSON.stringify(activities));

    // Clear form and reset button
    document.getElementById('activityName').value = '';
    document.getElementById('activityDate').value = '';
    document.getElementById('frequency').value = '1';
    document.getElementById('liverSupport').value = '0';
    document.getElementById('kidneySupport').value = '0';
    document.getElementById('skinSupport').value = '0';
    document.getElementById('lungSupport').value = '0';
    document.getElementById('lymphSupport').value = '0';
    document.getElementById('gutSupport').value = '0';
    document.getElementById('activityCategory').value = '';
    document.getElementById('activityNotes').value = '';

    const submitBtn = document.querySelector('#supportForm button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Support Activity';
    submitBtn.onclick = addActivity;

    updateMatrix();
    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateActivityList();
}

function deleteActivity(id) {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    activities = activities.filter(activity => activity.id !== id);
    localStorage.setItem('detoxPathwayActivities', JSON.stringify(activities));

    updateMatrix();
    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateActivityList();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('activityDate').valueAsDate = new Date();

    // Form submission
    document.getElementById('supportForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addActivity();
    });

    // Filters
    document.getElementById('filterCategory').addEventListener('change', updateActivityList);
    document.getElementById('sortBy').addEventListener('change', updateActivityList);

    // Initialize
    updateMatrix();
    updateStats();
    updateAlert();
    updateChart();
    updateInsights();
    updateActivityList();
});