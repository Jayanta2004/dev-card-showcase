// Synesthetic Experience Composer Logic
// Users blend colors, sounds, and scents to create multisensory digital art

const canvas = document.getElementById('art-canvas');
const addBtn = document.getElementById('add-experience');
const colorPicker = document.getElementById('color-picker');
const soundPicker = document.getElementById('sound-picker');
const scentPicker = document.getElementById('scent-picker');

const soundMap = {
    chime: 'audio-chime',
    drum: 'audio-drum',
    flute: 'audio-flute',
    rain: 'audio-rain',
    birds: 'audio-birds'
};

let experiences = [];

function renderCanvas() {
    canvas.innerHTML = '';
    experiences.forEach((exp, idx) => {
        const block = document.createElement('div');
        block.className = 'experience-block';
        block.style.background = exp.color;
        block.innerHTML = `
            <div class="sound-label">${exp.sound}</div>
            <div class="scent-label">${exp.scent}</div>
        `;
        block.onclick = () => {
            const audio = document.getElementById(soundMap[exp.sound]);
            if (audio) {
                audio.currentTime = 0;
                audio.play();
            }
        };
        canvas.appendChild(block);
    });
}

addBtn.onclick = () => {
    const color = colorPicker.value;
    const sound = soundPicker.value;
    const scent = scentPicker.value;
    experiences.push({ color, sound, scent });
    renderCanvas();
};

renderCanvas();
