// Modular UI components for HoloClass Builder
function createSceneSelector(scenes, selected) {
  return `<div class="scene-btns">${scenes.map(s=>`<button class="btn scene-btn${s===selected?' selected':''}" data-scene="${s}">${s}</button>`).join('')}</div>`;
}
function createSceneArea(scene, objects) {
  return `<div class="scene-card">
    <h2>${scene} Lesson</h2>
    <div class="scene-objects">
      <h3>Drag & Drop Objects</h3>
      <div class="object-palette">${objects.map(o=>`<div class="object-item" draggable="true" data-object="${o}">${o}</div>`).join('')}</div>
      <div class="object-dropzone" id="dropzone">Drop objects here to build your lesson!</div>
    </div>
    <button class="btn share-btn">Get Shareable Link</button>
  </div>`;
}
function createShareLink(link) {
  return `<div class="share-link">Share this class: <a href="${link}" target="_blank">${link}</a></div>`;
}
window.Components = { createSceneSelector, createSceneArea, createShareLink };
