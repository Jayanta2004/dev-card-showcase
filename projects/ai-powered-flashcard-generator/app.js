
// AI-Powered Flashcard Generator - Advanced Version
// Features: PDF parsing stub, simulated AI, flashcard editing, deletion, export, user settings, and more.

const form = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const textInput = document.getElementById('text-input');
const flashcardsDiv = document.getElementById('flashcards');
const loadingDiv = document.getElementById('loading');

let flashcards = [];
let userSettings = {
    maxFlashcards: 20,
    aiLevel: 'standard',
    theme: 'light',
};

// --- UI Helpers ---
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

function clearFlashcards() {
    flashcardsDiv.innerHTML = '';
}

function renderFlashcards() {
    clearFlashcards();
    if (flashcards.length === 0) {
        flashcardsDiv.innerHTML = '<p>No flashcards generated. Try different content.</p>';
        return;
    }
    flashcards.forEach((card, idx) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'flashcard';
        cardDiv.innerHTML = `
            <div class="question" contenteditable="true" onblur="window.updateFlashcardQuestion(${idx}, this.innerText)">Q: ${card.question}</div>
            <div class="answer" contenteditable="true" onblur="window.updateFlashcardAnswer(${idx}, this.innerText)">A: ${card.answer}</div>
            <div class="actions">
                <button onclick="window.deleteFlashcard(${idx})">Delete</button>
                <button onclick="window.copyFlashcard(${idx})">Copy</button>
            </div>
        `;
        flashcardsDiv.appendChild(cardDiv);
    });
}

window.updateFlashcardQuestion = function(idx, text) {
    flashcards[idx].question = text.replace(/^Q:\s*/, '');
    saveFlashcardsToLocal();
};
window.updateFlashcardAnswer = function(idx, text) {
    flashcards[idx].answer = text.replace(/^A:\s*/, '');
    saveFlashcardsToLocal();
};
window.deleteFlashcard = function(idx) {
    flashcards.splice(idx, 1);
    saveFlashcardsToLocal();
    renderFlashcards();
};
window.copyFlashcard = function(idx) {
    const card = flashcards[idx];
    navigator.clipboard.writeText(`Q: ${card.question}\nA: ${card.answer}`);
    alert('Flashcard copied to clipboard!');
};

// --- Flashcard Storage ---
function saveFlashcardsToLocal() {
    localStorage.setItem('ai_flashcards', JSON.stringify(flashcards));
}
function loadFlashcardsFromLocal() {
    const data = localStorage.getItem('ai_flashcards');
    if (data) {
        flashcards = JSON.parse(data);
        renderFlashcards();
    }
}

// --- Export ---
function exportFlashcards(format = 'json') {
    let dataStr = '';
    if (format === 'json') {
        dataStr = JSON.stringify(flashcards, null, 2);
    } else if (format === 'csv') {
        dataStr = 'Question,Answer\n' + flashcards.map(f => `"${f.question.replace(/"/g, '""')}","${f.answer.replace(/"/g, '""')}"`).join('\n');
    }
    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- PDF Extraction (Stub) ---
async function extractTextFromPDF(file) {
    // In production, use pdf.js or similar to extract text from PDF
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // This will not extract real text from PDF, just demo
            resolve('PDF text extraction not implemented in demo.');
        };
        reader.readAsArrayBuffer(file);
    });
}

// --- Simulated AI Flashcard Generation ---
async function generateFlashcards(text) {
    // Simulate AI API call (replace with real API integration)
    // For demo, split text into sentences and create Q/A pairs
    const sentences = text.split(/[.!?]\s/).filter(s => s.length > 20);
    const cards = [];
    for (let i = 0; i < Math.min(sentences.length, userSettings.maxFlashcards); i++) {
        cards.push({
            question: `What is the main idea of: "${sentences[i].slice(0, 60)}..."?`,
            answer: sentences[i]
        });
    }
    // Add some simulated AI-generated definitions and questions
    if (cards.length < userSettings.maxFlashcards) {
        cards.push({
            question: 'Define artificial intelligence.',
            answer: 'Artificial intelligence is the simulation of human intelligence in machines.'
        });
        cards.push({
            question: 'What is a flashcard?',
            answer: 'A flashcard is a card bearing information on both sides, used for study.'
        });
    }
    return cards;
}

// --- Form Submission ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFlashcards();
    showLoading(true);

    let text = textInput.value.trim();
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.type === 'application/pdf') {
            text = await extractTextFromPDF(file);
        } else if (file.type === 'text/plain') {
            text = await file.text();
        }
    }
    if (!text) {
        showLoading(false);
        alert('Please provide some text or upload a file.');
        return;
    }
    flashcards = await generateFlashcards(text);
    saveFlashcardsToLocal();
    showLoading(false);
    renderFlashcards();
});

