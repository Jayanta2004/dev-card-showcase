// Gratitude Wall
const gratitudeForm = document.getElementById('gratitude-form');
const gratitudeInput = document.getElementById('gratitude-input');
const wall = document.getElementById('wall');

let notes = JSON.parse(localStorage.getItem('gratitudeNotes') || '[]');

function renderWall() {
    wall.innerHTML = '';
    notes.slice().reverse().forEach(note => {
        const div = document.createElement('div');
        div.className = 'gratitude-note';
        div.textContent = note.text;
        wall.appendChild(div);
    });
}

gratitudeForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = gratitudeInput.value.trim();
    if (text) {
        notes.push({ text });
        localStorage.setItem('gratitudeNotes', JSON.stringify(notes));
        gratitudeInput.value = '';
        renderWall();
    }
});

renderWall();
