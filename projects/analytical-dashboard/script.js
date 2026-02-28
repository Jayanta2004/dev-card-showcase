    (function() {
      // ----- CHART INITIALIZATION (advanced, interactive) -----
      const ctxLine = document.getElementById('trendChart').getContext('2d');
      const ctxBar = document.getElementById('deviceChart').getContext('2d');
      const ctxPie = document.getElementById('sourceChart').getContext('2d');

      // sample data sets
      const days30 = Array.from({ length: 30 }, (_, i) => i + 1);
      
      // base datasets for 30d
      const users30 = [8200, 8450, 9100, 9280, 10200, 11500, 12100, 11800, 12450, 13100, 12800, 13500, 14100, 13800, 15200, 15800, 16200, 17100, 16900, 17500, 18200, 19100, 19800, 20500, 21200, 22100, 23500, 24100, 25600, 27000];

      // device bar data
      const deviceLabels = ['mobile', 'desktop', 'tablet', 'other'];
      const deviceData = [142000, 98000, 32000, 12500];

      // pie: traffic sources
      const sourceLabels = ['organic', 'paid', 'direct', 'referral', 'social'];
      const sourceData = [38, 22, 18, 12, 10];

      // line chart
      const lineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
          labels: days30.map(d => `D${d}`),
          datasets: [{
            label: 'active users',
            data: users30,
            borderColor: '#9d8aff',
            backgroundColor: 'rgba(130, 100, 240, 0.05)',
            borderWidth: 3,
            pointRadius: 2,
            pointHoverRadius: 7,
            pointBackgroundColor: '#cbb5ff',
            tension: 0.2,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { grid: { color: '#35305b' }, ticks: { color: '#b1a6e0' } },
                   x: { ticks: { color: '#b1a6e0', maxRotation: 45 } } }
        }
      });

      // bar chart (device)
      const barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: deviceLabels,
          datasets: [{
            label: 'sessions',
            data: deviceData,
            backgroundColor: ['#816ff0', '#60cfb0', '#b281e0', '#c5a0ff'],
            borderRadius: 8,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { grid: { color: '#36315a' }, ticks: { color: '#bfb3f0' } },
                   x: { ticks: { color: '#bfb3f0' } } }
        }
      });

      // pie chart (source)
      const pieChart = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
          labels: sourceLabels,
          datasets: [{
            data: sourceData,
            backgroundColor: ['#6886ed', '#a47cf0', '#ed8b9c', '#78d6b3', '#d9a56c'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'bottom', labels: { color: '#d6ccff', font: { size: 9 } } } },
          cutout: '65%',
        }
      });

      // ----- KPI + FILTER INTERACTION (simulate data update) -----
      const filterBtns = document.querySelectorAll('.filter-btn');
      const sessionsSpan = document.getElementById('sessionsVal');
      const revenueSpan = document.getElementById('revenueVal');
      const convSpan = document.getElementById('convVal');
      const timeSpan = document.getElementById('timeVal');
      
      // funnel values
      const funnel1 = document.getElementById('funnel1');
      const funnel2 = document.getElementById('funnel2');
      const funnel3 = document.getElementById('funnel3');
      const funnel4 = document.getElementById('funnel4');
      const regionGrowthSpan = document.getElementById('regionGrowth');

      // data presets for different ranges
      const rangeData = {
        '7': { sessions: '68.2K', revenue: '$1.48M', conv: '4.12%', time: '5m 02s', f1:'68.2K', f2:'46.8K', f3:'28.1K', f4:'12.7K', growth:'+2.1% WoW' },
        '30': { sessions: '284.5K', revenue: '$6.24M', conv: '3.86%', time: '4m 28s', f1:'284.5K', f2:'193.2K', f3:'119.8K', f4:'51.2K', growth:'+5.2% WoW' },
        '90': { sessions: '802K', revenue: '$17.1M', conv: '3.52%', time: '4m 01s', f1:'802K', f2:'542K', f3:'302K', f4:'132K', growth:'+9% WoW' },
        'custom': { sessions: '1.42M', revenue: '$31.8M', conv: '3.91%', time: '4m 47s', f1:'1.42M', f2:'982K', f3:'611K', f4:'267K', growth:'+12.3% YTD' }
      };

      function setActiveFilter(active) {
        filterBtns.forEach(btn => btn.classList.remove('active'));
        active.classList.add('active');
        const range = active.getAttribute('data-range');
        const data = rangeData[range] || rangeData['30'];
        
        // update KPI
        sessionsSpan.innerText = data.sessions;
        revenueSpan.innerText = data.revenue;
        convSpan.innerText = data.conv;
        timeSpan.innerText = data.time;
        // funnel
        funnel1.innerText = data.f1;
        funnel2.innerText = data.f2;
        funnel3.innerText = data.f3;
        funnel4.innerText = data.f4;
        regionGrowthSpan.innerText = data.growth;

        // optional: change line chart dataset dynamically (simulate)
        // we'll modify first dataset with slight variations
        if (range === '7') {
          lineChart.data.datasets[0].data = [11200, 12400, 13100, 12800, 14200, 15800, 16200];
          lineChart.data.labels = ['D1','D2','D3','D4','D5','D6','D7'];
        } else if (range === '30') {
          lineChart.data.datasets[0].data = users30;
          lineChart.data.labels = days30.map(d => `D${d}`);
        } else if (range === '90') {
          // mock 90day compressed
          lineChart.data.datasets[0].data = [7500, 8200, 11100, 14200, 16900, 22100, 27000, 31500, 36200, 39800];
          lineChart.data.labels = ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10'];
        } else {
          // custom YTD
          lineChart.data.datasets[0].data = [6200, 8900, 12100, 15800, 21200, 27000, 33100, 40200, 48800, 53100];
          lineChart.data.labels = ['Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov'];
        }
        lineChart.update();
        
        // small change on pie and bar? maybe to simulate: just alter slightly
        if (range === '7') {
          pieChart.data.datasets[0].data = [42, 20, 15, 13, 10];
          barChart.data.datasets[0].data = [35000, 22000, 7800, 2100];
        } else if (range === '90') {
          pieChart.data.datasets[0].data = [34, 24, 19, 14, 9];
          barChart.data.datasets[0].data = [390000, 272000, 94000, 26000];
        } else {
          pieChart.data.datasets[0].data = sourceData;
          barChart.data.datasets[0].data = deviceData;
        }
        pieChart.update();
        barChart.update();
      }

      filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          setActiveFilter(btn);
        });
      });

      // ensure first active (30D) is synced on load
      // already class active but just in case call
      window.addEventListener('load', () => {
        // initial match
        setActiveFilter(document.querySelector('.filter-btn.active'));
      });

      // additional interactive hover/dynamic region effect – just for fun.
      // update region info on geo click simulation
      document.querySelectorAll('.region').forEach(reg => {
        reg.addEventListener('click', () => {
          alert(`🔍 region detail: ${reg.innerText} (simulated drill-down)`);
        });
      });
    })();