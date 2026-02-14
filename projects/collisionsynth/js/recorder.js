/**
 * @file recorder.js
 * @description Capture system for recording audio/visual sessions of CollisionSynth.
 * Handles MediaRecorder API for both canvas stream and web audio destination.
 */

class SessionRecorder {
    constructor(canvas, audioDest) {
        this.canvas = canvas;
        this.audioDest = audioDest; // WebAudio play destination

        this.mediaRecorder = null;
        this.chunks = [];
        this.isRecording = false;

        this.startTime = 0;
        this.duration = 0;
        this.timerInterval = null;

        this.onStop = null; // Callback with blob url
    }

    start() {
        if (this.isRecording) return;

        console.log("Initializing recording session...");

        // 1. Capture Canvas Stream (60FPS)
        const canvasStream = this.canvas.captureStream(60);

        // 2. Capture Audio Stream (Not just destination, we need a specific node usually)
        // We'll assume the audio engine passed its master node or destination
        // Note: Connecting audio ctx destination to stream is tricky, better to pass a MediaStreamAudioDestinationNode

        // For simplicity, we might just record video if audio setup is complex, 
        // but let's try to combine tracks if audioDest is a stream node.

        let combinedStream = canvasStream;
        if (this.audioDest && this.audioDest.stream) {
            const audioTracks = this.audioDest.stream.getAudioTracks();
            if (audioTracks.length > 0) {
                combinedStream.addTrack(audioTracks[0]);
            }
        }

        try {
            // Prefer VP9 or H264
            const options = { mimeType: 'video/webm; codecs=vp9' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm'; // Fallback
            }

            this.mediaRecorder = new MediaRecorder(combinedStream, options);
        } catch (e) {
            console.error("MediaRecorder init failed:", e);
            return;
        }

        this.chunks = [];
        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.chunks.push(e.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            this.processRecording();
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        this.startTime = Date.now();

        this.timerInterval = setInterval(() => {
            this.duration = Date.now() - this.startTime;
            // Update UI if needed via callback?
        }, 1000);

        console.log("Recording started.");
    }

    stop() {
        if (!this.isRecording) return;

        this.mediaRecorder.stop();
        this.isRecording = false;
        clearInterval(this.timerInterval);

        console.log("Recording stopped.");
    }

    processRecording() {
        if (this.chunks.length === 0) return;

        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        if (this.onStop) {
            this.onStop(url, blob.size);
        }

        // Auto-download for convenience
        const a = document.createElement('a');
        a.href = url;
        a.download = `CollisionSynth_Session_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }

    isSupported() {
        return !!window.MediaRecorder;
    }
}
