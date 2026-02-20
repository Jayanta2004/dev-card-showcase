// Smart Home Energy Optimizer App
// Data Models
let devices = JSON.parse(localStorage.getItem('smartHomeDevices') || '[]');
let usageData = JSON.parse(localStorage.getItem('smartHomeUsageData') || '[]');

if (devices.length === 0) {
  devices = [
    { id: 1, name: 'Living Room Light', type: 'Light', status: 'On', power: 12 },
    { id: 2, name: 'Kitchen Fridge', type: 'Appliance', status: 'On', power: 150 },
    { id: 3, name: 'Bedroom Heater', type: 'Heater', status: 'Off', power: 0 }
  ];
}
if (usageData.length === 0) {
  usageData = [
    { deviceId: 1, date: '2026-02-10', usage: 2 },
    { deviceId: 2, date: '2026-02-10', usage: 24 },
    { deviceId: 3, date: '2026-02-10', usage: 0 }
  ];
}

function saveAll() {
  localStorage.setItem('smartHomeDevices', JSON.stringify(devices));
  localStorage.setItem('smartHomeUsageData', JSON.stringify(usageData));
}

function renderDashboard() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Energy Usage Dashboard</h2>
    <div class="chart-container">
      <canvas id="usageChart"></canvas>
    </div>
    <div class="card">
      <h3>Current Device Status</h3>
      <ul class="device-list">
        ${devices.map(d => `
          <li>
            <span><strong>${d.name}</strong> (${d.type})</span>
            <span>Status: ${d.status}</span>
            <span>Power: ${d.power} W</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  setTimeout(drawUsageChart, 0);
}

function drawUsageChart() {
  const ctx = document.getElementById('usageChart').getContext('2d');
  const dates = [...new Set(usageData.map(d => d.date))];
  const datasets = devices.map(dev => ({
    label: dev.name,
    data: dates.map(date => {
      const found = usageData.find(u => u.deviceId === dev.id && u.date === date);
      return found ? found.usage : 0;
    }),
    backgroundColor: getRandomColor()
  }));
  if (window.usageChartInstance) window.usageChartInstance.destroy();
  window.usageChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Device Energy Usage (kWh)' }
      }
    }
  });
}

function getRandomColor() {
  const colors = ['#43cea2', '#185a9d', '#f9d423', '#00c3ff', '#ff6e7f'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function renderDevices() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Connected Devices</h2>
    <form id="device-form">
      <label>Name
        <input type="text" id="device-name" required>
      </label>
      <label>Type
        <input type="text" id="device-type" required>
      </label>
      <button class="action" type="submit">Add Device</button>
    </form>
    <ul class="device-list">
      ${devices.length ? devices.map((d, idx) => `
        <li>
          <span><strong>${d.name}</strong> (${d.type})</span>
          <span>Status: ${d.status}</span>
          <span>Power: ${d.power} W</span>
          <button class="action" onclick="editDevice(${idx})">Edit</button>
        </li>
      `).join('') : '<li>No devices connected.</li>'}
    </ul>
  `;
  document.getElementById('device-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('device-name').value;
    const type = document.getElementById('device-type').value;
    devices.push({ id: Date.now(), name, type, status: 'Off', power: 0 });
    saveAll();
    renderDevices();
  };
}

function editDevice(idx) {
  const d = devices[idx];
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Edit Device</h2>
    <form id="edit-device-form">
      <label>Name
        <input type="text" id="edit-device-name" value="${d.name}" required>
      </label>
      <label>Type
        <input type="text" id="edit-device-type" value="${d.type}" required>
      </label>
      <label>Status
        <select id="edit-device-status">
          <option value="On" ${d.status === 'On' ? 'selected' : ''}>On</option>
          <option value="Off" ${d.status === 'Off' ? 'selected' : ''}>Off</option>
        </select>
      </label>
      <label>Power (W)
        <input type="number" id="edit-device-power" value="${d.power}" min="0" required>
      </label>
      <button class="action" type="submit">Save</button>
      <button class="action" type="button" onclick="renderDevices()">Cancel</button>
    </form>
  `;
  document.getElementById('edit-device-form').onsubmit = function(e) {
    e.preventDefault();
    d.name = document.getElementById('edit-device-name').value;
    d.type = document.getElementById('edit-device-type').value;
    d.status = document.getElementById('edit-device-status').value;
    d.power = parseInt(document.getElementById('edit-device-power').value);
    saveAll();
    renderDevices();
  };
}

function renderAnalysis() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Usage Analysis</h2>
    <div class="card">
      <h3>Summary</h3>
      <div id="analysis-summary"></div>
    </div>
    <div class="card">
      <h3>Device Breakdown</h3>
      <ul class="device-list">
        ${devices.map(d => `
          <li>
            <span><strong>${d.name}</strong> (${d.type})</span>
            <span>Total Usage: ${getDeviceTotalUsage(d.id)} kWh</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  renderAnalysisSummary();
}

function getDeviceTotalUsage(deviceId) {
  return usageData.filter(u => u.deviceId === deviceId).reduce((sum, u) => sum + u.usage, 0);
}

function renderAnalysisSummary() {
  const total = usageData.reduce((sum, u) => sum + u.usage, 0);
  const avg = (total / devices.length).toFixed(2);
  document.getElementById('analysis-summary').innerHTML = `
    <p>Total Usage: <strong>${total} kWh</strong></p>
    <p>Average Usage per Device: <strong>${avg} kWh</strong></p>
  `;
}

function renderSuggestions() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Energy Saving Suggestions</h2>
    <ul class="device-list">
      ${devices.map(d => `
        <li>
          <span><strong>${d.name}</strong> (${d.type})</span>
          <span>${suggestForDevice(d)}</span>
        </li>
      `).join('')}
    </ul>
    <div class="card">
      <h3>General Tips</h3>
      <ul>
        <li>Turn off devices when not in use.</li>
        <li>Use energy-efficient appliances.</li>
        <li>Monitor and reduce peak usage times.</li>
        <li>Automate device schedules for efficiency.</li>
      </ul>
    </div>
  `;
}

function suggestForDevice(d) {
  if (d.status === 'On' && d.power > 100) {
    return 'Consider turning off or scheduling this device during off-peak hours.';
  }
  if (d.status === 'On' && d.power <= 100) {
    return 'This device is running efficiently.';
  }
  if (d.status === 'Off') {
    return 'Device is off. No action needed.';
  }
  return '';
}

document.getElementById('nav-dashboard').onclick = renderDashboard;
document.getElementById('nav-devices').onclick = renderDevices;
document.getElementById('nav-analysis').onclick = renderAnalysis;
document.getElementById('nav-suggestions').onclick = renderSuggestions;

// Initial load
renderDashboard();
