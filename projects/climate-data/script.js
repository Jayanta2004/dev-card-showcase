    (function() {
        // ---------- GENERATE REALISTIC CLIMATE DATA (1850–2024) ----------
        const years = [];
        for (let y = 1850; y <= 2024; y++) years.push(y);

        // Temperature anomaly (relative to 1850-1900 baseline, ~0 by construction)
        // realistic shape: slow climb, faster after 1960
        const tempAnomaly = years.map(y => {
            let base = 0;
            if (y <= 1900) base = (y - 1850) * 0.002; // slight rise
            else if (y <= 1940) base = 0.1 + (y-1900)*0.003;
            else if (y <= 1970) base = 0.25 + (y-1940)*0.008;
            else if (y <= 2000) base = 0.55 + (y-1970)*0.018;
            else base = 1.05 + (y-2000)*0.025;
            // add tiny variability
            return parseFloat((base + (Math.sin(y*0.3)*0.05 + (y%5)*0.01)).toFixed(2));
        });

        // CO₂ data (ppm) – ice core + modern: ~280 ppm preindustrial, ~420 in 2024
        const co2 = years.map(y => {
            let base = 280; // 1850 approx
            if (y > 1900) base = 295 + (y-1900)*0.18;   // slow rise early
            if (y > 1958) base = 315 + (y-1958)*1.5;    // mauna loa acceleration
            if (y > 2000) base = 370 + (y-2000)*1.9;
            // cap at reasonable
            return Math.min(425, parseFloat((base + (y%3)*0.4).toFixed(1)));
        });

        // references to DOM
        const tempCtx = document.getElementById('tempChart').getContext('2d');
        const co2Ctx = document.getElementById('co2Chart').getContext('2d');

        // chart instances
        let tempChart, co2Chart;

        // get selected start / end
        const startSelect = document.getElementById('startYear');
        const endSelect = document.getElementById('endYear');
        const datasetBtns = document.querySelectorAll('.dataset-btn');
        const insightHighlight = document.getElementById('dynamicHighlight');

        // current dataset mode: 'temp', 'co2', 'both'
        let currentMode = 'both';  // both by default

        // ----- helper: slice data based on year range -----
        function getFilteredData() {
            const start = parseInt(startSelect.value, 10);
            const end = parseInt(endSelect.value, 10);
            const startIdx = years.findIndex(y => y === start);
            const endIdx = years.findIndex(y => y === end);
            const filteredYears = years.slice(startIdx, endIdx + 1);
            const filteredTemp = tempAnomaly.slice(startIdx, endIdx + 1);
            const filteredCo2 = co2.slice(startIdx, endIdx + 1);
            return { years: filteredYears, temp: filteredTemp, co2: filteredCo2, start, end };
        }

        // update both charts based on range & mode
        function updateVisuals() {
            const { years: yr, temp, co2: co2vals, start, end } = getFilteredData();

            // destroy old charts if exist (simple cleanup)
            if (tempChart) tempChart.destroy();
            if (co2Chart) co2Chart.destroy();

            // ----- TEMPERATURE CHART (always visible) -----
            tempChart = new Chart(tempCtx, {
                type: 'line',
                data: {
                    labels: yr,
                    datasets: [{
                        label: 'temperature anomaly (°C)',
                        data: temp,
                        borderColor: '#c13c3c',
                        backgroundColor: 'rgba(220, 80, 60, 0.05)',
                        tension: 0.2,
                        pointRadius: 1.5,
                        pointHoverRadius: 6,
                        borderWidth: 2.5,
                        fill: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                        y: { 
                            title: { display: true, text: '°C anomaly' },
                            grid: { color: '#a0c0d050' }
                        },
                        x: { 
                            title: { display: true, text: 'year' },
                            grid: { display: false }
                        }
                    }
                }
            });

            // ----- CO2 CHART (always visible, but can be dimmed if mode=temp?) we want it always show, but we might gray out?
            // better: if mode == 'temp' we could show co2 semi, but requirement "climate data visualization" – we keep both charts independent.
            // but the dataset selector changes highlight and optional dual-axis but we keep both graphs always. 
            // we also support "both" by just having both charts; no dual axis needed because they're separate.
            // However we change insight based on mode and maybe modify line style.
            if (currentMode === 'temp') {
                // make CO₂ chart grayed out? optional: show but low opacity
                co2Chart = new Chart(co2Ctx, {
                    type: 'line',
                    data: {
                        labels: yr,
                        datasets: [{
                            label: 'CO₂ (ppm)',
                            data: co2vals,
                            borderColor: '#737373',
                            backgroundColor: 'transparent',
                            borderDash: [5,3],
                            tension: 0.2,
                            pointRadius: 1,
                            borderWidth: 2,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { title: { display: true, text: 'CO₂ (ppm)' }, grid: { color: '#b0c8d8' } },
                            x: { title: { display: true, text: 'year' } }
                        }
                    }
                });
            } else if (currentMode === 'co2') {
                // temperature chart gray
                tempChart.destroy();
                tempChart = new Chart(tempCtx, {
                    type: 'line',
                    data: {
                        labels: yr,
                        datasets: [{
                            label: 'temperature anomaly (°C)',
                            data: temp,
                            borderColor: '#a8a8a8',
                            borderDash: [4,4],
                            tension: 0.2,
                            pointRadius: 1,
                            borderWidth: 2,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { title: { display: true, text: '°C anomaly' } },
                            x: { title: { display: true, text: 'year' } }
                        }
                    }
                });
                // co2 normal
                co2Chart = new Chart(co2Ctx, {
                    type: 'line',
                    data: {
                        labels: yr,
                        datasets: [{
                            label: 'CO₂ (ppm)',
                            data: co2vals,
                            borderColor: '#226688',
                            backgroundColor: 'rgba(30,100,140,0.02)',
                            tension: 0.2,
                            pointRadius: 1.5,
                            borderWidth: 2.5,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { title: { display: true, text: 'CO₂ (ppm)' } },
                            x: { title: { display: true, text: 'year' } }
                        }
                    }
                });
            } else { // both mode – full colour both
                // we already have tempchart coloured; need to redraw both full
                tempChart.destroy();
                tempChart = new Chart(tempCtx, {
                    type: 'line',
                    data: {
                        labels: yr,
                        datasets: [{
                            label: 'temperature anomaly (°C)',
                            data: temp,
                            borderColor: '#c13c3c',
                            backgroundColor: 'rgba(220,80,60,0.02)',
                            tension: 0.2,
                            pointRadius: 1.5,
                            borderWidth: 2.5,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { title: { display: true, text: '°C anomaly' } },
                            x: { title: { display: true, text: 'year' } }
                        }
                    }
                });
                co2Chart = new Chart(co2Ctx, {
                    type: 'line',
                    data: {
                        labels: yr,
                        datasets: [{
                            label: 'CO₂ (ppm)',
                            data: co2vals,
                            borderColor: '#226688',
                            backgroundColor: 'rgba(30,100,140,0.02)',
                            tension: 0.2,
                            pointRadius: 1.5,
                            borderWidth: 2.5,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { title: { display: true, text: 'CO₂ (ppm)' } },
                            x: { title: { display: true, text: 'year' } }
                        }
                    }
                });
            }

            // update insight panel based on full range delta
            const firstTemp = temp[0];
            const lastTemp = temp[temp.length-1];
            const deltaTemp = (lastTemp - firstTemp).toFixed(2);
            const firstCO2 = co2vals[0];
            const lastCO2 = co2vals[co2vals.length-1];
            const deltaCO2 = (lastCO2 - firstCO2).toFixed(1);

            let highlightText = '';
            if (currentMode === 'temp') highlightText = `🌡️ +${deltaTemp}°C`;
            else if (currentMode === 'co2') highlightText = `🧪 +${deltaCO2} ppm`;
            else highlightText = `🌡️ +${deltaTemp}°C  ·  🧪 +${deltaCO2} ppm`;

            insightHighlight.innerText = highlightText;
        }

        // --- event listeners ---
        startSelect.addEventListener('change', updateVisuals);
        endSelect.addEventListener('change', updateVisuals);

        // dataset buttons
        datasetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                datasetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const mode = btn.dataset.dataset; // 'temp', 'co2', 'both'
                currentMode = mode;
                updateVisuals();
            });
        });

        // initial render
        updateVisuals();

        // also add some extra smoothing: re-run on window resize (simple)
        window.addEventListener('resize', () => {
            // debounce optional, just refresh charts (destroy/create) but avoid too frequent
            // we simply call updateVisuals (it redraws)
            updateVisuals();
        });
    })();