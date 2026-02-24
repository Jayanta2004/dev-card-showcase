// app.js - Book Club Platform
// LocalStorage keys: username, clubs, meetings, discussions, progress
let username = localStorage.getItem('username') || '';
let clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
let meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
let discussions = JSON.parse(localStorage.getItem('discussions') || '{}');
let progressData = JSON.parse(localStorage.getItem('progressData') || '[]');

const usernameInput = document.getElementById('username');
const setUsernameBtn = document.getElementById('set-username');
const createClubForm = document.getElementById('create-club-form');
const clubNameInput = document.getElementById('club-name');
const clubList = document.getElementById('club-list');
const meetingForm = document.getElementById('meeting-form');
const meetingClubSelect = document.getElementById('meeting-club');
const meetingTimeInput = document.getElementById('meeting-time');
const meetingBookInput = document.getElementById('meeting-book');
const meetingList = document.getElementById('meeting-list');
const discussionClubSelect = document.getElementById('discussion-club');
const discussionWindow = document.getElementById('discussion-window');
const discussionForm = document.getElementById('discussion-form');
const discussionInput = document.getElementById('discussion-input');
const progressForm = document.getElementById('progress-form');
const progressClubSelect = document.getElementById('progress-club');
const progressBookInput = document.getElementById('progress-book');
const progressPagesInput = document.getElementById('progress-pages');
const progressList = document.getElementById('progress-list');

function saveState() {
    localStorage.setItem('username', username);
    localStorage.setItem('clubs', JSON.stringify(clubs));
    localStorage.setItem('meetings', JSON.stringify(meetings));
    localStorage.setItem('discussions', JSON.stringify(discussions));
    localStorage.setItem('progressData', JSON.stringify(progressData));
}

setUsernameBtn.onclick = () => {
    username = usernameInput.value.trim();
    saveState();
    renderDiscussionWindow();
    renderProgressList();
};

createClubForm.onsubmit = e => {
    e.preventDefault();
    const name = clubNameInput.value.trim();
    if (!name) return;
    if (!clubs.includes(name)) {
        clubs.push(name);
        saveState();
        renderClubs();
        renderClubSelects();
    }
    clubNameInput.value = '';
};

function renderClubs() {
    clubList.innerHTML = '';
    clubs.forEach(c => {
        const li = document.createElement('li');
        li.textContent = c;
        clubList.appendChild(li);
    });
}

function renderClubSelects() {
    [meetingClubSelect, discussionClubSelect, progressClubSelect].forEach(sel => {
        sel.innerHTML = '';
        clubs.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            sel.appendChild(opt);
        });
    });
}

meetingForm.onsubmit = e => {
    e.preventDefault();
    const club = meetingClubSelect.value;
    const time = meetingTimeInput.value;
    const book = meetingBookInput.value.trim();
    if (!club || !time || !book) return;
    meetings.push({ club, time, book });
    saveState();
    renderMeetings();
    meetingTimeInput.value = '';
    meetingBookInput.value = '';
};

function renderMeetings() {
    meetingList.innerHTML = '';
    meetings.forEach(m => {
        const li = document.createElement('li');
        li.textContent = `${m.club}: ${m.book} @ ${new Date(m.time).toLocaleString()}`;
        meetingList.appendChild(li);
    });
}

discussionClubSelect.onchange = renderDiscussionWindow;

discussionForm.onsubmit = e => {
    e.preventDefault();
    const club = discussionClubSelect.value;
    const text = discussionInput.value.trim();
    if (!club || !text || !username) return;
    if (!discussions[club]) discussions[club] = [];
    discussions[club].push({ user: username, text, time: Date.now() });
    saveState();
    renderDiscussionWindow();
    discussionInput.value = '';
};

function renderDiscussionWindow() {
    const club = discussionClubSelect.value;
    discussionWindow.innerHTML = '';
    if (!club || !discussions[club]) return;
    discussions[club].forEach(msg => {
        const div = document.createElement('div');
        div.className = 'msg ' + (msg.user === username ? 'me' : 'them');
        div.textContent = `${msg.user}: ${msg.text}`;
        discussionWindow.appendChild(div);
    });
    discussionWindow.scrollTop = discussionWindow.scrollHeight;
}

progressForm.onsubmit = e => {
    e.preventDefault();
    const club = progressClubSelect.value;
    const book = progressBookInput.value.trim();
    const pages = parseInt(progressPagesInput.value);
    if (!club || !book || !pages || !username) return;
    progressData.push({ user: username, club, book, pages, time: Date.now() });
    saveState();
    renderProgressList();
    progressBookInput.value = '';
    progressPagesInput.value = '';
};

function renderProgressList() {
    progressList.innerHTML = '';
    progressData.filter(p => p.user === username).forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p.club}: ${p.book} - ${p.pages} pages read`;
        progressList.appendChild(li);
    });
}

// Initial render
usernameInput.value = username;
renderClubs();
renderClubSelects();
renderMeetings();
renderDiscussionWindow();
renderProgressList();
