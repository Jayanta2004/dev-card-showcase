// Empathy Chatbot
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatLog = document.getElementById('chat-log');

const responses = [
    "I'm here for you. Want to talk more about it?",
    "That sounds tough. Remember, it's okay to feel this way.",
    "You're stronger than you think. Take it one step at a time.",
    "Thank you for sharing your feelings. I'm listening.",
    "If you need encouragement, I'm always here!",
    "It's okay to have ups and downs. You're not alone.",
    "Would you like to share more? Sometimes talking helps.",
    "You matter, and your feelings are valid.",
    "I'm proud of you for reaching out.",
    "Remember to be kind to yourself today."
];

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + sender;
    msgDiv.textContent = text;
    chatLog.appendChild(msgDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function getEmpatheticResponse(userMsg) {
    // Simple keyword-based empathy (expandable)
    const sadWords = ["sad", "upset", "depressed", "unhappy", "down", "bad", "tired", "anxious", "angry", "alone"];
    const encouragement = [
        "You're doing your best, and that's enough.",
        "Every day is a new chance. Keep going!",
        "You have overcome so much already.",
        "Take a deep breath. You can get through this.",
        "Small steps are still progress."
    ];
    const msg = userMsg.toLowerCase();
    if (sadWords.some(word => msg.includes(word))) {
        return encouragement[Math.floor(Math.random() * encouragement.length)];
    }
    return responses[Math.floor(Math.random() * responses.length)];
}

chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const userMsg = userInput.value.trim();
    if (userMsg) {
        addMessage(userMsg, 'user');
        setTimeout(() => {
            const botMsg = getEmpatheticResponse(userMsg);
            addMessage(botMsg, 'bot');
        }, 600);
        userInput.value = '';
    }
});
