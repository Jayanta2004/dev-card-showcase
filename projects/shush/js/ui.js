/**
 * SHUSH - UI State Management Module
 * Handles visual effects, state transitions, and UI updates
 * 
 * Features:
 * - Content visibility effects (fade, blur, blackout)
 * - Visual indicator updates
 * - Waveform visualization
 * - Noise meter animation
 * - Smooth state transitions
 * - Responsive UI updates
 */

class UIManager {
    constructor() {
        // DOM elements
        this.mainContent = null;
        this.noiseOverlay = null;
        this.statusIndicator = null;
        this.statusText = null;
        this.noiseLevelBar = null;
        this.noisePercentage = null;
        this.thresholdIndicator = null;
        this.waveformCanvas = null;
        this.waveformContext = null;
        this.frequencyBars = [];
        this.visualizer = null;
        
        // State
        this.currentEffect = 'fade'; // 'fade', 'blur', 'blackout'
        this.transitionSpeed = 500; // milliseconds
        this.isContentHidden = false;
        this.isVisualizerVisible = true;
        
        // Animation
        this.waveformAnimationId = null;
        this.isAnimating = false;
        
        // Colors
        this.accentColor = '#667eea';
        this.waveformColor = '#667eea';
        this.backgroundColor = '#f7fafc';
    }
    
    /**
     * Initialize UI manager with DOM references
     */
    initialize() {
        try {
            // Get DOM references
            this.mainContent = document.getElementById('main-content');
            this.noiseOverlay = document.getElementById('noise-overlay');
            this.statusIndicator = document.getElementById('status-indicator');
            this.statusText = this.statusIndicator?.querySelector('.status-text');
            this.noiseLevelBar = document.getElementById('noise-level-bar');
            this.noisePercentage = document.getElementById('noise-percentage');
            this.thresholdIndicator = document.getElementById('threshold-indicator');
            this.waveformCanvas = document.getElementById('waveform-canvas');
            this.visualizer = document.getElementById('audio-visualizer');
            
            // Get frequency bars
            this.frequencyBars = Array.from(
                document.querySelectorAll('.freq-bar')
            );
            
            // Initialize waveform canvas
            if (this.waveformCanvas) {
                this.waveformContext = this.waveformCanvas.getContext('2d');
                this.resizeWaveformCanvas();
                
                // Handle window resize
                window.addEventListener('resize', () => this.resizeWaveformCanvas());
            }
            
            // Set initial transition speed
            this.setTransitionSpeed(this.transitionSpeed);
            
            return true;
        } catch (error) {
            console.error('Failed to initialize UI manager:', error);
            return false;
        }
    }
    
    /**
     * Update status indicator
     */
    updateStatus(status, message) {
        if (!this.statusIndicator || !this.statusText) return;
        
        // Remove all status classes
        this.statusIndicator.classList.remove('active', 'warning', 'error');
        
        // Add appropriate class
        switch (status) {
            case 'active':
                this.statusIndicator.classList.add('active');
                break;
            case 'warning':
                this.statusIndicator.classList.add('warning');
                break;
            case 'error':
                this.statusIndicator.classList.add('error');
                break;
        }
        
        // Update text
        if (message) {
            this.statusText.textContent = message;
        }
    }
    
    /**
     * Show or hide content based on noise
     */
    setContentVisibility(isVisible) {
        if (!this.mainContent) return;
        
        const shouldHide = !isVisible;
        
        if (this.isContentHidden === shouldHide) {
            return; // No change needed
        }
        
        this.isContentHidden = shouldHide;
        
        // Remove all effect classes
        this.mainContent.classList.remove('fading', 'blurring', 'blackout');
        
        if (shouldHide) {
            // Apply appropriate effect
            switch (this.currentEffect) {
                case 'fade':
                    this.mainContent.classList.add('fading');
                    break;
                case 'blur':
                    this.mainContent.classList.add('blurring');
                    break;
                case 'blackout':
                    this.mainContent.classList.add('blackout');
                    this.noiseOverlay?.classList.add('active');
                    break;
            }
        } else {
            // Remove overlay for blackout
            this.noiseOverlay?.classList.remove('active');
        }
    }
    
    /**
     * Set the visual effect type
     */
    setEffect(effect) {
        if (['fade', 'blur', 'blackout'].includes(effect)) {
            this.currentEffect = effect;
            
            // Reapply current state with new effect
            if (this.isContentHidden) {
                this.setContentVisibility(false);
                this.setContentVisibility(true);
            }
        }
    }
    
    /**
     * Set transition speed
     */
    setTransitionSpeed(speed) {
        this.transitionSpeed = speed;
        
        if (this.mainContent) {
            this.mainContent.style.transitionDuration = `${speed}ms`;
        }
        
        if (this.noiseOverlay) {
            this.noiseOverlay.style.transitionDuration = `${speed}ms`;
        }
    }
    
    /**
     * Update noise level visualization
     */
    updateNoiseLevel(level, threshold) {
        // Update meter bar
        if (this.noiseLevelBar) {
            const percentage = Math.round(level * 100);
            this.noiseLevelBar.style.width = `${percentage}%`;
        }
        
        // Update percentage display
        if (this.noisePercentage) {
            this.noisePercentage.textContent = Math.round(level * 100);
        }
        
        // Update threshold indicator
        if (this.thresholdIndicator) {
            const thresholdPercentage = Math.round(threshold * 100);
            this.thresholdIndicator.style.left = `${thresholdPercentage}%`;
        }
    }
    
