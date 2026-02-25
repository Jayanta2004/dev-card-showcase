// Personal Data Privacy Dashboard
// Author: EWOC Contributors
// Description: Visualize and manage all app permissions and data-sharing settings in one place

const form = document.getElementById('appForm');
const confirmation = document.getElementById('confirmation');
const dashboardDiv = document.getElementById('dashboard');
const summaryDiv = document.getElementById('summary');

const STORAGE_KEY = 'privacyDashboardApps';
const PERMISSIONS = [
    'Camera',
    'Microphone',
    'Location',
    'Contacts',
    'Photos',
    'Notifications',
    'Calendar',
    'Health Data',
    'Files',
    'Bluetooth'
];

function getApps() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveApps(apps) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function renderDashboard() {
    const apps = getApps();
    if (!apps.length) {
        dashboardDiv.innerHTML = '<em>No apps/services added yet.</em>';
        summaryDiv.innerHTML = '';
        return;
    }
    dashboardDiv.innerHTML = apps.map((app, idx) => renderAppCard(app, idx)).join('');
    renderSummary();
}

function renderAppCard(app, idx) {
    return `<div class="app-card">
        <div class="app-title">${escapeHtml(app.name)}</div>
        <div class="permissions">
            ${PERMISSIONS.map(perm =>
                `<span class="permission-toggle">
                    <input type="checkbox" id="perm-${idx}-${perm}" ${app.permissions[perm] ? 'checked' : ''} onchange="togglePermission(${idx}, '${perm}')">
                    <label for="perm-${idx}-${perm}">${perm}</label>
                </span>`
            ).join('')}
        </div>
        <div class="data-sharing">
            <label>Data Sharing: </label>
            <select onchange="setDataSharing(${idx}, this.value)">
                <option value="none" ${app.dataSharing==='none'?'selected':''}>None</option>
                <option value="limited" ${app.dataSharing==='limited'?'selected':''}>Limited</option>
                <option value="full" ${app.dataSharing==='full'?'selected':''}>Full</option>
            </select>
        </div>
    </div>`;
}

window.togglePermission = function(idx, perm) {
    const apps = getApps();
    apps[idx].permissions[perm] = !apps[idx].permissions[perm];
    saveApps(apps);
    renderDashboard();
};

window.setDataSharing = function(idx, value) {
    const apps = getApps();
    apps[idx].dataSharing = value;
    saveApps(apps);
    renderDashboard();
};

function renderSummary() {
    const apps = getApps();
    let totalPerms = 0, enabledPerms = 0, fullSharing = 0;
    apps.forEach(app => {
        totalPerms += PERMISSIONS.length;
        enabledPerms += Object.values(app.permissions).filter(Boolean).length;
        if (app.dataSharing === 'full') fullSharing++;
    });
    summaryDiv.innerHTML = `<div class="summary">
        <b>Permissions enabled:</b> ${enabledPerms} / ${totalPerms} <br>
        <b>Apps with full data sharing:</b> ${fullSharing} / ${apps.length}
    </div>`;
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = form.appName.value.trim();
    if (!name) return;
    const apps = getApps();
    apps.push({
        name,
        permissions: Object.fromEntries(PERMISSIONS.map(p => [p, false])),
        dataSharing: 'none'
    });
    saveApps(apps);
    confirmation.textContent = 'App/service added!';
    confirmation.classList.remove('hidden');
    form.reset();
    renderDashboard();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderDashboard();
