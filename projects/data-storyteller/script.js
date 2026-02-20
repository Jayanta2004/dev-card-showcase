document.getElementById('fileInput').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                generateStory(results.data);
            }
        });
    } else if (ext === 'json') {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                generateStory(Array.isArray(data) ? data : [data]);
            } catch (err) {
                showError('Invalid JSON file.');
            }
        };
        reader.readAsText(file);
    } else {
        showError('Unsupported file type. Please upload a CSV or JSON file.');
    }
}

function showError(msg) {
    document.getElementById('story').innerHTML = `<div class='insight'>${msg}</div>`;
}

function generateStory(data) {
    const storyDiv = document.getElementById('story');
    storyDiv.innerHTML = '';
    if (!data || !data.length) {
        showError('No data found in the file.');
        return;
    }
    // Show summary
    const keys = Object.keys(data[0]);
    storyDiv.innerHTML += `<div class='insight'><b>Columns:</b> ${keys.join(', ')}</div>`;
    // Show first few rows
    let table = '<table border="1" cellpadding="6" style="border-radius:8px;margin:18px 0;max-width:100%;overflow-x:auto;"><tr>';
    keys.forEach(k => table += `<th>${k}</th>`);
    table += '</tr>';
    data.slice(0, 5).forEach(row => {
        table += '<tr>';
        keys.forEach(k => table += `<td>${row[k] ?? ''}</td>`);
        table += '</tr>';
    });
    table += '</table>';
    storyDiv.innerHTML += table;
    // Try to auto-detect numeric columns for chart
    const numericKeys = keys.filter(k => typeof data[0][k] === 'number');
    if (numericKeys.length >= 1) {
        // Show chart for first numeric column
        const chartKey = numericKeys[0];
        const labels = data.map((row, i) => row[keys[0]] || `Row ${i+1}`);
        const values = data.map(row => row[chartKey]);
        storyDiv.innerHTML += `<div class='chart-container'><canvas id='mainChart'></canvas></div>`;
        new Chart(document.getElementById('mainChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: chartKey,
                    data: values,
                    backgroundColor: '#3b82f6',
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });
        storyDiv.innerHTML += `<div class='insight'>The <b>${chartKey}</b> column is visualized above. You can explore more by editing the code!</div>`;
    }
    // Try to auto-detect lat/lon for map
    const latKey = keys.find(k => k.toLowerCase().includes('lat'));
    const lonKey = keys.find(k => k.toLowerCase().includes('lon') || k.toLowerCase().includes('lng'));
    if (latKey && lonKey) {
        storyDiv.innerHTML += `<div id='map'></div>`;
        setTimeout(() => {
            const map = L.map('map').setView([data[0][latKey], data[0][lonKey]], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
            }).addTo(map);
            data.forEach(row => {
                if (row[latKey] && row[lonKey]) {
                    L.marker([row[latKey], row[lonKey]]).addTo(map)
                        .bindPopup(keys.map(k => `<b>${k}:</b> ${row[k]}`).join('<br>'));
                }
            });
        }, 100);
        storyDiv.innerHTML += `<div class='insight'>Locations from your data are mapped above if latitude/longitude columns were detected.</div>`;
    }
    // Show basic insights
    storyDiv.innerHTML += `<div class='insight'>Rows: <b>${data.length}</b></div>`;
    if (numericKeys.length) {
        numericKeys.forEach(k => {
            const vals = data.map(row => row[k]).filter(v => typeof v === 'number');
            const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
            storyDiv.innerHTML += `<div class='insight'>Average <b>${k}</b>: ${avg}</div>`;
        });
    }
}