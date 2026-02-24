// endocrine-disruption-exposure-log.js

let entries = JSON.parse(localStorage.getItem('endocrineEntries')) || [];

document.addEventListener('DOMContentLoaded', function() {
    loadEntries();
    updateStats();
    setupFilter();

    document.getElementById('exposureForm').addEventListener('submit', addEntry);
    document.getElementById('clearFilter').addEventListener('click', clearFilter);
});

function addEntry(e) {
    e.preventDefault();

    const entry = {
        id: Date.now(),
        date: document.getElementById('exposureDate').value,
        substance: document.getElementById('substance').value.trim(),
        source: document.getElementById('source').value.trim(),
        level: document.getElementById('exposureLevel').value,
        duration: parseFloat(document.getElementById('duration').value) || 0,
        symptoms: document.getElementById('symptoms').value.trim(),
        notes: document.getElementById('notes').value.trim()
    };

    entries.push(entry);
    saveEntries();
    loadEntries();
    updateStats();
    document.getElementById('exposureForm').reset();
    document.getElementById('exposureDate').valueAsDate = new Date();
}

function loadEntries(filter = '') {
    const entriesList = document.getElementById('entriesList');
    entriesList.innerHTML = '';

    const filteredEntries = entries
        .filter(entry => entry.substance.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredEntries.length === 0) {
        entriesList.innerHTML = '<p>No entries found.</p>';
        return;
    }

    filteredEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';
        entryDiv.innerHTML = `
            <div class="entry-header">
                <span class="entry-date">${formatDate(entry.date)}</span>
                <span class="entry-level ${entry.level}">${entry.level.toUpperCase()}</span>
            </div>
            <div class="entry-details">
                <div class="entry-detail"><strong>Substance:</strong> ${entry.substance}</div>
                <div class="entry-detail"><strong>Source:</strong> ${entry.source}</div>
                <div class="entry-detail"><strong>Duration:</strong> ${entry.duration > 0 ? entry.duration + ' hours' : 'N/A'}</div>
                <div class="entry-detail"><strong>Level:</strong> ${entry.level}</div>
            </div>
            ${entry.symptoms ? `<div class="entry-symptoms"><strong>Symptoms:</strong> ${entry.symptoms}</div>` : ''}
            ${entry.notes ? `<div class="entry-notes"><strong>Notes:</strong> ${entry.notes}</div>` : ''}
            <div class="entry-actions">
                <button class="edit-btn" onclick="editEntry(${entry.id})">Edit</button>
                <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
            </div>
        `;
        entriesList.appendChild(entryDiv);
    });
}

function editEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    document.getElementById('exposureDate').value = entry.date;
    document.getElementById('substance').value = entry.substance;
    document.getElementById('source').value = entry.source;
    document.getElementById('exposureLevel').value = entry.level;
    document.getElementById('duration').value = entry.duration;
    document.getElementById('symptoms').value = entry.symptoms;
    document.getElementById('notes').value = entry.notes;

    deleteEntry(id);
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entries = entries.filter(e => e.id !== id);
        saveEntries();
        loadEntries();
        updateStats();
    }
}

function setupFilter() {
    document.getElementById('filterSubstance').addEventListener('input', function() {
        loadEntries(this.value);
    });
}

function clearFilter() {
    document.getElementById('filterSubstance').value = '';
    loadEntries();
}

function updateStats() {
    const totalEntries = entries.length;
    const highExposureCount = entries.filter(e => e.level === 'high').length;

    // Common substances
    const substanceCount = {};
    entries.forEach(entry => {
        substanceCount[entry.substance] = (substanceCount[entry.substance] || 0) + 1;
    });
    const commonSubstances = Object.entries(substanceCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([substance, count]) => `${substance} (${count})`)
        .join(', ') || 'None';

    // Recent symptoms (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEntries = entries.filter(e => new Date(e.date) >= thirtyDaysAgo);
    const recentSymptoms = [...new Set(recentEntries.map(e => e.symptoms).filter(s => s))].slice(0, 3).join(', ') || 'None';

    document.getElementById('totalEntries').textContent = totalEntries;
    document.getElementById('highExposureCount').textContent = highExposureCount;
    document.getElementById('commonSubstances').textContent = commonSubstances;
    document.getElementById('recentSymptoms').textContent = recentSymptoms;
}

function saveEntries() {
    localStorage.setItem('endocrineEntries', JSON.stringify(entries));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}