// Modular UI components for Live Challenge Portfolio
function createChallengeCard(challenge, idx) {
  return `
    <div class="challenge-card">
      <div class="challenge-title">${challenge.title}</div>
      <div class="challenge-desc">${challenge.desc}</div>
      <button class="btn start-btn" data-idx="${idx}">Start Challenge</button>
    </div>
  `;
}
function createTimer(seconds) {
  return `<div class="timer">⏰ ${seconds}s left</div>`;
}
function createEditorArea(code, lang) {
  return `
    <div class="editor-area">
      <textarea id="code-editor" spellcheck="false" rows="12" cols="80">${code || ''}</textarea>
    </div>
  `;
}
function createSubmitBtn() {
  return `<button class="btn submit-btn">Submit Solution</button>`;
}
function createResultArea(result, passed) {
  return `<div class="result-area ${passed ? 'pass' : 'fail'}">${result}</div>`;
}
function createDashboard(performance) {
  return `
    <h2>Your Verified Performance</h2>
    <ul class="perf-list">
      ${performance.map(p => `<li><b>${p.title}</b>: ${p.status} (${p.time}s)</li>`).join('')}
    </ul>
  `;
}
window.Components = { createChallengeCard, createTimer, createEditorArea, createSubmitBtn, createResultArea, createDashboard };
