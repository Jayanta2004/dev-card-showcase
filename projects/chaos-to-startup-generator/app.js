// Chaos-to-Startup Generator Frontend Logic
const { createStartupConcept, createLeanCanvas, createLandingCopy } = window.Components;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chaosForm');
  const output = document.getElementById('startup-output');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const problem = document.getElementById('problem').value.trim();
    if (!problem) return;
    output.innerHTML = `
      <div class="startup-section">
        ${createStartupConcept(problem)}
      </div>
      <div class="startup-section">
        ${createLeanCanvas(problem)}
      </div>
      <div class="startup-section">
        ${createLandingCopy(problem)}
      </div>
    `;
  });
});
