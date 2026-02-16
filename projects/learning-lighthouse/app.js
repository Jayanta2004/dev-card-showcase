// Learning Lighthouse
// Features: Add lessons/skills, mark as completed, lighthouse brightens, ships added to harbor, modals, localStorage, modern UI

let lessons = JSON.parse(localStorage.getItem('llLessons') || 'null') || [
    { title: 'HTML Basics', desc: 'Learned HTML tags and structure.', completed: true, date: '2026-02-10' },
    { title: 'CSS Styling', desc: 'Mastered selectors and layouts.', completed: true, date: '2026-02-12' },
    { title: 'JavaScript Intro', desc: 'Variables, functions, and events.', completed: false, date: '' }
];
const lighthouseStages = [
    { min: 0, emoji: '🗼', label: 'Dim Lighthouse', glow: '0 0 0px #fbbf24' },
    { min: 1, emoji: '🗼', label: 'Faint Glow', glow: '0 0 8px #fde68a' },
    { min: 3, emoji: '🗼', label: 'Bright', glow: '0 0 24px #fbbf24' },
    { min: 5, emoji: '🗼', label: 'Radiant', glow: '0 0 48px #fbbf24' },
    { min: 10, emoji: '🗼', label: 'Beacon', glow: '0 0 80px #fbbf24' }
];
const shipEmojis = ['⛵', '🚤', '🛥️', '🚢', '🛳️'];

// --- DOM ELEMENTS ---
const addLessonBtn = document.getElementById('addLessonBtn');
const myLessonsBtn = document.getElementById('myLessonsBtn');
const lighthouseBtn = document.getElementById('lighthouseBtn');
const aboutBtn = document.getElementById('aboutBtn');
const lessonSection = document.getElementById('lessonSection');
const lighthouseSection = document.getElementById('lighthouseSection');
const aboutSection = document.getElementById('aboutSection');
const lessonList = document.getElementById('lessonList');
const lighthouseView = document.getElementById('lighthouseView');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
addLessonBtn.onclick = () => showAddLessonModal();
myLessonsBtn.onclick = () => showSection('lessons');
lighthouseBtn.onclick = () => showSection('lighthouse');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    lessonSection.classList.add('hidden');
    lighthouseSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'lessons') lessonSection.classList.remove('hidden');
    if (section === 'lighthouse') lighthouseSection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
    if (section === 'lessons') renderLessonList();
    if (section === 'lighthouse') renderLighthouse();
}

// --- LESSON LIST ---
function renderLessonList() {
    lessonList.innerHTML = '';
    if (lessons.length === 0) {
        lessonList.innerHTML = '<p>No lessons yet. Add your first one!</p>';
        return;
    }
    lessons.forEach((lesson, idx) => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.innerHTML = `
            <span class="lesson-title">${lesson.title}</span>
            <span class="lesson-meta">${lesson.desc}</span>
            <span class="lesson-meta">${lesson.completed ? 'Completed' : 'In Progress'}${lesson.completed && lesson.date ? ' (' + lesson.date + ')' : ''}</span>
            <div class="lesson-actions">
                <button onclick="editLesson(${idx})">Edit</button>
                <button onclick="deleteLesson(${idx})">Delete</button>
                <button onclick="toggleComplete(${idx})">${lesson.completed ? 'Mark Incomplete' : 'Mark Complete'}</button>
            </div>
        `;
        lessonList.appendChild(card);
    });
}
window.editLesson = function(idx) {
    showAddLessonModal(lessons[idx], idx);
};
window.deleteLesson = function(idx) {
    if (confirm('Delete this lesson?')) {
        lessons.splice(idx, 1);
        localStorage.setItem('llLessons', JSON.stringify(lessons));
        renderLessonList();
        renderLighthouse();
        hideModal();
    }
};
window.toggleComplete = function(idx) {
    lessons[idx].completed = !lessons[idx].completed;
    lessons[idx].date = lessons[idx].completed ? new Date().toISOString().slice(0, 10) : '';
    localStorage.setItem('llLessons', JSON.stringify(lessons));
    renderLessonList();
    renderLighthouse();
};

// --- ADD/EDIT LESSON MODAL ---
function showAddLessonModal(lesson = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${lesson ? 'Edit' : 'Add'} Lesson</h2>
        <input id="lessonTitle" placeholder="Lesson Title" value="${lesson ? lesson.title : ''}" style="width:100%;margin-bottom:8px;">
        <textarea id="lessonDesc" placeholder="Description" style="width:100%;margin-bottom:8px;">${lesson ? lesson.desc : ''}</textarea>
        <label><input type="checkbox" id="lessonCompleted" ${lesson && lesson.completed ? 'checked' : ''}> Completed</label><br><br>
        <button onclick="submitLesson(${idx !== null ? idx : ''})">${lesson ? 'Save' : 'Add'} Lesson</button>
    `;
    showModal();
}
window.submitLesson = function(idx) {
    const title = document.getElementById('lessonTitle').value.trim();
    const desc = document.getElementById('lessonDesc').value.trim();
    const completed = document.getElementById('lessonCompleted').checked;
    const date = completed ? new Date().toISOString().slice(0, 10) : '';
    if (!title) {
        alert('Please enter a lesson title.');
        return;
    }
    const lesson = { title, desc, completed, date };
    if (idx !== undefined && idx !== null && lessons[idx]) {
        lessons[idx] = lesson;
    } else {
        lessons.push(lesson);
    }
    localStorage.setItem('llLessons', JSON.stringify(lessons));
    renderLessonList();
    renderLighthouse();
    hideModal();
};

// --- LIGHTHOUSE & HARBOR ---
function renderLighthouse() {
    lighthouseView.innerHTML = '';
    const completedCount = lessons.filter(l => l.completed).length;
    // Lighthouse stage
    let stage = lighthouseStages[0];
    for (let i = lighthouseStages.length - 1; i >= 0; i--) {
        if (completedCount >= lighthouseStages[i].min) {
            stage = lighthouseStages[i];
            break;
        }
    }
    const lighthouseDiv = document.createElement('div');
    lighthouseDiv.className = 'lighthouse-emoji';
    lighthouseDiv.style.filter = `drop-shadow(${stage.glow})`;
    lighthouseDiv.innerHTML = stage.emoji;
    lighthouseView.appendChild(lighthouseDiv);
    const labelDiv = document.createElement('div');
    labelDiv.className = 'lighthouse-label';
    labelDiv.innerHTML = `${stage.label} (${completedCount} completed)`;
    lighthouseView.appendChild(labelDiv);
    // Harbor (ships)
    const harborDiv = document.createElement('div');
    harborDiv.className = 'harbor';
    for (let i = 0; i < completedCount; i++) {
        const shipDiv = document.createElement('div');
        shipDiv.className = 'ship';
        shipDiv.innerHTML = `<div class="ship-emoji">${shipEmojis[i % shipEmojis.length]}</div><div class="ship-label">${lessons.filter(l => l.completed)[i].title}</div>`;
        harborDiv.appendChild(shipDiv);
    }
    lighthouseView.appendChild(harborDiv);
}

// --- MODAL LOGIC ---
function showModal() {
    modal.classList.remove('hidden');
}
function hideModal() {
    modal.classList.add('hidden');
    modalBody.innerHTML = '';
}

// --- INIT ---
function init() {
    renderLessonList();
    renderLighthouse();
    showSection('lessons');
}
init();
