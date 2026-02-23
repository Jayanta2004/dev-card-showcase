// Online Debate Platform
// Debate join/host logic, argument voting, history, scores

const debates = [];
const history = [];
let activeDebate = null;
let userName = 'User' + Math.floor(Math.random() * 1000);

const debateListEl = document.getElementById('debate-list');
const hostBtn = document.getElementById('host-btn');
const joinBtn = document.getElementById('join-btn');
const activeDebateSection = document.getElementById('active-debate');
const debateTitleEl = document.getElementById('debate-title');
const argumentListEl = document.getElementById('argument-list');
const argumentForm = document.getElementById('argument-form');
const argumentInput = document.getElementById('argument-input');
const voteListEl = document.getElementById('vote-list');
const scoreListEl = document.getElementById('score-list');
const endDebateBtn = document.getElementById('end-debate-btn');
const historyListEl = document.getElementById('history-list');

function renderDebateList() {
    debateListEl.innerHTML = '';
    debates.forEach((debate, idx) => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${debate.title}</strong> - Host: ${debate.host}`;
        const joinBtn = document.createElement('button');
        joinBtn.textContent = 'Join';
        joinBtn.onclick = () => joinDebate(idx);
        div.appendChild(joinBtn);
        debateListEl.appendChild(div);
    });
}

hostBtn.onclick = () => {
    const title = prompt('Debate topic:');
    if (title) {
        debates.push({
            title,
            host: userName,
            arguments: [],
            votes: {},
            scores: {},
            participants: [userName],
        });
        renderDebateList();
    }
};

joinBtn.onclick = () => {
    if (debates.length === 0) {
        alert('No debates to join. Host one!');
        return;
    }
    const idx = prompt('Enter debate number to join (1-' + debates.length + '):');
    const debateIdx = parseInt(idx) - 1;
    if (debateIdx >= 0 && debateIdx < debates.length) {
        joinDebate(debateIdx);
    } else {
        alert('Invalid debate number.');
    }
};

function joinDebate(idx) {
    activeDebate = debates[idx];
    if (!activeDebate.participants.includes(userName)) {
        activeDebate.participants.push(userName);
    }
    debateTitleEl.textContent = activeDebate.title;
    activeDebateSection.style.display = 'block';
    renderArguments();
    renderVotes();
    renderScores();
}

argumentForm.addEventListener('submit', e => {
    e.preventDefault();
    const arg = argumentInput.value.trim();
    if (arg && activeDebate) {
        activeDebate.arguments.push({ text: arg, author: userName, votes: 0 });
        renderArguments();
        renderVotes();
        renderScores();
        argumentInput.value = '';
    }
});

function renderArguments() {
    argumentListEl.innerHTML = '';
    activeDebate.arguments.forEach((arg, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${arg.author}:</strong> ${arg.text}`;
        argumentListEl.appendChild(li);
    });
}

function renderVotes() {
    voteListEl.innerHTML = '';
    activeDebate.arguments.forEach((arg, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${arg.author}:</strong> ${arg.text} <span>Votes: ${arg.votes}</span>`;
        const upvoteBtn = document.createElement('button');
        upvoteBtn.textContent = 'Upvote';
        upvoteBtn.onclick = () => {
            arg.votes++;
            renderVotes();
            renderScores();
        };
        li.appendChild(upvoteBtn);
        voteListEl.appendChild(li);
    });
}

function renderScores() {
    scoreListEl.innerHTML = '';
    const scores = {};
    activeDebate.arguments.forEach(arg => {
        scores[arg.author] = (scores[arg.author] || 0) + arg.votes;
    });
    Object.keys(scores).forEach(author => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${author}:</strong> ${scores[author]} points`;
        scoreListEl.appendChild(li);
    });
    activeDebate.scores = scores;
}

endDebateBtn.onclick = () => {
    if (activeDebate) {
        history.push({
            title: activeDebate.title,
            scores: { ...activeDebate.scores },
            arguments: [...activeDebate.arguments],
            participants: [...activeDebate.participants],
        });
        debates.splice(debates.indexOf(activeDebate), 1);
        activeDebate = null;
        activeDebateSection.style.display = 'none';
        renderDebateList();
        renderHistory();
    }
};

function renderHistory() {
    historyListEl.innerHTML = '';
    history.forEach((debate, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${debate.title}</strong> - Participants: ${debate.participants.join(', ')}<br>Scores: ${Object.entries(debate.scores).map(([k,v]) => `${k}: ${v}`).join(', ')}<br>Arguments: ${debate.arguments.map(a => a.text).join('; ')}`;
        historyListEl.appendChild(li);
    });
}

renderDebateList();
renderHistory();
