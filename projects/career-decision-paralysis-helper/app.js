// Career Decision Paralysis Helper
const app = document.getElementById('app');

const steps = [
  {
    question: 'Which skill do you enjoy most?',
    options: ['Coding/Programming', 'Design/Creativity', 'Data Analysis', 'Product/Project Management', 'Business/Strategy', 'Freelancing/Entrepreneurship']
  },
  {
    question: 'What motivates you most?',
    options: ['Making an impact', 'Earning potential', 'Continuous learning', 'Flexible work', 'Working with teams']
  },
  {
    question: 'Preferred work style?',
    options: ['Structured/Corporate', 'Creative/Unstructured', 'Independent/Self-driven', 'Collaborative/Team-based']
  },
  {
    question: 'How confident are you in your choices?',
    options: ['Very confident', 'Somewhat confident', 'Not sure', 'I feel stuck']
  }
];

let currentStep = 0;
let answers = [];
let fatigue = 0;

function renderStep() {
  app.innerHTML = `
    <div class="progress-bar"><div class="progress" style="width:${(currentStep/steps.length)*100}%"></div></div>
    <div class="quiz-step">
      <h3>${steps[currentStep].question}</h3>
      ${steps[currentStep].options.map((opt, i) => `<button onclick="answer(${i})">${opt}</button>`).join('')}
    </div>
    <div class="fatigue">Indecision Fatigue: ${fatigue}%</div>
  `;
}

window.answer = function(idx) {
  answers.push(steps[currentStep].options[idx]);
  // Increase fatigue if user chooses 'Not sure' or 'I feel stuck'
  if (steps[currentStep].options[idx].toLowerCase().includes('not sure') || steps[currentStep].options[idx].toLowerCase().includes('stuck')) {
    fatigue += 25;
  } else {
    fatigue += 10;
  }
  fatigue = Math.min(100, fatigue);
  currentStep++;
  if (currentStep < steps.length) {
    renderStep();
  } else {
    showRecommendation();
  }
};

function showRecommendation() {
  let suggestion = '';
  // Simple logic for demo
  if (answers[0] === 'Coding/Programming') suggestion = 'Software Developer, Data Engineer, or Tech Startup roles.';
  else if (answers[0] === 'Design/Creativity') suggestion = 'UI/UX Designer, Creative Director, or Product Designer.';
  else if (answers[0] === 'Data Analysis') suggestion = 'Data Analyst, BI Specialist, or Research roles.';
  else if (answers[0] === 'Product/Project Management') suggestion = 'Product Manager, Project Lead, or Scrum Master.';
  else if (answers[0] === 'Business/Strategy') suggestion = 'Business Analyst, MBA, or Strategy Consultant.';
  else if (answers[0] === 'Freelancing/Entrepreneurship') suggestion = 'Freelancer, Entrepreneur, or Startup Founder.';

  let fatigueMsg = fatigue < 40 ? 'You are decisive!' : fatigue < 70 ? 'Some indecision detected.' : 'High indecision/fatigue. Try to clarify your goals.';

  app.innerHTML = `
    <div class="progress-bar"><div class="progress" style="width:100%"></div></div>
    <div class="recommendation">
      <h3>Recommendation</h3>
      <p>${suggestion}</p>
      <p><strong>${fatigueMsg}</strong></p>
      <button onclick="restart()">Restart Quiz</button>
    </div>
  `;
}

window.restart = function() {
  currentStep = 0;
  answers = [];
  fatigue = 0;
  renderStep();
};

renderStep();
