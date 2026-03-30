// ...existing code...
// UI Components for PersonaSwap Interview Trainer
function renderInterviewerModes(selected) {
  const modes = [
    { name: 'Friendly', desc: 'Supportive, encouraging' },
    { name: 'Aggressive', desc: 'Challenging, high-pressure' },
    { name: 'Technical', desc: 'Focused on skills' }
  ];
  return `<div class='interviewer-modes'>${modes.map(m => `<button class='mode-btn${selected===m.name?' selected':''}' data-mode='${m.name}'>${m.name}<br><span style='font-size:0.9em;'>${m.desc}</span></button>`).join('')}</div>`;
}
function renderQASection(question, answer) {
  return `<div class='qa-section'>
    <div class='question'>${question}</div>
    <textarea class='answer-input' placeholder='Type your answer...'>${answer||''}</textarea>
    <button class='submit-btn'>Submit Answer</button>
  </div>`;
}
function renderScorecard(scores) {
  return `<div class='scorecard'>
    <div class='score-title'>Feedback Scorecard</div>
    <ul>${scores.map(s => `<li>${s}</li>`).join('')}</ul>
  </div>`;
}
