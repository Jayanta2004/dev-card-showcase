const moodPlaylists = {
    happy: [
        { title: "Happy - Pharrell Williams", url: "https://www.youtube.com/watch?v=ZbZSe6N_BXs" },
        { title: "Can't Stop The Feeling! - Justin Timberlake", url: "https://www.youtube.com/watch?v=ru0K8uYEZWw" },
        { title: "Good Life - OneRepublic", url: "https://www.youtube.com/watch?v=jZhQOvvV45w" }
    ],
    sad: [
        { title: "Someone Like You - Adele", url: "https://www.youtube.com/watch?v=hLQl3WQQoQ0" },
        { title: "Let Her Go - Passenger", url: "https://www.youtube.com/watch?v=RBumgq5yVrA" },
        { title: "Fix You - Coldplay", url: "https://www.youtube.com/watch?v=k4V3Mo61fJM" }
    ],
    energetic: [
        { title: "Stronger - Kanye West", url: "https://www.youtube.com/watch?v=PsO6ZnUZI0g" },
        { title: "Titanium - David Guetta ft. Sia", url: "https://www.youtube.com/watch?v=JRfuAukYTKg" },
        { title: "Don't Start Now - Dua Lipa", url: "https://www.youtube.com/watch?v=oygrmJFKYZY" }
    ],
    relaxed: [
        { title: "Weightless - Marconi Union", url: "https://www.youtube.com/watch?v=UfcAVejslrU" },
        { title: "Sunset Lover - Petit Biscuit", url: "https://www.youtube.com/watch?v=4DLoL4fH1O4" },
        { title: "Bloom - ODESZA", url: "https://www.youtube.com/watch?v=G5rULR53uMk" }
    ],
    angry: [
        { title: "Numb - Linkin Park", url: "https://www.youtube.com/watch?v=kXYiU_JCYtU" },
        { title: "Stronger - Britney Spears", url: "https://www.youtube.com/watch?v=AJWtLf4-WWs" },
        { title: "Break Stuff - Limp Bizkit", url: "https://www.youtube.com/watch?v=ZpUYjpKg9KY" }
    ],
    romantic: [
        { title: "All of Me - John Legend", url: "https://www.youtube.com/watch?v=450p7goxZqg" },
        { title: "Perfect - Ed Sheeran", url: "https://www.youtube.com/watch?v=2Vv-BfVoq4g" },
        { title: "Just the Way You Are - Bruno Mars", url: "https://www.youtube.com/watch?v=LjhCEhWiKXk" }
    ]
};

function getPlaylistForMood(mood) {
    mood = mood.toLowerCase();
    if (moodPlaylists[mood]) {
        return moodPlaylists[mood];
    }
    // Fallback: pick a random mood
    const moods = Object.keys(moodPlaylists);
    return moodPlaylists[moods[Math.floor(Math.random() * moods.length)]];
}

function renderPlaylist(playlist) {
    const list = document.getElementById('playlist');
    list.innerHTML = '';
    playlist.forEach(song => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${song.url}" target="_blank">${song.title}</a>`;
        list.appendChild(li);
    });
}

document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('mood-input').value = btn.dataset.mood;
    });
});

document.getElementById('generate').addEventListener('click', function() {
    const mood = document.getElementById('mood-input').value.trim();
    if (!mood) {
        alert('Please select or enter a mood!');
        return;
    }
    const playlist = getPlaylistForMood(mood);
    renderPlaylist(playlist);
});