    /**
     * Update frequency bars visualization
     */
    updateFrequencyBars(frequencyData) {
        if (!frequencyData || this.frequencyBars.length === 0) return;
        
        const barCount = this.frequencyBars.length;
        const dataPointsPerBar = Math.floor(frequencyData.length / barCount);
        
        for (let i = 0; i < barCount; i++) {
            // Get average frequency for this bar
            let sum = 0;
            for (let j = 0; j < dataPointsPerBar; j++) {
                sum += frequencyData[i * dataPointsPerBar + j];
            }
            const average = sum / dataPointsPerBar;
            
            // Convert to percentage (0-100)
            const percentage = (average / 255) * 100;
            
            // Update bar height
            this.frequencyBars[i].style.height = `${percentage}%`;
        }
    }
    
    /**
     * Draw waveform on canvas
     */
    drawWaveform(timeDomainData) {
        if (!this.waveformContext || !timeDomainData) return;
        
        const canvas = this.waveformCanvas;
        const ctx = this.waveformContext;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Draw waveform
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.waveformColor;
        ctx.beginPath();
        
        const sliceWidth = width / timeDomainData.length;
        let x = 0;
        
        for (let i = 0; i < timeDomainData.length; i++) {
            const v = timeDomainData[i] / 128.0;
            const y = (v * height) / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Draw center line
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    }
    
    /**
     * Resize waveform canvas
     */
    resizeWaveformCanvas() {
        if (!this.waveformCanvas) return;
        
        const container = this.waveformCanvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set canvas size with device pixel ratio for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        this.waveformCanvas.width = rect.width * dpr;
        this.waveformCanvas.height = rect.height * dpr;
        
        // Scale context for device pixel ratio
        this.waveformContext.scale(dpr, dpr);
        
        // Set CSS size
        this.waveformCanvas.style.width = `${rect.width}px`;
        this.waveformCanvas.style.height = `${rect.height}px`;
    }
    
    /**
     * Show or hide visualizer
     */
    setVisualizerVisibility(isVisible) {
        this.isVisualizerVisible = isVisible;
        
        if (this.visualizer) {
            if (isVisible) {
                this.visualizer.classList.remove('hidden');
            } else {
                this.visualizer.classList.add('hidden');
            }
        }
    }
    
    /**
     * Update all visualizations
     */
    updateVisualizations(noiseLevel, threshold, frequencyData, timeDomainData) {
        // Update noise meter
        this.updateNoiseLevel(noiseLevel, threshold);
        
        // Update frequency bars
        if (frequencyData) {
            this.updateFrequencyBars(frequencyData);
        }
        
        // Update waveform
        if (timeDomainData) {
            this.drawWaveform(timeDomainData);
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '16px 24px',
            backgroundColor: type === 'error' ? '#f56565' : 
                           type === 'warning' ? '#ed8936' : 
                           type === 'success' ? '#48bb78' : '#667eea',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: '10000',
            animation: 'slideDown 0.3s ease-out',
            fontWeight: '600',
            maxWidth: '400px'
        });
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }
    
    /**
     * Animate element with shake effect
     */
    shakeElement(element) {
        if (!element) return;
        
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    /**
     * Pulse element
     */
    pulseElement(element) {
        if (!element) return;
        
        element.classList.add('attention-pulse');
        setTimeout(() => {
            element.classList.remove('attention-pulse');
        }, 2000);
    }
    
    /**
     * Update control panel collapse state
     */
    setControlPanelCollapsed(isCollapsed) {
        const controlPanel = document.getElementById('control-panel');
        if (controlPanel) {
            if (isCollapsed) {
                controlPanel.classList.add('collapsed');
            } else {
                controlPanel.classList.remove('collapsed');
            }
        }
    }
    
    /**
     * Scroll to top smoothly
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    /**
     * Get scroll percentage
     */
    getScrollPercentage() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        const scrollableHeight = documentHeight - windowHeight;
        if (scrollableHeight <= 0) return 0;
        
        return (scrollTop / scrollableHeight) * 100;
    }
    
    /**
     * Update reading progress bar
     */
    updateReadingProgress() {
        let progressBar = document.querySelector('.reading-progress');
        
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'reading-progress';
            document.body.appendChild(progressBar);
        }
        
        const percentage = this.getScrollPercentage();
        progressBar.style.width = `${percentage}%`;
    }
    
    /**
     * Enable scroll progress tracking
     */
    enableScrollProgress() {
        window.addEventListener('scroll', () => this.updateReadingProgress());
        this.updateReadingProgress();
    }
    
    /**
     * Destroy UI manager and clean up
     */
    destroy() {
        // Stop any animations
        if (this.waveformAnimationId) {
            cancelAnimationFrame(this.waveformAnimationId);
            this.waveformAnimationId = null;
        }
        
        // Remove event listeners
        window.removeEventListener('resize', () => this.resizeWaveformCanvas());
        window.removeEventListener('scroll', () => this.updateReadingProgress());
        
        // Clear references
        this.mainContent = null;
        this.noiseOverlay = null;
        this.statusIndicator = null;
        this.statusText = null;
        this.noiseLevelBar = null;
        this.noisePercentage = null;
        this.thresholdIndicator = null;
        this.waveformCanvas = null;
        this.waveformContext = null;
        this.frequencyBars = [];
        this.visualizer = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
