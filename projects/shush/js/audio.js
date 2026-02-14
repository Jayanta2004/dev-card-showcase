/**
 * SHUSH - Audio Processing Module
 * Handles Web Audio API, microphone access, noise detection, and audio analysis
 * 
 * Features:
 * - Microphone access with permission handling
 * - Real-time noise level analysis
 * - Frequency analysis for visualization
 * - Memory-safe audio processing
 * - Configurable sensitivity and thresholds
 */

class AudioProcessor {
    constructor() {
        // Audio context and nodes
        this.audioContext = null;
        this.mediaStream = null;
        this.sourceNode = null;
        this.analyserNode = null;
        this.gainNode = null;
        
        // Analysis data
        this.dataArray = null;
        this.frequencyData = null;
        this.bufferLength = 2048;
        
        // State management
        this.isActive = false;
        this.isMonitoring = false;
        this.hasPermission = false;
        
        // Noise detection settings
        this.sensitivity = 50; // 0-100
        this.threshold = 0.5; // 0-1
        this.noiseLevel = 0;
        this.smoothedNoiseLevel = 0;
        this.smoothingFactor = 0.8;
        
        // Debouncing for noise detection
        this.noiseDebounceTimer = null;
        this.debounceDelay = 300; // ms
        this.isNoisy = false;
        
        // Callbacks
        this.onNoiseLevelChange = null;
        this.onNoiseDetected = null;
        this.onSilenceRestored = null;
        this.onError = null;
        this.onPermissionGranted = null;
        this.onPermissionDenied = null;
        
        // Animation frame for continuous processing
        this.animationFrameId = null;
        
        // Performance tracking
        this.lastProcessTime = 0;
        this.processingInterval = 50; // ms between updates
    }
    
