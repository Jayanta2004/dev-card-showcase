// Ambient sound files (replace with your own or royalty-free sources)
const sounds = {
    rain: new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa7b7b.mp3'),
    forest: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_10b7e6c7c7.mp3'),
    cafe: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_10b7e6c7c7.mp3')
};

Object.values(sounds).forEach(sound => {
    sound.loop = true;
    sound.volume = 0.5;
});

// Sound controls
const rainBtn = document.getElementById('rain-btn');
const rainSlider = document.getElementById('rain-slider');
const forestBtn = document.getElementById('forest-btn');
const forestSlider = document.getElementById('forest-slider');
const cafeBtn = document.getElementById('cafe-btn');
cafeSlider = document.getElementById('cafe-slider');
cafeBtn = document.getElementById('cafe-btn');

function toggleSound(sound, btn) {
    if (sound.paused) {
        sound.play();
        btn.textContent = 'Pause';
    } else {
        sound.pause();
        btn.textContent = 'Play';
    }
}

rainBtn.onclick = () => toggleSound(sounds.rain, rainBtn);
forestBtn.onclick = () => toggleSound(sounds.forest, forestBtn);
cafeBtn.onclick = () => toggleSound(sounds.cafe, cafeBtn);

rainSlider.oninput = () => sounds.rain.volume = rainSlider.value;
forestSlider.oninput = () => sounds.forest.volume = forestSlider.value;
cafeSlider.oninput = () => sounds.cafe.volume = cafeSlider.value;

// Image upload
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
let uploadedImage = null;

imageInput.onchange = function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage = e.target.result;
            imagePreview.innerHTML = `<img src="${uploadedImage}" alt="Moodboard Image">`;
        };
        reader.readAsDataURL(file);
    }
};

// Moodboard gallery
const gallery = document.getElementById('gallery');
const saveBtn = document.getElementById('save-btn');
const shareBtn = document.getElementById('share-btn');
let moodboards = [];

saveBtn.onclick = function() {
    if (!uploadedImage) {
        alert('Please upload an image first!');
        return;
    }
    const moodboard = {
        image: uploadedImage,
        sounds: {
            rain: sounds.rain.volume,
            forest: sounds.forest.volume,
            cafe: sounds.cafe.volume
        }
    };
    moodboards.push(moodboard);
    renderGallery();
};

function renderGallery() {
    gallery.innerHTML = '';
    moodboards.forEach((mb, idx) => {
        const div = document.createElement('div');
        div.className = 'moodboard';
        div.innerHTML = `<img src="${mb.image}" alt="Moodboard"><br>
            <small>Rain: ${Math.round(mb.sounds.rain*100)}% | Forest: ${Math.round(mb.sounds.forest*100)}% | Café: ${Math.round(mb.sounds.cafe*100)}%</small>`;
        gallery.appendChild(div);
    });
}

shareBtn.onclick = function() {
    if (moodboards.length === 0) {
        alert('No moodboard to share!');
        return;
    }
    const last = moodboards[moodboards.length-1];
    // Share logic: download image or copy config
    const link = document.createElement('a');
    link.href = last.image;
    link.download = 'moodboard.png';
    link.click();
    alert('Moodboard image downloaded!');
};