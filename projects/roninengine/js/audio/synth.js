// RoninEngine — audio/synth.js  ·  Procedural sound primitives
'use strict';
import { audioEngine } from './audio.js';

const ctx = () => audioEngine.ctx;

/**
 * Play a synthesised noise burst (clash, impact, etc.)
 * @param {object} opts
 */
export function playNoise({ duration = 0.12, freq = 0, gain = 0.5, type = 'sawtooth' } = {}) {
  const c = ctx(); if (!c) return;
  const t  = c.currentTime;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type        = type;
  osc.frequency.setValueAtTime(freq || 200, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.1 || 20, t + duration);
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(env);
  env.connect(audioEngine.master);
  osc.start(t);
  osc.stop(t + duration);
}

/** White noise burst (blood impact, heavy hit) */
export function playWhiteNoise({ duration = 0.08, gain = 0.4 } = {}) {
  const c = ctx(); if (!c) return;
  const t     = c.currentTime;
  const buf   = c.createBuffer(1, Math.ceil(c.sampleRate * duration), c.sampleRate);
  const data  = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src   = c.createBufferSource();
  const env   = c.createGain();
  src.buffer  = buf;
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.connect(env);
  env.connect(audioEngine.master);
  src.start(t);
}

/** Metallic clang (blade clash) */
export function playClash() {
  playNoise({ duration: 0.18, freq: 1200, gain: 0.6, type: 'square' });
  playWhiteNoise({ duration: 0.06, gain: 0.3 });
}

/** Deep thud (heavy hit) */
export function playHit() {
  playNoise({ duration: 0.22, freq: 80, gain: 0.7, type: 'sawtooth' });
  playWhiteNoise({ duration: 0.1, gain: 0.5 });
}

/** Swift slash (light swing) */
export function playSwing() {
  playNoise({ duration: 0.09, freq: 600, gain: 0.25, type: 'sine' });
}
