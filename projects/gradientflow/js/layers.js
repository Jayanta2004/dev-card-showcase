// Multi-Gradient Layers module for GradientFlow
// Handles stacking, blending, and managing multiple gradient layers

export class GradientLayer {
  constructor(options) {
    this.id = options.id || `layer-${Date.now()}`;
    this.type = options.type || 'linear';
    this.colors = options.colors || ['#fff', '#000'];
    this.angle = options.angle || 0;
    this.opacity = options.opacity || 1;
    this.blendMode = options.blendMode || 'normal';
    this.mask = options.mask || null;
    this.visible = options.visible !== false;
  }
}

export class LayerManager {
  constructor() {
    this.layers = [];
    this.activeLayer = null;
  }
  addLayer(layer) {
    this.layers.push(layer);
    this.activeLayer = layer;
  }
  removeLayer(id) {
    this.layers = this.layers.filter(l => l.id !== id);
    if (this.activeLayer && this.activeLayer.id === id) {
      this.activeLayer = this.layers[0] || null;
    }
  }
  setActive(id) {
    this.activeLayer = this.layers.find(l => l.id === id) || null;
  }
  getActive() {
    return this.activeLayer;
  }
  toCSS() {
    return this.layers.filter(l => l.visible).map(l => {
      let grad = l.type === 'radial'
        ? `radial-gradient(circle at 50% 50%, ${l.colors.join(', ')})`
        : `linear-gradient(${l.angle}deg, ${l.colors.join(', ')})`;
      return grad;
    }).join(', ');
  }
}
