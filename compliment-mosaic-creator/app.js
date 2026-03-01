// Compliment Mosaic Creator App
// ...existing code...
function getRandomColor() {
  const colors = ['#43a047','#f06292','#ffd600','#1976d2','#ff8a65','#80cbc4','#b39ddb','#aed581','#90caf9','#fbc02d'];
  return colors[Math.floor(Math.random()*colors.length)];
}
class Compliment {
  constructor(message, date, color) {
    this.message = message;
    this.date = date || new Date();
    this.color = color || getRandomColor();
  }
}
class Mosaic {
  constructor() {
    this.tiles = [];
    this.load();
  }
  addTile(compliment) {
    this.tiles.push(compliment);
    this.save();
  }
  getTiles() {
    return this.tiles;
  }
  save() {
    localStorage.setItem('mosaicTiles', JSON.stringify(this.tiles));
  }
  load() {
    const data = localStorage.getItem('mosaicTiles');
    if (data) this.tiles = JSON.parse(data).map(m => new Compliment(m.message, m.date, m.color));
  }
}
const mosaic = new Mosaic();
function renderSendSection() {
  const div = document.getElementById('send-section');
  div.innerHTML = `
    <h2>Send a Compliment</h2>
    <form id="send-form">
      <textarea id="compliment-message" rows="2" placeholder="Write something kind..." required></textarea>
      <button type="submit">Add to Mosaic</button>
    </form>
  `;
  document.getElementById('send-form').onsubmit = function(e) {
    e.preventDefault();
    const message = document.getElementById('compliment-message').value;
    mosaic.addTile(new Compliment(message));
    renderMosaicSection();
    renderFeedSection();
    this.reset();
  };
}
function renderMosaicSection() {
  const div = document.getElementById('mosaic-section');
  const tiles = mosaic.getTiles();
  if (tiles.length === 0) {
    div.innerHTML = '<p>No compliments yet.</p>';
    return;
  }
  div.innerHTML = `<div class="mosaic-grid">${tiles.map((t,i) => `<div class="mosaic-tile" style="background:${t.color}" title="${t.message}" onclick="showTileMessage(${i})">${i+1}</div>`).join('')}</div>`;
}
function showTileMessage(index) {
  const tile = mosaic.getTiles()[index];
  alert(tile.message + '\n' + new Date(tile.date).toLocaleDateString());
}
function renderFeedSection() {
  const div = document.getElementById('feed-section');
  const tiles = mosaic.getTiles().slice().reverse();
  div.innerHTML = tiles.length ? tiles.map(t => `<div class="feed-card">${t.message}<br><small>${new Date(t.date).toLocaleDateString()}</small></div>`).join('') : '<p>No compliments yet.</p>';
}
renderSendSection();
renderMosaicSection();
renderFeedSection();
window.showTileMessage = showTileMessage;
