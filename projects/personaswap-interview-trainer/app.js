// ...existing code...
// Simulated logic for PersonaSwap Interview Trainer
const questions = {
  Friendly: [
    'Tell me about yourself.',
    'What motivates you in your career?',
    'How do you handle feedback?'
  ],
  Aggressive: [
    'Why should we hire you over others?',
    'Describe a time you failed.',
    'What would you do if you disagreed with your manager?'
  ],
  Technical: [
    'Explain a project you built.',
    'How do you debug complex issues?',
    'What is your favorite programming language and why?'
  ]
};
let mode = 'Friendly';
let qIndex = 0;
let answer = '';
let scores = [];
function getFeedback(mode, answer) {
  // Simulate AI feedback
  if (!answer.trim()) return 'Please provide an answer.';
  if (mode === 'Aggressive') return 'Pressure: Answer needs more confidence.';
  if (mode === 'Technical') return 'Technical depth: Expand on your skills.';
  return 'Friendly: Good answer, keep it positive!';
}
function renderApp() {
  document.getElementById('app').innerHTML = `
    <h1>PersonaSwap Interview Trainer</h1>
    <p>AI conducts mock interviews as different interviewer personalities. Prepare for real-world pressure and get feedback.</p>
    ${renderInterviewerModes(mode)}
    ${renderQASection(questions[mode][qIndex], answer)}
    ${renderScorecard(scores)}
  `;
  // Mode selection
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => {
      mode = btn.getAttribute('data-mode');
      qIndex = 0;
      answer = '';
      renderApp();
    };
  });
  // Answer submission
  document.querySelector('.submit-btn').onclick = () => {
    answer = document.querySelector('.answer-input').value;
    const feedback = getFeedback(mode, answer);
    scores.push(`${questions[mode][qIndex]}: ${feedback}`);
    if (qIndex < questions[mode].length - 1) {
      qIndex++;
      answer = '';
    }
    renderApp();
  };
}
document.addEventListener('DOMContentLoaded', renderApp);