    /**
     * Initialize audio context and analyser
     */
    async initialize() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                throw new Error('Web Audio API not supported in this browser');
            }
            
            this.audioContext = new AudioContext();
            
            // Create analyser node
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = this.bufferLength;
            this.analyserNode.smoothingTimeConstant = 0.8;
            this.analyserNode.minDecibels = -90;
            this.analyserNode.maxDecibels = -10;
            
            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = 0; // Mute output to prevent feedback
            
            // Initialize data arrays
            const bufferLength = this.analyserNode.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            this.frequencyData = new Uint8Array(bufferLength);
            
            return true;
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            if (this.onError) {
                this.onError('initialization', error.message);
            }
            return false;
        }
    }
    
    /**
     * Request microphone access
     */
    async requestMicrophoneAccess() {
        try {
            // Check if browser supports getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Microphone access not supported in this browser');
            }
            
            // Request microphone permission
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: false, // We want to detect noise
                    autoGainControl: false
                }
            });
            
            // Connect media stream to audio context
            if (!this.audioContext) {
                await this.initialize();
            }
            
            this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.sourceNode.connect(this.analyserNode);
            this.analyserNode.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            
            this.hasPermission = true;
            this.isActive = true;
            
            if (this.onPermissionGranted) {
                this.onPermissionGranted();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to access microphone:', error);
            this.hasPermission = false;
            
            if (this.onPermissionDenied) {
                this.onPermissionDenied(error.message);
            }
            
            if (this.onError) {
                this.onError('microphone_access', error.message);
            }
            
            return false;
        }
    }
    
    /**
     * Start monitoring audio levels
     */
    startMonitoring() {
        if (!this.isActive || this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = true;
        this.processAudio();
    }
    
    /**
     * Stop monitoring audio levels
     */
    stopMonitoring() {
        this.isMonitoring = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Reset noise state
        this.noiseLevel = 0;
        this.smoothedNoiseLevel = 0;
        this.isNoisy = false;
        
        if (this.noiseDebounceTimer) {
            clearTimeout(this.noiseDebounceTimer);
            this.noiseDebounceTimer = null;
        }
    }
    
    /**
     * Main audio processing loop
     */
    processAudio() {
        if (!this.isMonitoring) {
            return;
        }
        
        const currentTime = Date.now();
        
        // Throttle processing for performance
        if (currentTime - this.lastProcessTime >= this.processingInterval) {
            // Get time domain data
            this.analyserNode.getByteTimeDomainData(this.dataArray);
            
            // Get frequency data
            this.analyserNode.getByteFrequencyData(this.frequencyData);
            
            // Calculate noise level
            this.calculateNoiseLevel();
            
            // Detect noise threshold crossing
            this.detectNoise();
            
            // Notify noise level change
            if (this.onNoiseLevelChange) {
                this.onNoiseLevelChange(this.smoothedNoiseLevel, this.frequencyData);
            }
            
            this.lastProcessTime = currentTime;
        }
        
        // Continue processing
        this.animationFrameId = requestAnimationFrame(() => this.processAudio());
    }
    
    /**
     * Calculate current noise level from audio data
     */
    calculateNoiseLevel() {
        let sum = 0;
        let max = 0;
        
        // Calculate RMS (Root Mean Square) for accurate volume measurement
        for (let i = 0; i < this.dataArray.length; i++) {
            const normalized = (this.dataArray[i] - 128) / 128;
            sum += normalized * normalized;
            max = Math.max(max, Math.abs(normalized));
        }
        
        const rms = Math.sqrt(sum / this.dataArray.length);
        
        // Combine RMS and peak for better noise detection
        this.noiseLevel = (rms * 0.7 + max * 0.3);
        
        // Apply smoothing
        this.smoothedNoiseLevel = 
            this.smoothingFactor * this.smoothedNoiseLevel + 
            (1 - this.smoothingFactor) * this.noiseLevel;
        
        // Clamp to 0-1 range
        this.smoothedNoiseLevel = Math.max(0, Math.min(1, this.smoothedNoiseLevel));
    }
    
    /**
     * Detect if noise exceeds threshold
     */
    detectNoise() {
        const effectiveThreshold = this.calculateEffectiveThreshold();
        const isCurrentlyNoisy = this.smoothedNoiseLevel > effectiveThreshold;
        
        // Clear existing timer
        if (this.noiseDebounceTimer) {
            clearTimeout(this.noiseDebounceTimer);
        }
        
        // Debounce noise detection
        this.noiseDebounceTimer = setTimeout(() => {
            if (isCurrentlyNoisy !== this.isNoisy) {
                this.isNoisy = isCurrentlyNoisy;
                
                if (this.isNoisy && this.onNoiseDetected) {
                    this.onNoiseDetected(this.smoothedNoiseLevel);
                } else if (!this.isNoisy && this.onSilenceRestored) {
                    this.onSilenceRestored();
                }
            }
        }, this.debounceDelay);
    }
    
    /**
     * Calculate effective threshold based on sensitivity
     */
    calculateEffectiveThreshold() {
        // Map sensitivity (0-100) to threshold (0.1-0.9)
        // Higher sensitivity = lower threshold (more reactive)
        const normalized = this.sensitivity / 100;
        return 0.9 - (normalized * 0.8);
    }
    
    /**
     * Update sensitivity setting
     */
    setSensitivity(value) {
        this.sensitivity = Math.max(0, Math.min(100, value));
        this.threshold = this.calculateEffectiveThreshold();
    }
    
    /**
     * Get current noise level (0-1)
     */
    getNoiseLevel() {
        return this.smoothedNoiseLevel;
    }
    
    /**
     * Get frequency data for visualization
     */
    getFrequencyData() {
        return this.frequencyData;
    }
    
    /**
     * Get time domain data for waveform visualization
     */
    getTimeDomainData() {
        return this.dataArray;
    }
    
    /**
     * Check if currently detecting noise
     */
    isNoisyEnvironment() {
        return this.isNoisy;
    }
    
    /**
     * Get current threshold value
     */
    getThreshold() {
        return this.threshold;
    }
    
    /**
     * Update debounce delay
     */
    setDebounceDelay(delay) {
        this.debounceDelay = Math.max(0, delay);
    }
    
    /**
     * Update smoothing factor (0-1)
     */
    setSmoothingFactor(factor) {
        this.smoothingFactor = Math.max(0, Math.min(1, factor));
    }
    
    /**
     * Pause audio processing (keeps connection alive)
     */
    pause() {
        this.stopMonitoring();
    }
    
    /**
     * Resume audio processing
     */
    resume() {
        if (this.isActive && !this.isMonitoring) {
            this.startMonitoring();
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        // Stop monitoring
        this.stopMonitoring();
        
        // Disconnect audio nodes
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }
        
        if (this.analyserNode) {
            this.analyserNode.disconnect();
            this.analyserNode = null;
        }
        
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
        
        // Stop media stream
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // Clear data arrays
        this.dataArray = null;
        this.frequencyData = null;
        
        // Reset state
        this.isActive = false;
        this.isMonitoring = false;
        this.hasPermission = false;
        this.isNoisy = false;
        
        // Clear callbacks
        this.onNoiseLevelChange = null;
        this.onNoiseDetected = null;
        this.onSilenceRestored = null;
        this.onError = null;
        this.onPermissionGranted = null;
        this.onPermissionDenied = null;
    }
    
    /**
     * Get audio processor status
     */
    getStatus() {
        return {
            isActive: this.isActive,
            isMonitoring: this.isMonitoring,
            hasPermission: this.hasPermission,
            isNoisy: this.isNoisy,
            noiseLevel: this.smoothedNoiseLevel,
            threshold: this.threshold,
            sensitivity: this.sensitivity
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioProcessor;
}
