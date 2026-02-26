// Parallel-Universe Portfolio Frontend Logic
const { createUniverseSelector, createUniverseContent } = window.Components;

const universes = ['Developer', 'Founder', 'Designer'];
const universeData = {
  Developer: {
    projects: [
      { name: 'Code Visualizer', desc: 'Interactive tool for algorithm learning.' },
      { name: 'Open Source PRs', desc: 'Contributions to major OSS projects.' }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Testing', 'DevOps'],
    timeline: ['Internship at TechCorp', 'Lead Dev at Startup', 'Open Source Maintainer']
  },
  Founder: {
    projects: [
      { name: 'Startup Launch', desc: 'Bootstrapped SaaS for productivity.' },
      { name: 'Pitch Decks', desc: 'Raised seed funding from angels.' }
    ],
    skills: ['Product Strategy', 'Fundraising', 'Team Building', 'Growth Hacking'],
    timeline: ['Founded SaaS Startup', 'Incubator Demo Day', 'Acquisition Offer']
  },
  Designer: {
    projects: [
      { name: 'Brand Identity', desc: 'Designed logos and style guides.' },
      { name: 'UX Portfolio', desc: 'Led UI/UX for mobile apps.' }
    ],
    skills: ['Figma', 'UI/UX', 'Branding', 'Illustration'],
    timeline: ['Freelance Design', 'Agency Lead', 'Award Nominee']
  }
};
let selectedUniverse = universes[0];

document.addEventListener('DOMContentLoaded', () => {
  renderSelector();
  renderContent();
});

function renderSelector() {
  document.getElementById('universe-selector').innerHTML = createUniverseSelector(universes, selectedUniverse);
  document.querySelectorAll('.universe-btn').forEach(btn => {
    btn.onclick = () => {
      selectedUniverse = btn.dataset.universe;
      renderSelector();
      renderContent();
    };
  });
}

function renderContent() {
  document.getElementById('universe-content').innerHTML = createUniverseContent(selectedUniverse, universeData[selectedUniverse]);
}
