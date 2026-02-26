// Live Challenge Portfolio Frontend Logic
const { createChallengeCard, createTimer, createEditorArea, createSubmitBtn, createResultArea, createDashboard } = window.Components;

const challenges = [
  { title: 'Reverse a String', desc: 'Write a function that reverses a string.', lang: 'js', starter: '// function reverse(str) {\n//   ...\n// }' },
  { title: 'Sum Array', desc: 'Write a function that returns the sum of an array.', lang: 'js', starter: '// function sum(arr) {\n//   ...\n// }' },
  { title: 'Palindrome Check', desc: 'Check if a string is a palindrome.', lang: 'js', starter: '// function isPalindrome(str) {\n//   ...\n// }' }
];
let performance = JSON.parse(localStorage.getItem('challengePerformance') || '[]');
let timerInterval, timeLeft, currentIdx;

document.addEventListener('DOMContentLoaded', () => {
  renderChallengeList();
});

function renderChallengeList() {
  document.getElementById('challenge-list').innerHTML = challenges.map((c, i) => createChallengeCard(c, i)).join('');
  document.getElementById('challenge-list').addEventListener('click', function(e) {
    if (e.target.classList.contains('start-btn')) {
      startChallenge(+e.target.dataset.idx);
    }
  });
}

function startChallenge(idx) {
  currentIdx = idx;
  timeLeft = 180;
  document.getElementById('challenge-list').style.display = 'none';
  document.getElementById('dashboard').style.display = 'none';
  renderChallengeArea();
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').innerHTML = createTimer(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitSolution(true);
    }
  }, 1000);
}

function renderChallengeArea() {
  const c = challenges[currentIdx];
  document.getElementById('challenge-area').style.display = '';
  document.getElementById('challenge-area').innerHTML = `
    <h2>${c.title}</h2>
    <div>${c.desc}</div>
    <div id="timer">${createTimer(timeLeft)}</div>
    ${createEditorArea(c.starter, c.lang)}
    ${createSubmitBtn()}
    <div id="result"></div>
  `;
  document.querySelector('.submit-btn').onclick = () => submitSolution();
}

function submitSolution(timeout) {
  clearInterval(timerInterval);
  const code = document.getElementById('code-editor').value;
  let passed = Math.random() > 0.3 && !timeout; // Simulate pass/fail
  let result = timeout ? 'Time up! Auto-submitted.' : (passed ? 'Passed! Solution verified.' : 'Failed. Try again next time.');
  document.getElementById('result').innerHTML = createResultArea(result, passed);
  performance.push({ title: challenges[currentIdx].title, status: passed ? 'Passed' : 'Failed', time: 180 - timeLeft });
  localStorage.setItem('challengePerformance', JSON.stringify(performance));
  setTimeout(() => {
    document.getElementById('challenge-area').style.display = 'none';
    renderDashboard();
  }, 2000);
}

function renderDashboard() {
  document.getElementById('dashboard').style.display = '';
  document.getElementById('dashboard').innerHTML = createDashboard(performance);
  document.getElementById('challenge-list').style.display = '';
}
