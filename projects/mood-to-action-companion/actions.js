// Smart micro-action suggestions
const actionSuggest = document.getElementById('actionSuggest');

const actions = {
    Happy: ['Share your joy with a friend', 'Write down what made you happy'],
    Sad: ['Listen to uplifting music', 'Write a gratitude list'],
    Stressed: ['Take 5 deep breaths', 'Go for a short walk'],
    Calm: ['Enjoy the moment', 'Practice mindfulness'],
    Angry: ['Pause and count to 10', 'Write your feelings down'],
    Motivated: ['Set a small goal', 'Celebrate your progress'],
    Other: ['Try a new activity', 'Reflect on your feelings']
};

function suggestAction() {
    let moods = JSON.parse(localStorage.getItem('moodLog') || '[]');
    if (moods.length === 0) {
        actionSuggest.innerHTML = '<p>Log your mood to get suggestions.</p>';
        return;
    }
    const lastMood = moods[moods.length - 1].mood;
    const suggestions = actions[lastMood] || actions['Other'];
    actionSuggest.innerHTML = '<h3>Suggested Actions</h3><ul>' + suggestions.map(a => `<li>${a}</li>`).join('') + '</ul>';
}

window.onload = suggestAction;