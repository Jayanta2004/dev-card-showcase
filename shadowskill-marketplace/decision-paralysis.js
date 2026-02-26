// shadowskill-marketplace/decision-paralysis.js
// Interactive Career Decision Helper

document.addEventListener('DOMContentLoaded', function() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="career-helper">
      <h2>Career Decision Helper</h2>
      <p>Feeling overwhelmed by career choices? Answer a few questions to get personalized suggestions!</p>
      <form id="career-form">
        <label>Which skills do you enjoy most?<br>
          <select name="skills">
            <option value="coding">Coding/Programming</option>
            <option value="design">Design/Creativity</option>
            <option value="analysis">Data Analysis</option>
            <option value="management">Product/Project Management</option>
            <option value="business">Business/Strategy</option>
            <option value="freelancing">Freelancing/Entrepreneurship</option>
          </select>
        </label><br><br>
        <label>What motivates you?<br>
          <select name="motivation">
            <option value="impact">Making an impact</option>
            <option value="money">Earning potential</option>
            <option value="learning">Continuous learning</option>
            <option value="flexibility">Flexible work</option>
            <option value="team">Working with teams</option>
          </select>
        </label><br><br>
        <label>Preferred work style:<br>
          <select name="style">
            <option value="structured">Structured/Corporate</option>
            <option value="creative">Creative/Unstructured</option>
            <option value="independent">Independent/Self-driven</option>
            <option value="collaborative">Collaborative/Team-based</option>
          </select>
        </label><br><br>
        <button type="submit">Get Suggestion</button>
      </form>
      <div id="career-result"></div>
    </section>
  `;

  document.getElementById('career-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const skills = e.target.skills.value;
    const motivation = e.target.motivation.value;
    const style = e.target.style.value;
    const result = document.getElementById('career-result');
    let suggestion = '';

    if (skills === 'coding') {
      if (motivation === 'impact') suggestion = 'Software Developer for social impact startups.';
      else if (motivation === 'money') suggestion = 'Full-stack Developer in tech companies.';
      else suggestion = 'Explore developer roles in startups or corporates.';
    } else if (skills === 'design') {
      suggestion = 'UI/UX Designer or Creative Director.';
    } else if (skills === 'analysis') {
      suggestion = 'Data Analyst or Business Intelligence Specialist.';
    } else if (skills === 'management') {
      suggestion = 'Product Manager or Project Lead.';
    } else if (skills === 'business') {
      suggestion = 'MBA, Business Analyst, or Strategy Consultant.';
    } else if (skills === 'freelancing') {
      suggestion = 'Freelancer, Entrepreneur, or Startup Founder.';
    }

    if (style === 'independent' && skills !== 'freelancing') {
      suggestion += ' Consider freelancing or remote roles.';
    } else if (style === 'collaborative') {
      suggestion += ' Look for team-based environments.';
    }

    result.innerHTML = `<strong>Suggestion:</strong> ${suggestion}`;
  });
});
