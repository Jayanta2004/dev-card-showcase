// Digital Gratitude Journal with Sentiment Analysis
// Stores entries in localStorage, analyzes sentiment, and shows community inspiration

let journalEntries = [];
let communityEntries = [];

function loadEntries() {
    const data = localStorage.getItem('gratitudeJournal');
    journalEntries = data ? JSON.parse(data) : [];
    const communityData = localStorage.getItem('communityGratitude');
    communityEntries = communityData ? JSON.parse(communityData) : [];
}

function saveEntries() {
    localStorage.setItem('gratitudeJournal', JSON.stringify(journalEntries));
    localStorage.setItem('communityGratitude', JSON.stringify(communityEntries));
}

function addEntry(text, anonymous) {
    const entry = {
        text,
        anonymous,
        timestamp: new Date().toLocaleString(),
        sentiment: analyzeSentiment(text)
    };
    journalEntries.push(entry);
    if (anonymous) {
        communityEntries.push({ text, timestamp: entry.timestamp });
    }
    saveEntries();
    renderJournal();
    renderSentiment();
    renderCommunity();
}

function analyzeSentiment(text) {
    // Improved sentiment analysis: count positive/negative words, check for exclamation, length, and emoticons
    const positiveWords = ['happy','grateful','joy','love','peace','excited','thankful','good','wonderful','amazing','awesome','delight','smile','hope','blessed','cheerful','uplifted','content','optimistic','inspired','motivated','calm','relaxed','satisfied'];
    const negativeWords = ['sad','angry','upset','bad','hate','pain','worry','fear','stress','cry','lonely','hurt','tired','anxious','depressed','frustrated','disappointed','gloomy','hopeless','nervous','afraid','unhappy'];
    let score = 0;
    const words = text.toLowerCase().split(/\W+/);
    words.forEach(word => {
        if (positiveWords.includes(word)) score++;
        if (negativeWords.includes(word)) score--;
    });
    if (text.includes('!')) score += 1;
    if (text.length > 100) score += 1;
    if (/(:\)|:D|<3|😊|😃|😄|😁)/.test(text)) score += 2;
    if (/(:\(|😢|😭|😔|😞)/.test(text)) score -= 2;
    return score;
}

function renderJournal() {
    const list = document.getElementById('journal-list');
    list.innerHTML = '';
    journalEntries.forEach((entry, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<b>${entry.timestamp}</b><br>${entry.text}<br>Sentiment: ${entry.sentiment}`;
        // Edit and delete buttons
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editEntry(idx);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => deleteEntry(idx);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

function editEntry(idx) {
    const entry = journalEntries[idx];
    const newText = prompt('Edit your entry:', entry.text);
    if (newText !== null && newText.trim() !== '') {
        entry.text = newText;
        entry.sentiment = analyzeSentiment(newText);
        saveEntries();
        renderJournal();
        renderSentiment();
    }
}

function deleteEntry(idx) {
    if (confirm('Delete this entry?')) {
        journalEntries.splice(idx, 1);
        saveEntries();
        renderJournal();
        renderSentiment();
    }
}
}

function renderSentiment() {
    const info = document.getElementById('sentiment-info');
    if (journalEntries.length === 0) {
        info.textContent = 'No entries yet.';
        return;
    }
    let total = 0;
    let moodData = [];
    journalEntries.forEach((e, idx) => {
        total += e.sentiment;
        moodData.push({ day: idx + 1, sentiment: e.sentiment });
    });
    const avg = total / journalEntries.length;
    info.innerHTML = `Average Sentiment: ${avg.toFixed(2)}<br>`;
    // Mood chart
    info.innerHTML += '<canvas id="mood-chart" width="300" height="100"></canvas>';
    setTimeout(() => drawMoodChart(moodData), 0);
    if (avg > 0) {
        info.innerHTML += '<br>Your gratitude entries are mostly positive! Keep it up.';
    } else if (avg < 0) {
        info.innerHTML += '<br>Some entries are negative. Try focusing on positive moments.';
    } else {
        info.innerHTML += '<br>Neutral mood. Reflect on what brings you joy.';
    }
    // Habit suggestions
    info.innerHTML += '<br><b>Habit Suggestion:</b> ' + suggestHabit(avg);
}

function drawMoodChart(moodData) {
    const chart = document.getElementById('mood-chart');
    if (!chart) return;
    const ctx = chart.getContext('2d');
    ctx.clearRect(0, 0, chart.width, chart.height);
    ctx.beginPath();
    ctx.moveTo(0, chart.height - moodData[0].sentiment * 10);
    moodData.forEach((d, i) => {
        ctx.lineTo(i * (chart.width / moodData.length), chart.height - d.sentiment * 10);
    });
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffa000';
    moodData.forEach((d, i) => {
        ctx.beginPath();
        ctx.arc(i * (chart.width / moodData.length), chart.height - d.sentiment * 10, 3, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function suggestHabit(avg) {
    if (avg > 1) return 'Keep a daily gratitude list and share it with friends.';
    if (avg < -1) return 'Try mindful meditation or write about positive moments.';
    return 'Reflect on small joys and connect with others.';
}

function renderCommunity() {
    const list = document.getElementById('community-list');
    list.innerHTML = '';
    communityEntries.slice(-10).reverse().forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<b>${entry.timestamp}</b><br>${entry.text}`;
        list.appendChild(li);
    });
}

function setupForm() {
    const form = document.getElementById('entry-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const text = document.getElementById('entry-text').value;
        const anonymous = document.getElementById('anonymous').checked;
        addEntry(text, anonymous);
        form.reset();
    });
}

window.onload = function() {
    loadEntries();
    renderJournal();
    renderSentiment();
    renderCommunity();
    setupForm();
};
