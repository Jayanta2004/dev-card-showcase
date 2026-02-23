// app.js
// Main logic for AI-Powered Flashcard Generator

// PDF.js CDN for PDF parsing
const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.js';

// Dynamically load PDF.js
function loadPDFJS() {
    return new Promise((resolve, reject) => {
        if (window.pdfjsLib) return resolve();
        const script = document.createElement('script');
        script.src = PDFJS_URL;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Extract text from PDF file
async function extractTextFromPDF(file) {
    await loadPDFJS();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
}

// Handle form submission
const form = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const textInput = document.getElementById('text-input');
const loadingDiv = document.getElementById('loading');
const flashcardsDiv = document.getElementById('flashcards');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    flashcardsDiv.innerHTML = '';
    loadingDiv.style.display = 'block';
    let inputText = '';
    const file = fileInput.files[0];
    if (file) {
        if (file.type === 'application/pdf') {
            try {
                inputText = await extractTextFromPDF(file);
            } catch (err) {
                alert('Failed to extract PDF text.');
                loadingDiv.style.display = 'none';
                return;
            }
        } else if (file.type === 'text/plain') {
            inputText = await file.text();
        } else {
            alert('Unsupported file type. Please upload PDF or TXT.');
            loadingDiv.style.display = 'none';
            return;
        }
    } else {
        inputText = textInput.value.trim();
    }
    if (!inputText) {
        alert('Please upload a file or paste some text.');
        loadingDiv.style.display = 'none';
        return;
    }
    // Call AI API to generate flashcards
    try {
        const flashcards = await generateFlashcardsAI(inputText);
        renderFlashcards(flashcards);
    } catch (err) {
        alert('Failed to generate flashcards.');
    }
    loadingDiv.style.display = 'none';
});

// Call OpenAI API to generate flashcards
async function generateFlashcardsAI(text) {
    // Replace with your OpenAI API key
    const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
    const prompt = `Extract key concepts, definitions, and questions from the following study material. Format as JSON array of objects with 'question' and 'answer' fields.\n\n${text}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that generates study flashcards.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1024,
            temperature: 0.4
        })
    });
    if (!response.ok) throw new Error('OpenAI API error');
    const data = await response.json();
    // Try to parse JSON from the AI's response
    let flashcards = [];
    try {
        const text = data.choices[0].message.content;
        flashcards = JSON.parse(text.match(/\[.*\]/s)[0]);
    } catch (e) {
        throw new Error('Failed to parse flashcards');
    }
    return flashcards;
}

// Render flashcards
function renderFlashcards(flashcards) {
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
        flashcardsDiv.innerHTML = '<p>No flashcards generated.</p>';
        return;
    }
    flashcardsDiv.innerHTML = '';
    flashcards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'flashcard';
        cardDiv.innerHTML = `
            <div class="question">Q: ${card.question}</div>
            <div class="answer">A: ${card.answer}</div>
        `;
        flashcardsDiv.appendChild(cardDiv);
    });
}
