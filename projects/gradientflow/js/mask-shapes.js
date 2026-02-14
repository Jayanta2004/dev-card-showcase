// Custom Shape Masks for GradientFlow
// Provides SVG and geometric masks for gradients

export const MaskShapes = {
  none: '',
  circle: '<circle cx="50%" cy="50%" r="48%" fill="white"/>',
  ellipse: '<ellipse cx="50%" cy="50%" rx="48%" ry="32%" fill="white"/>',
  polygon: '<polygon points="50,5 95,97 5,97" fill="white"/>',
  star: '<polygon points="50,5 61,35 95,35 67,57 78,91 50,70 22,91 33,57 5,35 39,35" fill="white"/>',
  text: (txt) => `<text x="50%" y="55%" text-anchor="middle" font-size="48" fill="white" font-family="sans-serif">${txt}</text>`
};

export function getMaskSVG(shape, text) {
  if (shape === 'text') return `<svg viewBox="0 0 100 100">${MaskShapes.text(text)}</svg>`;
  if (MaskShapes[shape]) return `<svg viewBox="0 0 100 100">${MaskShapes[shape]}</svg>`;
  return '';
}
