document.addEventListener('DOMContentLoaded', function() {
    const panicForm = document.getElementById('panicForm');
    const episodesTable = document.getElementById('episodesTable');
    const severitySlider = document.getElementById('severity');
    const severityValue = document.getElementById('severityValue');
    const effectivenessSlider = document.getElementById('effectiveness');
    const effectivenessValue = document.getElementById('effectivenessValue');

    // Stats elements
    const totalEpisodesEl = document.getElementById('totalEpisodes');
    const avgSeverityEl = document.getElementById('avgSeverity');
    const episodesThisMonthEl = document.getElementById('episodesThisMonth');
    const avgDurationEl = document.getElementById('avgDuration');

    // Insights elements
    const commonTriggersEl = document.getElementById('commonTriggers');
    const effectiveCopingEl = document.getElementById('effectiveCoping');
    const peakTimesEl = document.getElementById('peakTimes');

    const severityChartCanvas = document.getElementById('severityChart');

    let episodes = JSON.parse(localStorage.getItem('panicEpisodes')) || [];
    let chart;

    // Set default date and time to now
    const now = new Date();
    document.getElementById('date').valueAsDate = now;
    document.getElementById('time').value = now.toTimeString().slice(0, 5);

    // Update slider values in real-time
    severitySlider.addEventListener('input', function() {
        severityValue.textContent = this.value;
    });

    effectivenessSlider.addEventListener('input', function() {
        effectivenessValue.textContent = this.value;
    });

    function saveEpisodes() {
        localStorage.setItem('panicEpisodes', JSON.stringify(episodes));
    }

    function getSeverityClass(severity) {
        if (severity <= 2) return 'severity-1-2';
        if (severity <= 4) return 'severity-3-4';
        if (severity <= 6) return 'severity-5-6';
        if (severity <= 8) return 'severity-7-8';
        return 'severity-9-10';
    }

    function formatTriggers(triggers) {
        const triggerLabels = {
            stress: 'Work/School Stress',
            social: 'Social Anxiety',
            health: 'Health Concerns',
            crowds: 'Crowds/Public Spaces',
            driving: 'Driving',
            flying: 'Flying',
            unknown: 'Unknown',
            other: 'Other'
        };
        return triggers.map(t => `<span class="trigger-tag">${triggerLabels[t] || t}</span>`).join(' ');
    }

    function formatCoping(coping) {
        const copingLabels = {
            breathing: 'Deep Breathing',
            grounding: 'Grounding',
            medication: 'Medication',
            distraction: 'Distraction',
            support: 'Support Person',
            walking: 'Walking/Pacing',
            none: 'None',
            other: 'Other'
        };
        return coping.map(c => `<span class="coping-tag">${copingLabels[c] || c}</span>`).join(' ');
    }

    function calculateStats() {
        if (episodes.length === 0) {
            totalEpisodesEl.textContent = '--';
            avgSeverityEl.textContent = '--/10';
            episodesThisMonthEl.textContent = '--';
            avgDurationEl.textContent = '-- min';
            return;
        }

        const totalEpisodes = episodes.length;
        const avgSeverity = (episodes.reduce((sum, ep) => sum + ep.severity, 0) / totalEpisodes).toFixed(1);
        const avgDuration = Math.round(episodes.reduce((sum, ep) => sum + ep.duration, 0) / totalEpisodes);

        // Episodes this month
        const now = new Date();
        const thisMonth = episodes.filter(ep => {
            const epDate = new Date(ep.date);
            return epDate.getMonth() === now.getMonth() && epDate.getFullYear() === now.getFullYear();
        }).length;

        totalEpisodesEl.textContent = totalEpisodes;
        avgSeverityEl.textContent = `${avgSeverity}/10`;
        episodesThisMonthEl.textContent = thisMonth;
        avgDurationEl.textContent = `${avgDuration} min`;
    }

    function calculateInsights() {
        if (episodes.length === 0) {
            commonTriggersEl.textContent = 'No data yet';
            effectiveCopingEl.textContent = 'No data yet';
            peakTimesEl.textContent = 'No data yet';
            return;
        }

        // Common triggers
        const triggerCount = {};
        episodes.forEach(ep => {
            ep.triggers.forEach(trigger => {
                triggerCount[trigger] = (triggerCount[trigger] || 0) + 1;
            });
        });
        const topTriggers = Object.entries(triggerCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([trigger, count]) => `${trigger} (${count})`)
            .join(', ');
        commonTriggersEl.textContent = topTriggers || 'None identified';

        // Effective coping strategies
        const copingEffectiveness = {};
        episodes.forEach(ep => {
            if (ep.effectiveness && ep.coping.length > 0) {
                ep.coping.forEach(coping => {
                    if (!copingEffectiveness[coping]) {
                        copingEffectiveness[coping] = { total: 0, count: 0 };
                    }
                    copingEffectiveness[coping].total += ep.effectiveness;
                    copingEffectiveness[coping].count += 1;
                });
            }
        });
        const topCoping = Object.entries(copingEffectiveness)
            .map(([coping, data]) => ({ coping, avg: data.total / data.count }))
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 3)
            .map(item => `${item.coping} (${item.avg.toFixed(1)})`)
            .join(', ');
        effectiveCopingEl.textContent = topCoping || 'No ratings yet';

        // Peak times
        const hourCount = {};
        episodes.forEach(ep => {
            const hour = new Date(`${ep.date}T${ep.time}`).getHours();
            hourCount[hour] = (hourCount[hour] || 0) + 1;
        });
        const peakHour = Object.entries(hourCount)
            .sort(([,a], [,b]) => b - a)[0];
        if (peakHour) {
            const hour = parseInt(peakHour[0]);
            const timeLabel = hour === 0 ? '12 AM' :
                            hour < 12 ? `${hour} AM` :
                            hour === 12 ? '12 PM' :
                            `${hour - 12} PM`;
            peakTimesEl.textContent = `${timeLabel} (${peakHour[1]} episodes)`;
        } else {
            peakTimesEl.textContent = 'No pattern yet';
        }
    }

    function renderEpisodesTable() {
        if (episodes.length === 0) {
            episodesTable.innerHTML = '<p>No panic episodes logged yet. Start tracking to identify patterns!</p>';
            return;
        }

        // Sort episodes by date/time (newest first)
        episodes.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date & Time</th>
                    <th>Severity</th>
                    <th>Duration</th>
                    <th>Triggers</th>
                    <th>Coping</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${episodes.map((episode, index) => `
                    <tr class="${getSeverityClass(episode.severity)}">
                        <td>${new Date(`${episode.date}T${episode.time}`).toLocaleString()}</td>
                        <td><span class="severity-badge">${episode.severity}/10</span></td>
                        <td>${episode.duration} min</td>
                        <td>${formatTriggers(episode.triggers)}</td>
                        <td>${formatCoping(episode.coping)}</td>
                        <td>${episode.notes || '-'}</td>
                        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        episodesTable.innerHTML = '';
        episodesTable.appendChild(table);

        // Add delete event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (confirm('Are you sure you want to delete this episode?')) {
                    episodes.splice(index, 1);
                    saveEpisodes();
                    renderEpisodesTable();
                    calculateStats();
                    calculateInsights();
                    updateChart();
                }
            });
        });
    }

    function updateChart() {
        if (episodes.length === 0) {
            if (chart) chart.destroy();
            return;
        }

        // Sort episodes by date for chart
        const sortedEpisodes = [...episodes].sort((a, b) =>
            new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
        );

        const labels = sortedEpisodes.map(episode =>
            new Date(`${episode.date}T${episode.time}`).toLocaleDateString()
        );
        const severities = sortedEpisodes.map(episode => episode.severity);

        if (chart) chart.destroy();

        chart = new Chart(severityChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Severity (1-10)',
                    data: severities,
                    borderColor: '#4fd1ff',
                    backgroundColor: 'rgba(79, 209, 255, 0.1)',
                    tension: 0.1,
                    fill: true,
                    pointBackgroundColor: function(context) {
                        const severity = context.parsed.y;
                        if (severity <= 2) return '#4CAF50';
                        if (severity <= 4) return '#8BC34A';
                        if (severity <= 6) return '#FF9800';
                        if (severity <= 8) return '#FF5722';
                        return '#F44336';
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }

    panicForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const severity = parseInt(document.getElementById('severity').value);
        const duration = parseInt(document.getElementById('duration').value);

        // Get selected triggers
        const triggersSelect = document.getElementById('triggers');
        const triggers = Array.from(triggersSelect.selectedOptions).map(option => option.value);

        // Get selected coping strategies
        const copingSelect = document.getElementById('coping');
        const coping = Array.from(copingSelect.selectedOptions).map(option => option.value);

        const effectiveness = parseInt(document.getElementById('effectiveness').value);
        const symptoms = document.getElementById('symptoms').value.trim();
        const notes = document.getElementById('notes').value.trim();

        const newEpisode = {
            date,
            time,
            severity,
            duration,
            triggers,
            coping,
            effectiveness,
            symptoms,
            notes
        };

        episodes.push(newEpisode);
        saveEpisodes();

        // Reset form
        panicForm.reset();
        document.getElementById('date').valueAsDate = new Date();
        document.getElementById('time').value = new Date().toTimeString().slice(0, 5);
        severityValue.textContent = '5';
        effectivenessValue.textContent = '5';

        // Update UI
        calculateStats();
        calculateInsights();
        renderEpisodesTable();
        updateChart();
    });

    // Initial render
    calculateStats();
    calculateInsights();
    renderEpisodesTable();
    updateChart();
});