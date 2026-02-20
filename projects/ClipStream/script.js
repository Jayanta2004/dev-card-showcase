/**
 * ClipStream - Non-Linear Video Editor
 * Advanced Logic Engine
 */

// --- Constants ---
const FPS = 30;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const SNAP_THRESHOLD = 15; // px

class Timecode {
    static framesToTime(frames) {
        const totalSeconds = frames / FPS;
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        const f = Math.floor(frames % FPS);
        return `${String(h).padStart(2, 0)}:${String(m).padStart(2, 0)}:${String(s).padStart(2, 0)}:${String(f).padStart(2, 0)}`;
    }
}

// --- Data Models ---
class Keyframe {
    constructor(time, value) {
        this.time = time; // relative to clip start (frames)
        this.value = value; // 0-100
    }
}

class Clip {
    constructor(id, type, src, start, duration, offset, color, name) {
        this.id = id || crypto.randomUUID();
        this.type = type; // 'video', 'audio', 'text'
        this.src = src;
        this.start = start; // Global start (frames)
        this.duration = duration; // Length (frames)
        this.offset = offset || 0; // Source offset (frames)
        this.color = color || '#007acc';
        this.name = name || 'Clip';
        this.selected = false;
        this.keyframes = [
            new Keyframe(0, 100),
            new Keyframe(duration, 100)
        ];
    }
}

class Track {
    constructor(id, type, name) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.clips = [];
    }

    addClip(clip) {
        this.clips.push(clip);
        // Simple overlap prevention could go here
    }
}

// --- Editor Engine ---
class Editor {
    constructor() {
        this.tracks = [
            new Track(1, 'video', 'V2'),
            new Track(2, 'video', 'V1'),
            new Track(3, 'audio', 'A1')
        ];
        this.playhead = 0;
        this.duration = 4000;
        this.zoom = 50; // px per sec
        this.isPlaying = false;

        // Interaction State
        this.dragState = null; // { mode: 'move'|'trim-l'|'trim-r', clip, track, startX, initialStart, initialDur }
        this.selectedClip = null;

        // UI Refs
        this.ui = {
            timelineScroll: document.getElementById('timeline-scroll-area'),
            tracksContainer: document.getElementById('tracks-container'),
            timeDisplay: document.getElementById('timecode-main'),
            playheadLine: document.getElementById('playhead-line'),
            rulerCanvas: document.getElementById('ruler-canvas'),
            previewCanvas: document.getElementById('preview-canvas'),
            keyframeCanvas: document.getElementById('keyframe-canvas')
        };

        this.ctxPreview = this.ui.previewCanvas.getContext('2d');
        this.ctxRuler = this.ui.rulerCanvas.getContext('2d');
        this.ctxKeyframe = this.ui.keyframeCanvas.getContext('2d');

        this.init();
    }

    init() {
        this.updateRuler();
        this.renderTimeline();
        this.setupEventListeners();
        this.setupDragDrop();
        this.renderKeyframeGraph();

        requestAnimationFrame(() => this.loop());

        // Window Resize
        window.addEventListener('resize', () => {
            this.updateRuler();
            this.renderKeyframeGraph();
        });
    }

