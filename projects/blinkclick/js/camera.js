/**
 * Camera Engine Module
 * Responsible for interfacing with the webcam and providing video frames.
 */

class CameraEngine {
    constructor(videoElementId) {
        this.video = document.getElementById(videoElementId);
        this.stream = null;
        this.isActive = false;
        this.width = 640;
        this.height = 480;
    }

    /**
     * Initialize webcam stream
     */
    async start() {
        try {
            const constraints = {
                video: {
                    width: { ideal: this.width },
                    height: { ideal: this.height },
                    facingMode: 'user'
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.isActive = true;
                    this.width = this.video.videoWidth;
                    this.height = this.video.videoHeight;
                    resolve(true);
                };
            });
        } catch (error) {
            console.error('Camera initialization failed:', error);
            throw error;
        }
    }

    /**
     * Stop the camera stream
     */
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.isActive = false;
        }
    }

    /**
     * Get basic dimensions
     */
    getDimensions() {
        return {
            width: this.width,
            height: this.height
        };
    }

    /**
     * Check if camera is streaming
     */
    isReady() {
        return this.isActive && this.video.readyState === 4;
    }
}

// Export for use in other modules
window.CameraEngine = CameraEngine;