// --- User Settings UI (Stub) ---
function showSettings() {
    const settingsDiv = document.createElement('div');
    settingsDiv.className = 'settings-modal';
    settingsDiv.innerHTML = `
        <h2>Settings</h2>
        <label>Max Flashcards: <input type="number" id="max-flashcards" value="${userSettings.maxFlashcards}" min="1" max="100"></label><br>
        <label>AI Level:
            <select id="ai-level">
                <option value="standard" ${userSettings.aiLevel === 'standard' ? 'selected' : ''}>Standard</option>
                <option value="advanced" ${userSettings.aiLevel === 'advanced' ? 'selected' : ''}>Advanced</option>
            </select>
        </label><br>
        <label>Theme:
            <select id="theme">
                <option value="light" ${userSettings.theme === 'light' ? 'selected' : ''}>Light</option>
                <option value="dark" ${userSettings.theme === 'dark' ? 'selected' : ''}>Dark</option>
            </select>
        </label><br>
        <button id="save-settings">Save</button>
        <button id="close-settings">Close</button>
    `;
    document.body.appendChild(settingsDiv);
    document.getElementById('save-settings').onclick = () => {
        userSettings.maxFlashcards = parseInt(document.getElementById('max-flashcards').value, 10);
        userSettings.aiLevel = document.getElementById('ai-level').value;
        userSettings.theme = document.getElementById('theme').value;
        localStorage.setItem('ai_flashcard_settings', JSON.stringify(userSettings));
        document.body.removeChild(settingsDiv);
        renderFlashcards();
    };
    document.getElementById('close-settings').onclick = () => {
        document.body.removeChild(settingsDiv);
    };
}

// --- Theme Handling ---
function applyTheme() {
    if (userSettings.theme === 'dark') {
        document.body.style.background = '#23272f';
        document.body.style.color = '#f4f6fb';
    } else {
        document.body.style.background = '#f4f6fb';
        document.body.style.color = '#23272f';
    }
}

// --- Initialization ---
function loadSettings() {
    const data = localStorage.getItem('ai_flashcard_settings');
    if (data) {
        userSettings = JSON.parse(data);
    }
    applyTheme();
}

window.onload = function() {
    loadSettings();
    loadFlashcardsFromLocal();
    // Add export and settings buttons
    const controls = document.createElement('div');
    controls.style.textAlign = 'center';
    controls.style.margin = '20px 0';
    controls.innerHTML = `
        <button onclick="window.exportFlashcards('json')">Export JSON</button>
        <button onclick="window.exportFlashcards('csv')">Export CSV</button>
        <button onclick="window.showSettings()">Settings</button>
        <button onclick="window.clearAllFlashcards()">Clear All</button>
    `;
    document.querySelector('.container').insertBefore(controls, flashcardsDiv);
};

window.exportFlashcards = exportFlashcards;
window.showSettings = showSettings;
window.clearAllFlashcards = function() {
    if (confirm('Are you sure you want to delete all flashcards?')) {
        flashcards = [];
        saveFlashcardsToLocal();
        renderFlashcards();
    }
};

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'e') {
        exportFlashcards('json');
    }
    if (e.ctrlKey && e.key === 's') {
        showSettings();
    }
});

// --- Drag & Drop Support ---
flashcardsDiv.addEventListener('dragover', (e) => {
    e.preventDefault();
    flashcardsDiv.style.background = '#e0e7ff';
});
flashcardsDiv.addEventListener('dragleave', (e) => {
    flashcardsDiv.style.background = '';
});
flashcardsDiv.addEventListener('drop', async (e) => {
    e.preventDefault();
    flashcardsDiv.style.background = '';
    if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        let text = '';
        if (file.type === 'application/pdf') {
            text = await extractTextFromPDF(file);
        } else if (file.type === 'text/plain') {
            text = await file.text();
        }
        if (text) {
            flashcards = await generateFlashcards(text);
            saveFlashcardsToLocal();
            renderFlashcards();
        }
    }
});

// --- Simulated AI API Integration (Stub) ---
async function callAIAPI(text, options = {}) {
    // In production, call OpenAI or similar API
    // This is a stub for demonstration
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                flashcards: [
                    { question: 'What is AI?', answer: 'AI stands for Artificial Intelligence.' },
                    { question: 'What is a flashcard?', answer: 'A flashcard is a study aid.' }
                ]
            });
        }, 1000);
    });
}

// --- End of Advanced App ---
