// AI-Powered Music Mood Match
const form = document.getElementById('journal-form');
const entryInput = document.getElementById('journal-entry');
const moodResult = document.getElementById('mood');
const playlistList = document.getElementById('playlist');

const moodKeywords = {
    happy: ['happy', 'joy', 'excited', 'grateful', 'cheerful', 'delighted'],
    sad: ['sad', 'down', 'unhappy', 'blue', 'depressed', 'melancholy'],
    energetic: ['energetic', 'active', 'motivated', 'pumped', 'enthusiastic'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'chill'],
    angry: ['angry', 'mad', 'frustrated', 'irritated', 'annoyed'],
    anxious: ['anxious', 'nervous', 'worried', 'tense', 'stressed']
};

const playlists = {
    happy: ['Feel Good Hits', 'Sunny Vibes', 'Happy Pop'],
    sad: ['Sad Songs', 'Heartbreak Ballads', 'Melancholy Mix'],
    energetic: ['Workout Boost', 'Dance Party', 'Power Up'],
    calm: ['Chill Out', 'Peaceful Piano', 'Relax & Unwind'],
    angry: ['Rock Rage', 'Anger Release', 'Heavy Beats'],
    anxious: ['Soothing Sounds', 'Stress Relief', 'Mindful Meditation']
};

function analyzeMood(text) {
    text = text.toLowerCase();
    for (const mood in moodKeywords) {
        if (moodKeywords[mood].some(word => text.includes(word))) {
            return mood;
        }
    }
    return 'neutral';
}

function suggestPlaylist(mood) {
    if (playlists[mood]) {
        return playlists[mood];
    }
    return ['Mixed Mood Playlist', 'Eclectic Mix', 'Top Hits'];
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const text = entryInput.value.trim();
    if (text) {
        const mood = analyzeMood(text);
        moodResult.textContent = mood.charAt(0).toUpperCase() + mood.slice(1);
        const suggestions = suggestPlaylist(mood);
        playlistList.innerHTML = '';
        suggestions.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            playlistList.appendChild(li);
        });
    }
});