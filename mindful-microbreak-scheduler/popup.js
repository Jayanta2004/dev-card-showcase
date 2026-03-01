// Popup logic for Mindful Microbreak Scheduler

const suggestions = {
  energized: [
    'Try a 1-minute breathing exercise.',
    'Do 10 quick stretches.',
    'Play a 1-minute focus game.'
  ],
  neutral: [
    'Stand up and stretch your arms.',
    'Look away from the screen for 30 seconds.',
    'Take 5 deep breaths.'
  ],
  tired: [
    'Walk around for 2 minutes.',
    'Splash water on your face.',
    'Try a quick energizing stretch.'
  ],
  stressed: [
    'Close your eyes and breathe deeply for 1 minute.',
    'Try a guided relaxation exercise.',
    'Play a calming mini-game.'
  ]
};

const suggestionDiv = document.getElementById('suggestion');
const moodSelect = document.getElementById('mood');
const newBtn = document.getElementById('new-suggestion');

function showSuggestion() {
  const mood = moodSelect.value;
  const options = suggestions[mood];
  const suggestion = options[Math.floor(Math.random() * options.length)];
  suggestionDiv.textContent = suggestion;
}

moodSelect.addEventListener('change', showSuggestion);
newBtn.addEventListener('click', showSuggestion);

document.addEventListener('DOMContentLoaded', showSuggestion);
