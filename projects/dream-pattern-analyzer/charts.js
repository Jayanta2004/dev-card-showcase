// Dream Pattern Analyzer - Chart Rendering (Word Frequency, Emotions, Symbols)

function renderBarChart(ctx, labels, data, label, color) {
    if (window.Chart) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: color,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

function renderPieChart(ctx, labels, data, label, colors) {
    if (window.Chart) {
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: colors,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: false }
                }
            }
        });
    }
}

window.DreamCharts = { renderBarChart, renderPieChart };