    setupEventListeners() {
        // Transport
        document.getElementById('btn-play').addEventListener('click', () => this.togglePlay());
        document.getElementById('btn-prev').addEventListener('click', () => { this.playhead = 0; this.updateUI(); });

        // Zoom
        this.ui.tracksContainer.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
                this.zoom = Math.max(10, Math.min(200, this.zoom * zoomDelta));
                this.renderTimeline();
                this.updateRuler();
                document.getElementById('zoom-stat').innerText = `Zoom: ${Math.round(this.zoom)}%`;
            }
        });

        // Global Mouse Up
        window.addEventListener('mouseup', () => {
            if (this.dragState) {
                this.dragState = null;
                document.body.style.cursor = 'default';
            }
        });

        // Global Mouse Move (for dragging)
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Ruler Seek
        const rulerCont = document.getElementById('ruler-container');
        rulerCont.addEventListener('mousedown', (e) => {
            const rect = rulerCont.getBoundingClientRect();
            const x = e.clientX - rect.left + this.ui.timelineScroll.scrollLeft;
            this.seekToPixels(x);
            // Allow dragging playhead
            this.dragState = { mode: 'scrub' };
        });

        // Keyframe Interaction
        this.ui.keyframeCanvas.addEventListener('mousedown', (e) => this.handleKeyframeClick(e));
    }

    handleMouseMove(e) {
        if (!this.dragState) return;

        if (this.dragState.mode === 'scrub') {
            const rulerCont = document.getElementById('ruler-container');
            const rect = rulerCont.getBoundingClientRect();
            const x = e.clientX - rect.left + this.ui.timelineScroll.scrollLeft;
            this.seekToPixels(x);
            return;
        }

        const dx = e.clientX - this.dragState.startX;
        const clip = this.dragState.clip;

        // Pixel to Frame conversion
        const framesDelta = Math.round((dx / this.zoom) * FPS);

        if (this.dragState.mode === 'move') {
            let newStart = this.dragState.initialStart + framesDelta;

            // Snapping
            const snap = this.getSnapPoint(newStart);
            if (Math.abs(snap - newStart) < (SNAP_THRESHOLD / this.zoom * FPS)) {
                newStart = snap;
            }

            clip.start = Math.max(0, newStart);
            this.updateClipDOM(clip);

        } else if (this.dragState.mode === 'trim-l') {
            const newStart = Math.min(this.dragState.initialStart + framesDelta, this.dragState.initialEnd - 30); // Min 1 sec
            const deltaStart = newStart - this.dragState.initialStart;

            if (newStart >= 0) {
                clip.start = newStart;
                clip.duration = this.dragState.initialDur - deltaStart;
                clip.offset = this.dragState.initialOffset + deltaStart;
                this.updateClipDOM(clip);
            }

        } else if (this.dragState.mode === 'trim-r') {
            const newDur = Math.max(30, this.dragState.initialDur + framesDelta);
            clip.duration = newDur;
            this.updateClipDOM(clip);
        }
    }

    getSnapPoint(frame) {
        // Snap to Playhead
        let candidates = [this.playhead];
        // Snap to Clip Ends
        this.tracks.forEach(t => t.clips.forEach(c => {
            if (c !== this.dragState.clip) {
                candidates.push(c.start);
                candidates.push(c.start + c.duration);
            }
        }));

        // Find closest
        return candidates.reduce((prev, curr) => Math.abs(curr - frame) < Math.abs(prev - frame) ? curr : prev);
    }

    setupDragDrop() {
        const tracksArea = this.ui.tracksContainer;

        // From Source (Existing)
        document.querySelectorAll('.draggable').forEach(d => {
            d.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('json', JSON.stringify({
                    type: d.dataset.type,
                    src: d.dataset.src,
                    color: d.dataset.color,
                    name: d.querySelector('span').innerText
                }));
            });
        });

        tracksArea.addEventListener('dragover', (e) => e.preventDefault());
        tracksArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const dataRaw = e.dataTransfer.getData('json');
            if (!dataRaw) return;
            const data = JSON.parse(dataRaw);

            const rect = tracksArea.getBoundingClientRect();
            const scrollLeft = this.ui.timelineScroll.scrollLeft;
            const scrollTop = this.ui.timelineScroll.scrollTop;

            const dropX = e.clientX - rect.left + scrollLeft;
            const dropY = e.clientY - rect.top + scrollTop;

            const trackIndex = Math.floor(dropY / 60);

            if (trackIndex >= 0 && trackIndex < this.tracks.length) {
                const startFrame = Math.max(0, Math.floor((dropX / this.zoom) * FPS));
                const newClip = new Clip(null, data.type, data.src, startFrame, 300, 0, data.color, data.name);
                this.tracks[trackIndex].addClip(newClip);
                this.renderTimeline();
            }
        });
    }

    // --- Rendering ---

    updateClipDOM(clip) {
        const el = document.getElementById(`clip-${clip.id}`);
        if (el) {
            const left = (clip.start / FPS) * this.zoom;
            const width = (clip.duration / FPS) * this.zoom;
            el.style.left = `${left}px`;
            el.style.width = `${width}px`;
        }
    }

    renderTimeline() {
        // Clear Tracks content but keep playhead
        this.ui.tracksContainer.innerHTML = '<div class="playhead-line" id="playhead-line"></div>';
        this.ui.playheadLine = document.getElementById('playhead-line');
        this.updateUI(); // Reset playhead pos

        // Render Tracks
        this.tracks.forEach(track => {
            const trackLane = document.createElement('div');
            trackLane.className = 'track-lane';
            // Render Clips
            track.clips.forEach(clip => {
                const clipEl = document.createElement('div');
                clipEl.className = 'clip';
                clipEl.id = `clip-${clip.id}`;
                if (clip.selected) clipEl.classList.add('selected');

                const left = (clip.start / FPS) * this.zoom;
                const width = (clip.duration / FPS) * this.zoom;
                clipEl.style.left = `${left}px`;
                clipEl.style.width = `${width}px`;
                clipEl.style.backgroundColor = clip.color;

                // Content
                clipEl.innerHTML = `
                    <div class="clip-handle-l" data-action="trim-l"></div>
                    <span style="pointer-events:none">${clip.name}</span>
                    <div class="clip-handle-r" data-action="trim-r"></div>
                `;

                // Mouse Down on Clip
                clipEl.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    this.selectClip(clip);

                    const action = e.target.dataset.action;
                    this.dragState = {
                        mode: action || 'move',
                        clip: clip,
                        track: track,
                        startX: e.clientX,
                        initialStart: clip.start,
                        initialDur: clip.duration,
                        initialEnd: clip.start + clip.duration,
                        initialOffset: clip.offset
                    };
                });

                trackLane.appendChild(clipEl);
            });
            this.ui.tracksContainer.appendChild(trackLane);
        });

        // Timeline Width
        const totalW = (this.duration / FPS) * this.zoom;
        this.ui.tracksContainer.style.width = `${totalW}px`;
        this.ui.rulerCanvas.width = totalW;
        this.updateRuler();
    }

    selectClip(clip) {
        this.tracks.forEach(t => t.clips.forEach(c => c.selected = false));
        clip.selected = true;
        this.selectedClip = clip;
        this.renderTimeline();
        this.renderKeyframeGraph();

        // Show props in inspector
        const slider = document.querySelector('.prop-slider');
        // slider.value = getOpacityAtTime(...)
    }

    updateRuler() {
        const ctx = this.ctxRuler;
        const width = this.ui.rulerCanvas.width;
        const height = this.ui.rulerCanvas.height;

        // Ensure accurate scaling
        this.ui.rulerCanvas.height = 30;

        ctx.fillStyle = '#252526';
        ctx.fillRect(0, 0, width, 30);
        ctx.fillStyle = '#888';
        ctx.font = '10px Inter';

        // Draw seconds
        const step = this.zoom; // 1 second interval px
        for (let x = 0; x < width; x += step) {
            ctx.fillRect(x, 15, 1, 15);
            if ((x / step) % 5 === 0) {
                // Determine time
                const seconds = x / this.zoom;
                ctx.fillText(Timecode.framesToTime(seconds * FPS), x + 4, 12);
            }
        }
    }

    renderKeyframeGraph() {
        const c = this.ui.keyframeCanvas;
        const ctx = this.ctxKeyframe;
        ctx.clearRect(0, 0, c.width, c.height); // Reset

        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;

        // Grid
        ctx.beginPath();
        ctx.moveTo(0, c.height / 2);
        ctx.lineTo(c.width, c.height / 2);
        ctx.stroke();

        if (!this.selectedClip) {
            ctx.fillStyle = '#666';
            ctx.fillText('Select a clip to edit keyframes', 50, 75);
            return;
        }

        const clip = this.selectedClip;

        // Draw Curve
        ctx.beginPath();
        ctx.strokeStyle = '#007acc';
        ctx.lineWidth = 2;

        clip.keyframes.sort((a, b) => a.time - b.time);

        clip.keyframes.forEach((kf, i) => {
            // Map time (0 - duration) to x (0 - width)
            // Map value (0-100) to y (height - 0)
            const x = (kf.time / clip.duration) * c.width;
            const y = c.height - (kf.value / 100) * c.height;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            // Draw Point
            ctx.fillStyle = '#fff';
            ctx.fillRect(x - 3, y - 3, 6, 6);
        });
        ctx.stroke();
    }

    handleKeyframeClick(e) {
        if (!this.selectedClip) return;
        const rect = this.ui.keyframeCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const time = (x / rect.width) * this.selectedClip.duration;
        const val = 100 - (y / rect.height) * 100;

        this.selectedClip.keyframes.push(new Keyframe(time, Math.max(0, Math.min(100, val))));
        this.renderKeyframeGraph();
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        document.getElementById('btn-play').innerHTML = this.isPlaying ? '<i class="ri-pause-fill"></i>' : '<i class="ri-play-fill"></i>';
    }

    seekToPixels(px) {
        const seconds = px / this.zoom;
        this.playhead = Math.floor(seconds * FPS);
        this.updateUI();
        this.renderKeyframeGraph();
    }

    loop() {
        if (this.isPlaying) {
            this.playhead++;
            if (this.playhead > this.duration) {
                this.isPlaying = false;
                this.togglePlay();
            }
            this.updateUI(true);
        }

        this.renderPreview();
        requestAnimationFrame(() => this.loop());
    }

    updateUI(autoScroll = false) {
        this.ui.timeDisplay.innerText = Timecode.framesToTime(this.playhead);

        const px = (this.playhead / FPS) * this.zoom;
        this.ui.playheadLine.style.transform = `translateX(${px}px)`;

        if (autoScroll) {
            const viewW = this.ui.timelineScroll.clientWidth;
            if (px > this.ui.timelineScroll.scrollLeft + viewW || px < this.ui.timelineScroll.scrollLeft) {
                this.ui.timelineScroll.scrollLeft = px - viewW / 2;
            }
        }
    }

    renderPreview() {
        // Simple Render Engine
        const ctx = this.ctxPreview;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Render Video Layers
        // Tracks sorted 0..N, render lower tracks first? Or higher? Usually upper tracks cover lower.
        // We will render Track[0] first, then Track[1] on top.
        // Actually, in array, usually index 0 is V2 (top), index 1 is V1 (bottom).
        // Let's iterate reverse to draw bottom-up.

        for (let i = this.tracks.length - 1; i >= 0; i--) {
            const track = this.tracks[i];
            if (track.type !== 'video') continue;

            // Find active clip
            const clip = track.clips.find(c => this.playhead >= c.start && this.playhead < c.start + c.duration);
            if (clip) {
                const clipLocalTime = this.playhead - clip.start;
                // Get Opacity from Keyframes
                const opacity = this.getInterpolatedValue(clip, clipLocalTime) / 100;

                ctx.globalAlpha = opacity;

                // Draw simulated content
                ctx.fillStyle = clip.color;
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                // Content
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 40px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(clip.name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

                ctx.font = '20px Monospace';
                ctx.fillText(`F: ${Math.floor(clip.offset + clipLocalTime)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

                // Motion
                const xPos = (clipLocalTime * 5) % CANVAS_WIDTH;
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(xPos, CANVAS_HEIGHT - 50, 50, 50);

                ctx.globalAlpha = 1.0;
            }
        }
    }

    getInterpolatedValue(clip, time) {
        if (!clip.keyframes.length) return 100;

        // Exact
        const exact = clip.keyframes.find(k => k.time === time);
        if (exact) return exact.value;

        // Linear Interpolation
        // Find Prev and Next
        const sorted = [...clip.keyframes].sort((a, b) => a.time - b.time);

        // If before first
        if (time < sorted[0].time) return sorted[0].value;
        // If after last
        if (time > sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;

        for (let i = 0; i < sorted.length - 1; i++) {
            if (time >= sorted[i].time && time <= sorted[i + 1].time) {
                const k1 = sorted[i];
                const k2 = sorted[i + 1];
                const range = k2.time - k1.time;
                const ratio = (time - k1.time) / range;
                return k1.value + (k2.value - k1.value) * ratio;
            }
        }
        return 100;
    }
}

const app = new Editor();
