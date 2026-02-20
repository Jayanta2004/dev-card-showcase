/**
 * Export Matrix Engine for ReactionSkin PRO
 * 
 * Orchestrates the extraction of simulation visuals from the GPU/Canvas
 * for persistent storage. Facilitates high-fidelity frame captures (PNG) 
 * and real-time stream recording (WebM/VP9).
 * 
 * @class ExportEngine
 */
export class ExportEngine {
    /**
     * @param {HTMLCanvasElement} canvas - The source canvas to record from
     */
    constructor(canvas) {
        /** @type {HTMLCanvasElement} */
        this.canvas = canvas;

        /** @type {MediaRecorder} System recorder instance */
        this.recorder = null;

        /** @type {Blob[]} Accumulated video segments */
        this.chunks = [];

        /** @type {boolean} State tracking for recording session */
        this.isRecording = false;
    }

    /**
     * Performs a non-blocking snapshot of the current canvas state.
     * Generates a timestamped PNG file and triggers a browser download.
     */
    captureFrame() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `ReactionSkin-Pro-Snap-${timestamp}.png`;

        // Generate high-DPI data URL (1.0 quality flag for lossless PNG)
        const dataURL = this.canvas.toDataURL('image/png', 1.0);

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;

        // Programmatically trigger the download interaction
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`Frame Exported: ${filename}`);
    }

    /**
     * Initializes a MediaStream from the canvas and begins a recording session.
     * Defaults to VP9 encoding for high compression efficiency.
     */
    startRecording() {
        if (this.isRecording) return;

        this.chunks = [];

        // Capture stream at the simulation's native refresh rate (typically 60fps)
        const stream = this.canvas.captureStream(60);

        // Browser target prioritization: VP9 -> VP8 -> Default
        const options = {
            mimeType: 'video/webm; codecs=vp9',
            videoBitsPerSecond: 5000000 // 5Mbps for high quality
        };

        try {
            this.recorder = new MediaRecorder(stream, options);
        } catch (e) {
            console.warn('VP9 encoding unavailable, falling back to container default');
            this.recorder = new MediaRecorder(stream);
        }

        /**
         * Event handler for data accumulation.
         * @param {BlobEvent} e 
         */
        this.recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.chunks.push(e.data);
            }
        };

        /**
         * Event handler for session finalization.
         */
        this.recorder.onstop = () => {
            this.downloadVideo();
        };

        this.recorder.start(1000); // Pulse every 1s to ensure data safety
        this.isRecording = true;
        console.log('Video Recording Session: ENGAGED');
    }

    /**
     * Terminates the active recording session and prepares data for export.
     */
    stopRecording() {
        if (!this.isRecording) return;

        this.recorder.stop();
        this.isRecording = false;
        console.log('Video Recording Session: TERMINATED');
    }

    /**
     * Aggregates stored binary chunks into a single video file.
     * 
     * @private
     */
    downloadVideo() {
        // Concatenate chunks into a single Blob
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        const link = document.createElement('a');
        link.href = url;
        link.download = `ReactionSkin-Session-${timestamp}.webm`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup memory reference
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
}
