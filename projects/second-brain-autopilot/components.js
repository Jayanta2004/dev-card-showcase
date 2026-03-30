// ...existing code...
// UI Components for Second-Brain Autopilot
function renderKnowledgeMap(nodes) {
  return `<div class='knowledge-map'>${nodes.map(renderKnowledgeNode).join('')}</div>`;
}
function renderKnowledgeNode(node) {
  return `<div class='knowledge-node'>
    <div class='node-title'>${node.title}</div>
    <div class='node-type'>${node.type}</div>
    <div class='node-content'>${node.content}</div>
  </div>`;
}
function renderWeeklyInsights(insights) {
  return `<div class='weekly-insights'>
    <div class='weekly-insights-title'>Weekly Insights</div>
    <ul>${insights.map(i => `<li>${i}</li>`).join('')}</ul>
  </div>`;
}
