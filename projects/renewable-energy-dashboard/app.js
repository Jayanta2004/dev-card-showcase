// Renewable Energy Dashboard App
// Data Models
const energySources = [
  { name: 'Solar', color: '#f9d423', icon: '☀️' },
  { name: 'Wind', color: '#00c3ff', icon: '🌬️' },
  { name: 'Hydro', color: '#2f80ed', icon: '💧' },
  { name: 'Geothermal', color: '#ff6e7f', icon: '🌋' },
  { name: 'Biomass', color: '#43cea2', icon: '🌱' }
];

let energyData = JSON.parse(localStorage.getItem('energyData') || '[]');
let communityPosts = JSON.parse(localStorage.getItem('energyCommunityPosts') || '[]');

if (energyData.length === 0) {
  energyData = [
    { source: 'Solar', year: 2022, value: 120 },
    { source: 'Wind', year: 2022, value: 90 },
    { source: 'Hydro', year: 2022, value: 60 },
    { source: 'Geothermal', year: 2022, value: 30 },
    { source: 'Biomass', year: 2022, value: 20 },
    { source: 'Solar', year: 2023, value: 150 },
    { source: 'Wind', year: 2023, value: 110 },
    { source: 'Hydro', year: 2023, value: 70 },
    { source: 'Geothermal', year: 2023, value: 35 },
    { source: 'Biomass', year: 2023, value: 25 }
  ];
}

function saveAll() {
  localStorage.setItem('energyData', JSON.stringify(energyData));
  localStorage.setItem('energyCommunityPosts', JSON.stringify(communityPosts));
}

function renderVisualize() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Energy Production Visualization</h2>
    <div class="chart-container">
      <canvas id="energyChart"></canvas>
    </div>
    <button class="action" onclick="addEnergyData()">Add Data</button>
  `;
  setTimeout(drawEnergyChart, 0);
}

function drawEnergyChart() {
  const ctx = document.getElementById('energyChart').getContext('2d');
  const years = [...new Set(energyData.map(d => d.year))];
  const datasets = energySources.map(src => ({
    label: src.name,
    data: years.map(y => {
      const found = energyData.find(d => d.source === src.name && d.year === y);
      return found ? found.value : 0;
    }),
    backgroundColor: src.color
  }));
  if (window.energyChartInstance) window.energyChartInstance.destroy();
  window.energyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Renewable Energy Production by Source (MWh)' }
      }
    }
  });
}

function addEnergyData() {
  const source = prompt('Source (Solar, Wind, Hydro, Geothermal, Biomass):');
  if (!energySources.some(s => s.name.toLowerCase() === source.toLowerCase())) {
    alert('Invalid source.');
    return;
  }
  const year = parseInt(prompt('Year (e.g. 2024):'));
  const value = parseFloat(prompt('Production (MWh):'));
  if (!year || !value) {
    alert('Invalid year or value.');
    return;
  }
  energyData.push({ source: capitalize(source), year, value });
  saveAll();
  renderVisualize();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function renderCompare() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Compare Energy Sources</h2>
    <form id="compare-form">
      <label>Source 1
        <select id="compare-source1">
          ${energySources.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
        </select>
      </label>
      <label>Source 2
        <select id="compare-source2">
          ${energySources.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
        </select>
      </label>
      <label>Year
        <select id="compare-year">
          ${[...new Set(energyData.map(d => d.year))].map(y => `<option value="${y}">${y}</option>`).join('')}
        </select>
      </label>
      <button class="action" type="submit">Compare</button>
    </form>
    <div id="compare-result"></div>
  `;
  document.getElementById('compare-form').onsubmit = handleCompare;
}

function handleCompare(e) {
  e.preventDefault();
  const s1 = document.getElementById('compare-source1').value;
  const s2 = document.getElementById('compare-source2').value;
  const year = parseInt(document.getElementById('compare-year').value);
  if (s1 === s2) {
    document.getElementById('compare-result').innerHTML = '<p>Select two different sources.</p>';
    return;
  }
  const d1 = energyData.find(d => d.source === s1 && d.year === year);
  const d2 = energyData.find(d => d.source === s2 && d.year === year);
  document.getElementById('compare-result').innerHTML = `
    <div class="card">
      <div><strong>${s1}</strong>: ${d1 ? d1.value + ' MWh' : 'No data'}</div>
      <div><strong>${s2}</strong>: ${d2 ? d2.value + ' MWh' : 'No data'}</div>
      <div><strong>Difference:</strong> ${d1 && d2 ? (d1.value - d2.value).toFixed(2) + ' MWh' : 'N/A'}</div>
    </div>
  `;
}

