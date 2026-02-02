// AI-Based Code Review Assistant - script.js
// Core: code analysis (mock AI), PR analysis (mock), feedback display

const codeForm = document.getElementById('code-form');
const codeInput = document.getElementById('code-input');
const languageSelect = document.getElementById('language');
const reviewFeedback = document.getElementById('review-feedback');
const prLink = document.getElementById('pr-link');
const analyzePrBtn = document.getElementById('analyze-pr');
const prFeedback = document.getElementById('pr-feedback');

// Mock AI code review
function aiReview(code, lang) {
    // In real app, call AI API here
    if (!code.trim()) return 'No code provided.';
    let feedback = `Analyzing ${lang} code...\n`;
    if (code.includes('var ')) feedback += 'Consider using let/const instead of var for better scoping.\n';
    if (code.includes('==')) feedback += 'Use strict equality (===) for comparisons.\n';
    if (code.length < 30) feedback += 'Code is very short. Add more context for better review.\n';
    feedback += 'No critical bugs detected.\n';
    feedback += 'Suggestions: Add comments, improve variable names, and follow best practices.';
    return feedback;
}

codeForm.onsubmit = e => {
    e.preventDefault();
    const code = codeInput.value;
    const lang = languageSelect.value;
    reviewFeedback.textContent = 'Reviewing...';
    setTimeout(() => {
        reviewFeedback.textContent = aiReview(code, lang);
    }, 800);
};

// Mock GitHub PR analysis
analyzePrBtn.onclick = () => {
    const link = prLink.value.trim();
    prFeedback.textContent = 'Analyzing PR...';
    setTimeout(() => {
        if (!link.startsWith('https://github.com/')) {
            prFeedback.textContent = 'Invalid GitHub PR link.';
            return;
        }
        prFeedback.textContent = 'AI review for PR: No major issues found. Suggestions: Add more tests, improve documentation, and follow code style guidelines.';
    }, 1200);
};
