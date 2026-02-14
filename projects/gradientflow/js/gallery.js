// User Gallery for GradientFlow
// Save, load, and share user-created gradients with thumbnails

export class Gallery {
  constructor(container) {
    this.container = container;
    this.items = [];
    this.load();
  }
  save(gradientData) {
    this.items.push(gradientData);
    this.persist();
    this.render();
  }
  load() {
    let data = localStorage.getItem('gradientflow-gallery');
    if (data) this.items = JSON.parse(data);
    this.render();
  }
  persist() {
    localStorage.setItem('gradientflow-gallery', JSON.stringify(this.items));
  }
  render() {
    // ... Render gallery thumbnails and load buttons ...
  }
}
