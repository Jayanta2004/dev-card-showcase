// app.js - Language Learning Buddy
// LocalStorage keys: progress
let progress = JSON.parse(localStorage.getItem('progress') || '{}');

const languageSelect = document.getElementById('language-select');
const practiceAreaSelect = document.getElementById('practice-area');
const startBtn = document.getElementById('start-btn');
const quizSection = document.getElementById('quiz-section');
const chatSection = document.getElementById('chat-section');
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const progressDiv = document.getElementById('progress');

let currentLanguage = 'spanish';
let currentArea = 'vocabulary';
let quizIndex = 0;
let quizData = [];

function saveProgress() {
    localStorage.setItem('progress', JSON.stringify(progress));
}

startBtn.onclick = async () => {
    currentLanguage = languageSelect.value;
    currentArea = practiceAreaSelect.value;
    quizIndex = 0;
    quizData = [];
    quizSection.style.display = '';
    chatSection.style.display = (currentArea === 'conversation') ? '' : 'none';
    quizSection.innerHTML = '<p>Loading...</p>';
    if (currentArea === 'conversation') {
        chatWindow.innerHTML = '';
    } else {
        quizData = await generateQuiz(currentLanguage, currentArea);
        renderQuiz();
    }
};

// Generate quiz using OpenAI API
async function generateQuiz(language, area) {
    // Replace with your OpenAI API key
    const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
    const prompt = `Generate a ${area} quiz for a beginner learning ${language}. Provide 5 questions as a JSON array. Each question should have: question, options (array), answer.`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful language tutor.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 512,
            temperature: 0.4
        })
    });
    if (!response.ok) throw new Error('OpenAI API error');
    const data = await response.json();
    let quiz = [];
    try {
        const text = data.choices[0].message.content;
        quiz = JSON.parse(text.match(/\[.*\]/s)[0]);
    } catch (e) {
        quiz = [];
    }
    return quiz;
}

function renderQuiz() {
    if (!quizData.length) {
        quizSection.innerHTML = '<p>Failed to load quiz.</p>';
        return;
    }
    if (quizIndex >= quizData.length) {
        quizSection.innerHTML = '<p>Quiz complete!</p>';
        updateProgress(currentLanguage, currentArea, quizData.length);
        renderProgress();
        return;
    }
    const q = quizData[quizIndex];
    quizSection.innerHTML = `<div><b>Q${quizIndex+1}:</b> ${q.question}</div>`;
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(opt, q.answer);
        quizSection.appendChild(btn);
    });
}

function checkAnswer(selected, correct) {
    if (selected === correct) {
        quizSection.innerHTML += '<div style="color:green;">Correct!</div>';
        updateProgress(currentLanguage, currentArea, 1);
    } else {
        quizSection.innerHTML += `<div style="color:red;">Incorrect. Correct answer: ${correct}</div>`;
    }
    setTimeout(() => {
        quizIndex++;
        renderQuiz();
    }, 1200);
}

function updateProgress(language, area, inc) {
    if (!progress[language]) progress[language] = {};
    if (!progress[language][area]) progress[language][area] = 0;
    progress[language][area] += inc;
    saveProgress();
}

function renderProgress() {
    let html = '';
    Object.keys(progress).forEach(lang => {
        html += `<b>${lang}:</b> `;
        Object.keys(progress[lang]).forEach(area => {
            html += `${area}: ${progress[lang][area]} | `;
        });
        html += '<br>';
    });
    progressDiv.innerHTML = html || '<p>No progress yet.</p>';
}

// AI Conversation Practice
chatForm.onsubmit = async (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;
    addChatMsg('me', msg);
    chatInput.value = '';
    const aiReply = await getAIReply(currentLanguage, msg);
    addChatMsg('ai', aiReply);
};

function addChatMsg(who, text) {
    const div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = (who === 'me' ? 'You: ' : 'AI: ') + text;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function getAIReply(language, msg) {
    // Replace with your OpenAI API key
    const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
    const prompt = `You are a friendly conversation partner for practicing ${language}. Respond to the user's message in a helpful and encouraging way.`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: msg }
            ],
            max_tokens: 100,
            temperature: 0.7
        })
    });
    if (!response.ok) return 'Sorry, I could not reply.';
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// Initial render
renderProgress();