function renderTrack() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Track Your Renewable Usage</h2>
    <form id="track-form">
      <label>Source
        <select id="track-source">
          ${energySources.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
        </select>
      </label>
      <label>Amount (kWh)
        <input type="number" id="track-amount" min="0" step="any" required>
      </label>
      <label>Date
        <input type="date" id="track-date" value="${new Date().toISOString().slice(0,10)}" required>
      </label>
      <button class="action" type="submit">Add Usage</button>
    </form>
    <div id="track-list"></div>
  `;
  document.getElementById('track-form').onsubmit = handleTrack;
  renderTrackList();
}

let userUsage = JSON.parse(localStorage.getItem('userRenewableUsage') || '[]');
function saveUserUsage() {
  localStorage.setItem('userRenewableUsage', JSON.stringify(userUsage));
}

function handleTrack(e) {
  e.preventDefault();
  const source = document.getElementById('track-source').value;
  const amount = parseFloat(document.getElementById('track-amount').value);
  const date = document.getElementById('track-date').value;
  if (!source || !amount || !date) {
    alert('Please fill all fields.');
    return;
  }
  userUsage.push({ source, amount, date });
  saveUserUsage();
  renderTrackList();
}

function renderTrackList() {
  const container = document.getElementById('track-list');
  if (!userUsage.length) {
    container.innerHTML = '<p>No usage tracked yet.</p>';
    return;
  }
  container.innerHTML = userUsage.slice().reverse().map(u => `
    <div class="card">
      <div><strong>${u.source}</strong> - ${u.amount} kWh</div>
      <div>${u.date}</div>
    </div>
  `).join('');
}

function renderEducation() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Educational Resources</h2>
    <div class="card">
      <h3>What is Renewable Energy?</h3>
      <p>Renewable energy comes from natural sources that are constantly replenished, such as sunlight, wind, water, geothermal, and biomass.</p>
    </div>
    <div class="card">
      <h3>Types of Renewable Energy</h3>
      <ul>
        <li><strong>Solar:</strong> Energy from the sun, captured by solar panels.</li>
        <li><strong>Wind:</strong> Energy from moving air, captured by wind turbines.</li>
        <li><strong>Hydro:</strong> Energy from moving water, captured by dams or turbines.</li>
        <li><strong>Geothermal:</strong> Energy from heat within the earth.</li>
        <li><strong>Biomass:</strong> Energy from organic materials like plants and waste.</li>
      </ul>
    </div>
    <div class="card">
      <h3>Why Use Renewable Energy?</h3>
      <ul>
        <li>Reduces greenhouse gas emissions</li>
        <li>Decreases air and water pollution</li>
        <li>Promotes energy independence</li>
        <li>Creates green jobs</li>
      </ul>
    </div>
    <div class="card">
      <h3>Learn More</h3>
      <ul>
        <li><a href="https://www.energy.gov/eere/renewable-energy" target="_blank">U.S. Department of Energy: Renewable Energy</a></li>
        <li><a href="https://www.nrel.gov/research/re-education.html" target="_blank">NREL: Renewable Energy Education</a></li>
        <li><a href="https://www.iea.org/topics/renewables" target="_blank">IEA: Renewables</a></li>
      </ul>
    </div>
  `;
}

function renderCommunity() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Community Sharing</h2>
    <form id="community-form">
      <label>Name
        <input type="text" id="community-name" required>
      </label>
      <label>Message
        <textarea id="community-message" rows="2" required></textarea>
      </label>
      <button class="action" type="submit">Share</button>
    </form>
    <ul class="community-list">
      ${communityPosts.length ? communityPosts.slice().reverse().map(p => `
        <li>
          <span><strong>${p.name}</strong></span>
          <span>${p.message}</span>
        </li>
      `).join('') : '<li>No posts yet. Be the first to share!</li>'}
    </ul>
  `;
  document.getElementById('community-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('community-name').value;
    const message = document.getElementById('community-message').value;
    if (!name || !message) {
      alert('Please fill all fields.');
      return;
    }
    communityPosts.push({ name, message });
    saveAll();
    renderCommunity();
  };
}

document.getElementById('nav-visualize').onclick = renderVisualize;
document.getElementById('nav-compare').onclick = renderCompare;
document.getElementById('nav-track').onclick = renderTrack;
document.getElementById('nav-edu').onclick = renderEducation;
document.getElementById('nav-community').onclick = renderCommunity;

// Initial load
renderVisualize();
