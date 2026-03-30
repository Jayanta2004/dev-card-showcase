// HoloClass Builder Frontend Logic
const { createSceneSelector, createSceneArea, createShareLink } = window.Components;

const scenes = ['Science', 'History', 'Engineering'];
const sceneObjects = {
  Science: ['Atom', 'Microscope', 'Rocket'],
  History: ['Pyramid', 'Scroll', 'Globe'],
  Engineering: ['Gear', 'Bridge', 'Circuit']
};
let selectedScene = scenes[0];
let droppedObjects = [];
let shareLink = '';

document.addEventListener('DOMContentLoaded', () => {
  renderSelector();
  renderScene();
  renderShare();
});

function renderSelector() {
  document.getElementById('scene-selector').innerHTML = createSceneSelector(scenes, selectedScene);
  document.querySelectorAll('.scene-btn').forEach(btn => {
    btn.onclick = () => {
      selectedScene = btn.dataset.scene;
      droppedObjects = [];
      shareLink = '';
      renderSelector();
      renderScene();
      renderShare();
    };
  });
}

function renderScene() {
  document.getElementById('scene-area').innerHTML = createSceneArea(selectedScene, sceneObjects[selectedScene]);
  const palette = document.querySelectorAll('.object-item');
  const dropzone = document.getElementById('dropzone');
  palette.forEach(item => {
    item.ondragstart = e => {
      e.dataTransfer.setData('text/plain', item.dataset.object);
    };
  });
  dropzone.ondragover = e => {
    e.preventDefault();
  };
  dropzone.ondrop = e => {
    e.preventDefault();
    const obj = e.dataTransfer.getData('text/plain');
    if (obj && !droppedObjects.includes(obj)) {
      droppedObjects.push(obj);
      dropzone.innerHTML = droppedObjects.map(o=>`<span class="dropped-object">${o}</span>`).join(' ');
    }
  };
  document.querySelector('.share-btn').onclick = () => {
    shareLink = 'https://holoclass.example.com/class/' + Math.random().toString(36).slice(2,8);
    renderShare();
  };
}

function renderShare() {
  document.getElementById('share-link').innerHTML = shareLink ? createShareLink(shareLink) : '';
}
