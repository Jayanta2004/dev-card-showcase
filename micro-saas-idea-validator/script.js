const ideaForm = document.getElementById('ideaForm');
const toast = document.getElementById('toast');

const nicheScore = document.getElementById('nicheScore');
const competitionScore = document.getElementById('competitionScore');
const gtmScore = document.getElementById('gtmScore');
const overallScore = document.getElementById('overallScore');

const quickAdvice = document.getElementById('quickAdvice');
const competitorSummary = document.getElementById('competitorSummary');
const icpSummary = document.getElementById('icpSummary');
const validationChecklist = document.getElementById('validationChecklist');
const pricingGtm = document.getElementById('pricingGtm');
const landingCopy = document.getElementById('landingCopy');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreIdea(input) {
  const ideaLen = input.ideaName.length;
  const problemLen = input.problem.length;
  const targetSegments = input.targetUsers.split(',').map((item) => item.trim()).filter(Boolean).length;
  const featureWords = titleWords(input.coreFeature).length;

  let niche = 45;
  niche += clamp(Math.floor(problemLen / 25), 0, 16);
  niche += clamp(targetSegments * 4, 0, 12);
  niche += input.marketStage === 'new' ? 8 : input.marketStage === 'growing' ? 5 : 2;
  niche = clamp(niche, 42, 92);

  let competition = input.marketStage === 'mature' ? 78 : input.marketStage === 'growing' ? 62 : 46;
  competition += clamp(Math.floor(ideaLen / 20), 0, 10);
  competition = clamp(competition, 35, 90);

  let gtm = 42;
  gtm += clamp(featureWords * 3, 0, 18);
  gtm += targetSegments <= 2 ? 16 : 8;
  gtm += input.marketStage === 'new' ? 3 : 7;
  gtm = clamp(gtm, 40, 91);

  const viability = clamp(Math.round((niche + (100 - competition) + gtm) / 3), 35, 93);
  return { niche, competition, gtm, viability };
}

function generateCompetitorSummary(input, scores) {
  const category = input.marketStage === 'new' ? 'emerging category tools' : input.marketStage === 'growing' ? 'fast-follow SaaS products' : 'mature incumbent products';
  return `
    <h4>Landscape</h4>
    <p>Your idea likely competes with <strong>${category}</strong> serving ${input.targetUsers}.</p>
    <h4>Positioning Gap</h4>
    <p>Emphasize <strong>${input.coreFeature}</strong> as a narrower wedge before expanding feature breadth.</p>
    <h4>Risk Signal</h4>
    <p>Competition pressure is <strong>${scores.competition}/100</strong>; win with sharper onboarding and one measurable outcome.</p>
  `;
}

function generateIcp(input) {
  const primaryRole = input.targetUsers.split(',')[0]?.trim() || input.targetUsers;
  return `
    <h4>Primary ICP</h4>
    <p><strong>${primaryRole}</strong> with recurring pain around: ${input.problem}</p>
    <h4>Buying Trigger</h4>
    <p>They seek a faster way to achieve outcomes through <strong>${input.coreFeature}</strong> in under 14 days.</p>
    <h4>Channels</h4>
    <p>Reach through niche communities, creator-led demos, and direct outreach with short proof-based case snippets.</p>
  `;
}

function generateChecklist(scores) {
  const checks = [
    { label: 'Pain is specific and urgent', good: scores.niche >= 65 },
    { label: 'Target user segment is narrow enough', good: scores.gtm >= 62 },
    { label: 'Clear wedge versus competitors', good: scores.competition <= 68 },
    { label: 'Monetization path is testable quickly', good: scores.viability >= 60 },
    { label: 'Can ship MVP in < 4 weeks', good: scores.gtm >= 58 }
  ];

  validationChecklist.innerHTML = checks
    .map((item) => `<li class="${item.good ? 'good' : 'warn'}"><span>${item.good ? '✅' : '⚠️'}</span>${item.label}</li>`)
    .join('');
}

function generatePricingGtm(input, scores) {
  const pricing = scores.competition > 70 ? 'usage-based starter + premium team add-on' : 'flat monthly tier with annual discount';
  const channel = input.marketStage === 'new' ? 'educational content + waitlist' : 'free tool lead magnet + outbound demos';

  return `
    <h4>Pricing Angle</h4>
    <p>Recommended: <strong>${pricing}</strong>. Start with a low-friction entry tier to reduce trial resistance.</p>
    <h4>Go-To-Market</h4>
    <p>Use <strong>${channel}</strong>, then convert with demo-driven onboarding and social proof snippets.</p>
    <h4>Fast Validation Experiment</h4>
    <p>Run a 7-day concierge pilot for 10 users and track activation, retention intent, and willingness to pay.</p>
  `;
}

function generateLandingCopy(input) {
  return `
    <h4>Headline</h4>
    <p><strong>${input.ideaName}</strong> helps ${input.targetUsers} solve ${input.problem.toLowerCase()}.</p>
    <h4>Subheadline</h4>
    <p>Get measurable outcomes with ${input.coreFeature} without adding complex workflows.</p>
    <h4>CTA</h4>
    <p><strong>Join the early access list</strong> and get your first validation report in minutes.</p>
  `;
}

function renderScores(scores) {
  nicheScore.textContent = `${scores.niche}/100`;
  competitionScore.textContent = `${scores.competition}/100`;
  gtmScore.textContent = `${scores.gtm}/100`;
  overallScore.textContent = `${scores.viability}/100`;

  quickAdvice.classList.remove('empty');
  if (scores.viability >= 72) {
    quickAdvice.innerHTML = 'Strong signal: build a tight MVP and validate willingness-to-pay immediately.';
  } else if (scores.viability >= 58) {
    quickAdvice.innerHTML = 'Promising but refine positioning and narrow the first target segment before building.';
  } else {
    quickAdvice.innerHTML = 'Weak signal right now: interview users first and sharpen the pain statement.';
  }
}

ideaForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const input = {
    ideaName: document.getElementById('ideaName').value.trim(),
    problem: document.getElementById('problem').value.trim(),
    targetUsers: document.getElementById('targetUsers').value.trim(),
    coreFeature: document.getElementById('coreFeature').value.trim(),
    marketStage: document.getElementById('marketStage').value
  };

  const scores = scoreIdea(input);
  renderScores(scores);

  competitorSummary.classList.remove('empty');
  icpSummary.classList.remove('empty');
  pricingGtm.classList.remove('empty');
  landingCopy.classList.remove('empty');

  competitorSummary.innerHTML = generateCompetitorSummary(input, scores);
  icpSummary.innerHTML = generateIcp(input);
  generateChecklist(scores);
  pricingGtm.innerHTML = generatePricingGtm(input, scores);
  landingCopy.innerHTML = generateLandingCopy(input);

  showToast('Validation report generated');
});
