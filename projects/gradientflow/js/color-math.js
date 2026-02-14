// color-math.js
// Procedural color math utilities for GradientFlow

const ColorMath = (() => {
  // Helper: clamp value
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // Interpolate between two numbers
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Interpolate between two colors (rgb arrays)
  function lerpColor(c1, c2, t) {
    return [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t))
    ];
  }

  // Convert HSL to RGB
  function hslToRgb(h, s, l) {
    h = h % 360;
    s = clamp(s, 0, 1);
    l = clamp(l, 0, 1);
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r, g, b;
    if (h < 60)      [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else              [r, g, b] = [c, 0, x];
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }

  // Convert RGB array to CSS string
  function rgbToCss(rgb, alpha = 1) {
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
  }

  // Generate a procedural color using sin/cos
  function proceduralColor(t, offset = 0, freq = 0.2, amp = 0.5, base = 0.5) {
    // t: time, offset: phase, freq: frequency, amp: amplitude, base: base value
    const h = (360 * (Math.sin(freq * t + offset) * amp + base)) % 360;
    const s = clamp(0.6 + 0.2 * Math.cos(freq * t + offset * 1.3), 0.5, 0.9);
    const l = clamp(0.5 + 0.2 * Math.sin(freq * t + offset * 2.1), 0.3, 0.7);
    return hslToRgb(h, s, l);
  }

  // Generate N unique procedural colors
  function generateGradientColors(t, count, freq = 0.2) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const phase = (i * Math.PI * 2) / count;
      colors.push(proceduralColor(t, phase, freq));
    }
    return colors;
  }

  return {
    clamp,
    lerp,
    lerpColor,
    hslToRgb,
    rgbToCss,
    proceduralColor,
    generateGradientColors
  };
})();
