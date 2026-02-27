// AI-Powered Flashcard Generator - app.js
// Simulates AI flashcard generation from notes or file

const inputForm = document.getElementById('input-form');
const notesInput = document.getElementById('notes-input');
const fileInput = document.getElementById('file-input');
const flashcardsSection = document.getElementById('flashcards-section');
const flashcardsList = document.getElementById('flashcards-list');
const restartBtn = document.getElementById('restart-btn');

function simulateAIFlashcardGeneration(text) {
  // Simulate AI by splitting text into sentences and making Q&A pairs
  const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(Boolean);
  const flashcards = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const question = sentences[i];
    const answer = sentences[i + 1] || '...';
    flashcards.push({ question: `Q: ${question}?`, answer: `A: ${answer}` });
  }
  // Add some sample flashcards
  if (flashcards.length < 3) {
    flashcards.push({ question: 'Q: What is the capital of France?', answer: 'A: Paris.' });
    flashcards.push({ question: 'Q: Who wrote Hamlet?', answer: 'A: William Shakespeare.' });
  }
  return flashcards;
}

inputForm.addEventListener('submit', e => {
  e.preventDefault();
  let text = notesInput.value.trim();
  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      text = ev.target.result;
      showFlashcards(simulateAIFlashcardGeneration(text));
    };
    reader.readAsText(fileInput.files[0]);
  } else if (text) {
    showFlashcards(simulateAIFlashcardGeneration(text));
  }
});

function showFlashcards(flashcards) {
  flashcardsList.innerHTML = '';
  flashcards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'flashcard';
    div.innerHTML = `<div class="question">${card.question}</div><div class="answer">${card.answer}</div>`;
    div.addEventListener('click', () => {
      div.classList.toggle('show-answer');
    });
    flashcardsList.appendChild(div);
  });
  flashcardsSection.classList.remove('hidden');
  inputForm.classList.add('hidden');
}

restartBtn.addEventListener('click', () => {
  flashcardsSection.classList.add('hidden');
  inputForm.classList.remove('hidden');
  notesInput.value = '';
  fileInput.value = '';
});
