// Audio engine using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

/**
 * Generate and play drum sounds using Web Audio API
 * @param {number} freq - Base frequency for the drum sound
 * @param {number} duration - Duration of the sound in seconds
 */
function playDrumSound(freq, duration = 0.15) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure based on frequency range
    if (freq < 100) {
        // Kick drum - low frequency sine wave with pitch envelope
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    } else if (freq < 300) {
        // Tom/Snare - triangle wave with noise
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, audioContext.currentTime + duration);
        
        // Add noise for snare effect
        const noise = audioContext.createBufferSource();
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        noise.buffer = noiseBuffer;
        
        const noiseGain = audioContext.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        noiseGain.gain.setValueAtTime(0.3, audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        noise.start(audioContext.currentTime);
        noise.stop(audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    } else {
        // Hi-hat/Cymbal - filtered white noise
        const noise = audioContext.createBufferSource();
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        noise.buffer = noiseBuffer;
        
        const bandpass = audioContext.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = freq;
        bandpass.Q.value = 1;
        
        const noiseGain = audioContext.createGain();
        noise.connect(bandpass);
        bandpass.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        
        noiseGain.gain.setValueAtTime(0.5, audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        noise.start(audioContext.currentTime);
        noise.stop(audioContext.currentTime + duration);
        
        return;
    }

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}