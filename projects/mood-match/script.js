const moodData = {
    happy: {
        title: "Feeling Happy 😊",
        message: "That glow suits you. Ride the wave and enjoy the moment.",
        suggestion: "Do something creative — music, writing, or sharing your energy with someone.",
        class: "happy"
    },
    calm: {
        title: "Feeling Calm 😌",
        message: "Peace looks good on you. No rush, no noise.",
        suggestion: "Enjoy a slow activity — reading, walking, or mindful breathing.",
        class: "calm"
    },
    sad: {
        title: "Feeling Low 😔",
        message: "It’s okay to feel this way. You don’t have to fix it right now.",
        suggestion: "Be gentle with yourself — rest, journal, or talk to someone you trust.",
        class: "sad"
    },
    stressed: {
        title: "Feeling Stressed 😣",
        message: "You’re carrying a lot — pause, you deserve a moment.",
        suggestion: "Try a short break, deep breathing, or step away from screens for 10 minutes.",
        class: "stressed"
    },
    motivated: {
        title: "Feeling Motivated 🔥",
        message: "This is powerful energy — channel it wisely.",
        suggestion: "Pick one meaningful task and go all in for 25 minutes.",
        class: "motivated"
    }
};

function setMood(mood) {
    const result = document.getElementById("result");
    const title = document.getElementById("moodTitle");
    const message = document.getElementById("moodMessage");
    const suggestion = document.getElementById("moodSuggestion");

    const data = moodData[mood];

    title.textContent = data.title;
    message.textContent = data.message;
    suggestion.textContent = data.suggestion;

    result.className = `result ${data.class}`;
    result.style.display = "block";
}
