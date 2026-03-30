// Modular UI components for Chaos-to-Startup Generator
function createStartupConcept(problem) {
  // Simulated startup generation
  return `<div class="startup-concept">
    <h2>Startup Idea</h2>
    <div><b>Problem:</b> ${problem}</div>
    <div><b>Target Market:</b> Gen Z, remote workers, creators</div>
    <div><b>MVP Scope:</b> Web app, mobile app, API integration</div>
    <div><b>Pricing:</b> Freemium, $9/mo pro, $99 investor export</div>
    <div><b>Pitch Deck Outline:</b> Problem, Solution, Market, Traction, Team, Ask</div>
  </div>`;
}
function createLeanCanvas(problem) {
  return `<div class="lean-canvas">
    <h3>Lean Canvas</h3>
    <ul>
      <li><b>Problem:</b> ${problem}</li>
      <li><b>Solution:</b> Automated idea generator</li>
      <li><b>Unique Value:</b> One-click pitch, market summary</li>
      <li><b>Customer Segments:</b> Founders, hackathon teams</li>
      <li><b>Channels:</b> Social, startup forums</li>
      <li><b>Revenue:</b> Credits, pro tier, licensing</li>
      <li><b>Cost:</b> API, hosting, marketing</li>
      <li><b>Key Metrics:</b> Ideas generated, pitch exports</li>
      <li><b>Unfair Advantage:</b> LLM-powered, validated problems</li>
    </ul>
  </div>`;
}
function createLandingCopy(problem) {
  return `<div class="landing-copy">
    <h3>Landing Page Copy</h3>
    <p>Turn chaos into opportunity. Paste your problem, get a startup idea, lean canvas, and pitch copy in seconds. For founders, builders, and dreamers.</p>
    <p><b>Example:</b> "${problem}" → Startup concept generated!</p>
  </div>`;
}
window.Components = { createStartupConcept, createLeanCanvas, createLandingCopy };
