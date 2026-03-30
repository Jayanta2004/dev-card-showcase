document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let isRecording = false;
    let recordingStartTime = null;
    let recordingTimer = null;
    let events = [];
    let recordings = JSON.parse(localStorage.getItem('multimodalRecordings') || '[]');
    let currentPlayback = null;
    let playbackSpeed = 1;
    let isPlaying = false;
    let playbackTimer = null;
    let currentPlaybackTime = 0;
    let settings = {
        maxRecordingTime: 10,
        bufferSize: 1000,
        autoSave: false,
        mouseThreshold: 5,
        touchSensitivity: 1,
        voiceThreshold: 30,
        showHeatmap: true,
        showTrails: true,
        trailLength: 50
    };

    // DOM elements
    const startCaptureBtn = document.getElementById('startCapture');
    const stopCaptureBtn = document.getElementById('stopCapture');
    const clearCaptureBtn = document.getElementById('clearCapture');
    const statusText = document.getElementById('statusText');
    const recordingTimeEl = document.getElementById('recordingTime');
    const keyboardMode = document.getElementById('keyboardMode');
    const mouseMode = document.getElementById('mouseMode');
    const touchMode = document.getElementById('touchMode');
    const voiceMode = document.getElementById('voiceMode');
    const interactionZone = document.getElementById('interactionZone');
    const eventsLog = document.getElementById('eventsLog');
    const playRecordingBtn = document.getElementById('playRecording');
    const pauseRecordingBtn = document.getElementById('pauseRecording');
    const stopPlaybackBtn = document.getElementById('stopPlayback');
    const playbackSpeedEl = document.getElementById('playbackSpeed');
    const speedLabel = document.getElementById('speedLabel');
    const playbackCanvas = document.getElementById('playbackCanvas');
    const timelineProgress = document.getElementById('timelineProgress');
    const timelineMarkers = document.getElementById('timelineMarkers');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const recordingsList = document.getElementById('recordingsList');
    const analysisType = document.getElementById('analysisType');
    const runAnalysisBtn = document.getElementById('runAnalysis');
    const exportAnalysisBtn = document.getElementById('exportAnalysis');
    const analysisChart = document.getElementById('analysisChart');
    const totalEventsEl = document.getElementById('totalEvents');
    const sessionDurationEl = document.getElementById('sessionDuration');
    const avgIntervalEl = document.getElementById('avgInterval');
    const peakActivityEl = document.getElementById('peakActivity');
    const insightsList = document.getElementById('insightsList');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const saveModal = document.getElementById('saveModal');
    const confirmModal = document.getElementById('confirmModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const saveRecordingBtn = document.getElementById('saveRecording');
    const confirmYesBtn = document.getElementById('confirmYes');

    // Settings elements
    const maxRecordingTimeEl = document.getElementById('maxRecordingTime');
    const bufferSizeEl = document.getElementById('bufferSize');
    const autoSaveEl = document.getElementById('autoSave');
    const mouseThresholdEl = document.getElementById('mouseThreshold');
    const mouseThresholdValue = document.getElementById('mouseThresholdValue');
    const touchSensitivityEl = document.getElementById('touchSensitivity');
    const touchSensitivityValue = document.getElementById('touchSensitivityValue');
    const voiceThresholdEl = document.getElementById('voiceThreshold');
    const voiceThresholdValue = document.getElementById('voiceThresholdValue');
    const showHeatmapEl = document.getElementById('showHeatmap');
    const showTrailsEl = document.getElementById('showTrails');
    const trailLengthEl = document.getElementById('trailLength');
    const trailLengthValue = document.getElementById('trailLengthValue');
    const exportSettingsBtn = document.getElementById('exportSettings');
    const importSettingsBtn = document.getElementById('importSettings');
    const resetSettingsBtn = document.getElementById('resetSettings');

    // Canvas context
    const canvas = playbackCanvas.getContext('2d');

    // Initialize the application
    initializeApp();

    function initializeApp() {
        loadSettings();
        setupEventListeners();
        setupCanvas();
        renderRecordingsList();
        updateUI();
    }

    function setupEventListeners() {
        // Capture controls
        startCaptureBtn.addEventListener('click', startCapture);
        stopCaptureBtn.addEventListener('click', stopCapture);
        clearCaptureBtn.addEventListener('click', clearCapture);

        // Input mode toggles
        keyboardMode.addEventListener('change', updateInputModes);
        mouseMode.addEventListener('change', updateInputModes);
        touchMode.addEventListener('change', updateInputModes);
        voiceMode.addEventListener('change', updateInputModes);

        // Playback controls
        playRecordingBtn.addEventListener('click', togglePlayback);
        pauseRecordingBtn.addEventListener('click', togglePlayback);
        stopPlaybackBtn.addEventListener('click', stopPlayback);
        playbackSpeedEl.addEventListener('input', updatePlaybackSpeed);

        // Timeline
        document.querySelector('.timeline-bar').addEventListener('click', seekPlayback);

        // Analysis
        runAnalysisBtn.addEventListener('click', runAnalysis);
        exportAnalysisBtn.addEventListener('click', exportAnalysis);

        // Tabs
        tabButtons.forEach(button => {
            button.addEventListener('click', switchTab);
        });

        // Modals
        closeModalButtons.forEach(button => {
            button.addEventListener('click', closeModals);
        });
        saveRecordingBtn.addEventListener('click', saveRecording);
        confirmYesBtn.addEventListener('click', confirmAction);

        // Settings
        maxRecordingTimeEl.addEventListener('change', updateMaxRecordingTime);
        bufferSizeEl.addEventListener('change', updateBufferSize);
        autoSaveEl.addEventListener('change', updateAutoSave);
        mouseThresholdEl.addEventListener('input', updateMouseThreshold);
        touchSensitivityEl.addEventListener('input', updateTouchSensitivity);
        voiceThresholdEl.addEventListener('input', updateVoiceThreshold);
        showHeatmapEl.addEventListener('change', updateShowHeatmap);
        showTrailsEl.addEventListener('change', updateShowTrails);
        trailLengthEl.addEventListener('input', updateTrailLength);
        exportSettingsBtn.addEventListener('click', exportSettings);
        importSettingsBtn.addEventListener('click', importSettings);
        resetSettingsBtn.addEventListener('click', resetSettings);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);

        // Input event listeners
        setupInputListeners();
    }

    function setupInputListeners() {
        // Keyboard events
        document.addEventListener('keydown', handleKeyboardEvent);
        document.addEventListener('keyup', handleKeyboardEvent);

        // Mouse events
        interactionZone.addEventListener('mousedown', handleMouseEvent);
        interactionZone.addEventListener('mouseup', handleMouseEvent);
        interactionZone.addEventListener('mousemove', handleMouseMove);
        interactionZone.addEventListener('click', handleMouseEvent);

        // Touch events
        interactionZone.addEventListener('touchstart', handleTouchEvent);
        interactionZone.addEventListener('touchend', handleTouchEvent);
        interactionZone.addEventListener('touchmove', handleTouchMove);

        // Voice events (simplified - would need Web Audio API for real implementation)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            setupVoiceRecognition();
        }
    }

    function setupVoiceRecognition() {
        // This is a simplified implementation
        // In a real app, you'd use Web Speech API or similar
        let recognition = null;

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = function(event) {
                if (isRecording && voiceMode.checked) {
                    const result = event.results[event.results.length - 1];
                    if (result.isFinal) {
                        addEvent('voice', {
                            transcript: result[0].transcript,
                            confidence: result[0].confidence
                        });
                    }
                }
            };

            voiceMode.addEventListener('change', function() {
                if (this.checked && isRecording) {
                    recognition.start();
                } else {
                    recognition.stop();
                }
            });
        }
    }

    function handleKeyboardEvent(event) {
        if (!isRecording || !keyboardMode.checked) return;

        addEvent('keyboard', {
            type: event.type,
            key: event.key,
            code: event.code,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey
        });
    }

    function handleMouseEvent(event) {
        if (!isRecording || !mouseMode.checked) return;

        const rect = interactionZone.getBoundingClientRect();
        addEvent('mouse', {
            type: event.type,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            button: event.button,
            buttons: event.buttons
        });
    }

    let lastMousePos = null;
    function handleMouseMove(event) {
        if (!isRecording || !mouseMode.checked) return;

        const rect = interactionZone.getBoundingClientRect();
        const currentPos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        if (!lastMousePos || getDistance(lastMousePos, currentPos) > settings.mouseThreshold) {
            addEvent('mouse', {
                type: 'mousemove',
                x: currentPos.x,
                y: currentPos.y
            });
            lastMousePos = currentPos;

            if (settings.showTrails) {
                addInputTrail(currentPos.x, currentPos.y);
            }
        }
    }

    function handleTouchEvent(event) {
        if (!isRecording || !touchMode.checked) return;

        event.preventDefault();
        const rect = interactionZone.getBoundingClientRect();
        const touches = Array.from(event.touches).map(touch => ({
            id: touch.identifier,
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        }));

        addEvent('touch', {
            type: event.type,
            touches: touches
        });
    }

    function handleTouchMove(event) {
        if (!isRecording || !touchMode.checked) return;

        event.preventDefault();
        const rect = interactionZone.getBoundingClientRect();
        const touches = Array.from(event.touches).map(touch => ({
            id: touch.identifier,
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        }));

        addEvent('touch', {
            type: 'touchmove',
            touches: touches
        });
    }

    function addEvent(type, data) {
        const event = {
            id: generateId(),
            timestamp: Date.now(),
            type: type,
            data: data
        };

        events.push(event);

        // Limit buffer size
        if (events.length > settings.bufferSize) {
            events.shift();
        }

        updateEventsLog();
    }

    function addInputTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'input-trail';
        trail.style.left = x + 'px';
        trail.style.top = y + 'px';
        trail.style.backgroundColor = getEventColor('mouse');
        interactionZone.appendChild(trail);

        setTimeout(() => {
            trail.remove();
        }, settings.trailLength);
    }

    function updateEventsLog() {
        eventsLog.innerHTML = '';
        const recentEvents = events.slice(-20); // Show last 20 events

        recentEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';

            const timestamp = new Date(event.timestamp).toLocaleTimeString();
            const typeLabel = getEventTypeLabel(event.type);
            const dataPreview = getEventDataPreview(event);

            eventItem.innerHTML = `
                <span class="event-type ${event.type}">${typeLabel}</span>
                <span>${timestamp}</span>
                <span>${dataPreview}</span>
            `;

            eventsLog.appendChild(eventItem);
        });

        eventsLog.scrollTop = eventsLog.scrollHeight;
    }

    function getEventTypeLabel(type) {
        const labels = {
            keyboard: '⌨️ Keyboard',
            mouse: '🖱️ Mouse',
            touch: '👆 Touch',
            voice: '🎤 Voice'
        };
        return labels[type] || type;
    }

    function getEventDataPreview(event) {
        switch (event.type) {
            case 'keyboard':
                return `${event.data.type}: ${event.data.key}`;
            case 'mouse':
                return `${event.data.type}: (${Math.round(event.data.x)}, ${Math.round(event.data.y)})`;
            case 'touch':
                return `${event.data.type}: ${event.data.touches.length} touch(es)`;
            case 'voice':
                return `Transcript: ${event.data.transcript.substring(0, 20)}...`;
            default:
                return JSON.stringify(event.data).substring(0, 30) + '...';
        }
    }

    function getEventColor(type) {
        const colors = {
            keyboard: '#1976d2',
            mouse: '#7b1fa2',
            touch: '#388e3c',
            voice: '#f57c00'
        };
        return colors[type] || '#666';
    }

    function startCapture() {
        if (isRecording) return;

        isRecording = true;
        recordingStartTime = Date.now();
        events = [];

        updateUI();
        startRecordingTimer();

        // Start voice recognition if enabled
        if (voiceMode.checked && 'webkitSpeechRecognition' in window) {
            // Voice recognition would start here
        }

        showToast('Recording started', 'success');
    }

    function stopCapture() {
        if (!isRecording) return;

        isRecording = false;
        clearInterval(recordingTimer);

        updateUI();

        if (settings.autoSave && events.length > 0) {
            autoSaveRecording();
        } else if (events.length > 0) {
            showSaveModal();
        }

        showToast('Recording stopped', 'warning');
    }

    function clearCapture() {
        showConfirmModal('Are you sure you want to clear all captured events?', () => {
            events = [];
            updateEventsLog();
            showToast('Events cleared', 'warning');
        });
    }

    function startRecordingTimer() {
        recordingTimer = setInterval(() => {
            const elapsed = Date.now() - recordingStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;

            recordingTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

            // Auto-stop if max time reached
            if (seconds >= settings.maxRecordingTime * 60) {
                stopCapture();
            }
        }, 1000);
    }

    function updateUI() {
        startCaptureBtn.disabled = isRecording;
        stopCaptureBtn.disabled = !isRecording;
        playRecordingBtn.disabled = events.length === 0;
        pauseRecordingBtn.disabled = events.length === 0;
        stopPlaybackBtn.disabled = events.length === 0;

        statusText.textContent = isRecording ? 'Recording...' : 'Ready to capture';
        interactionZone.classList.toggle('recording', isRecording);
    }

    function updateInputModes() {
        // Update event listeners based on mode toggles
        // This is handled by the individual event handlers checking the mode
    }

    function showSaveModal() {
        document.getElementById('recordingName').value = `Recording ${new Date().toLocaleString()}`;
        document.getElementById('recordingDescription').value = '';
        saveModal.classList.add('show');
    }

    function saveRecording() {
        const name = document.getElementById('recordingName').value.trim();
        const description = document.getElementById('recordingDescription').value.trim();

        if (!name) {
            showToast('Please enter a recording name', 'error');
            return;
        }

        const recording = {
            id: generateId(),
            name: name,
            description: description,
            timestamp: recordingStartTime,
            duration: Date.now() - recordingStartTime,
            events: [...events],
            metadata: {
                userAgent: navigator.userAgent,
                screenSize: `${screen.width}x${screen.height}`,
                modes: {
                    keyboard: keyboardMode.checked,
                    mouse: mouseMode.checked,
                    touch: touchMode.checked,
                    voice: voiceMode.checked
                }
            }
        };

        recordings.push(recording);
        saveRecordingsToStorage();
        renderRecordingsList();

        closeModals();
        showToast('Recording saved successfully!', 'success');
    }

    function autoSaveRecording() {
        const recording = {
            id: generateId(),
            name: `Auto-saved ${new Date().toLocaleString()}`,
            description: 'Automatically saved recording',
            timestamp: recordingStartTime,
            duration: Date.now() - recordingStartTime,
            events: [...events],
            metadata: {
                userAgent: navigator.userAgent,
                screenSize: `${screen.width}x${screen.height}`,
                modes: {
                    keyboard: keyboardMode.checked,
                    mouse: mouseMode.checked,
                    touch: touchMode.checked,
                    voice: voiceMode.checked
                }
            }
        };

        recordings.push(recording);
        saveRecordingsToStorage();
        renderRecordingsList();
    }

    function saveRecordingsToStorage() {
        localStorage.setItem('multimodalRecordings', JSON.stringify(recordings));
    }

    function renderRecordingsList() {
        recordingsList.innerHTML = '';

        if (recordings.length === 0) {
            recordingsList.innerHTML = '<p>No recordings saved yet.</p>';
            return;
        }

        recordings.forEach(recording => {
            const card = document.createElement('div');
            card.className = 'recording-card';
            card.onclick = () => loadRecording(recording);

            const date = new Date(recording.timestamp).toLocaleDateString();
            const time = new Date(recording.timestamp).toLocaleTimeString();
            const duration = formatDuration(recording.duration);

            card.innerHTML = `
                <h4>${recording.name}</h4>
                <div class="meta">
                    <div>${date} ${time}</div>
                    <div>${recording.events.length} events • ${duration}</div>
                </div>
                <div class="actions">
                    <button onclick="event.stopPropagation(); playRecording('${recording.id}')">Play</button>
                    <button onclick="event.stopPropagation(); deleteRecording('${recording.id}')">Delete</button>
                </div>
            `;

            recordingsList.appendChild(card);
        });
    }

    function loadRecording(recording) {
        currentPlayback = recording;
        events = [...recording.events];
        updateEventsLog();
        updatePlaybackUI();
        switchTab({ target: { dataset: { tab: 'playback' } } });
        showToast('Recording loaded', 'success');
    }

    // Global functions for onclick handlers
    window.playRecording = function(recordingId) {
        const recording = recordings.find(r => r.id === recordingId);
        if (recording) {
            loadRecording(recording);
            startPlayback();
        }
    };

    window.deleteRecording = function(recordingId) {
        showConfirmModal('Are you sure you want to delete this recording?', () => {
            recordings = recordings.filter(r => r.id !== recordingId);
            saveRecordingsToStorage();
            renderRecordingsList();
            showToast('Recording deleted', 'warning');
        });
    };

    function startPlayback() {
        if (!currentPlayback || isPlaying) return;

        isPlaying = true;
        currentPlaybackTime = 0;
        const startTime = currentPlayback.events[0]?.timestamp || Date.now();

        playbackTimer = setInterval(() => {
            currentPlaybackTime += (1000 / playbackSpeed);

            const currentEvents = currentPlayback.events.filter(event =>
                event.timestamp <= startTime + currentPlaybackTime
            );

            renderPlayback(currentEvents);

            const progress = (currentPlaybackTime / currentPlayback.duration) * 100;
            timelineProgress.style.width = progress + '%';

            updatePlaybackTimeDisplay();

            if (currentPlaybackTime >= currentPlayback.duration) {
                stopPlayback();
            }
        }, 1000 / 60); // 60 FPS

        updatePlaybackButtons();
    }

    function pausePlayback() {
        isPlaying = false;
        clearInterval(playbackTimer);
        updatePlaybackButtons();
    }

    function stopPlayback() {
        isPlaying = false;
        clearInterval(playbackTimer);
        currentPlaybackTime = 0;
        timelineProgress.style.width = '0%';
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        updatePlaybackTimeDisplay();
        updatePlaybackButtons();
    }

    function togglePlayback() {
        if (isPlaying) {
            pausePlayback();
        } else {
            startPlayback();
        }
    }

    function updatePlaybackSpeed() {
        playbackSpeed = parseFloat(playbackSpeedEl.value);
        speedLabel.textContent = playbackSpeed + 'x';

        if (isPlaying) {
            // Restart playback with new speed
            stopPlayback();
            startPlayback();
        }
    }

    function seekPlayback(event) {
        if (!currentPlayback) return;

        const rect = event.target.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;

        currentPlaybackTime = percentage * currentPlayback.duration;

        if (isPlaying) {
            // Restart playback from new position
            stopPlayback();
            startPlayback();
        } else {
            // Update display for paused state
            const currentEvents = currentPlayback.events.filter(event =>
                event.timestamp <= currentPlayback.events[0].timestamp + currentPlaybackTime
            );
            renderPlayback(currentEvents);
            timelineProgress.style.width = (percentage * 100) + '%';
            updatePlaybackTimeDisplay();
        }
    }

    function updatePlaybackButtons() {
        playRecordingBtn.style.display = isPlaying ? 'none' : 'inline-flex';
        pauseRecordingBtn.style.display = isPlaying ? 'inline-flex' : 'none';
    }

    function updatePlaybackUI() {
        if (currentPlayback) {
            totalTimeEl.textContent = formatDuration(currentPlayback.duration);
            updatePlaybackTimeDisplay();
            renderTimelineMarkers();
        }
    }

    function updatePlaybackTimeDisplay() {
        currentTimeEl.textContent = formatDuration(currentPlaybackTime);
    }

    function renderTimelineMarkers() {
        timelineMarkers.innerHTML = '';

        // Add markers for different event types
        const eventTypes = [...new Set(currentPlayback.events.map(e => e.type))];

        eventTypes.forEach(type => {
            const typeEvents = currentPlayback.events.filter(e => e.type === type);
            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            marker.style.left = ((typeEvents[0].timestamp - currentPlayback.events[0].timestamp) / currentPlayback.duration * 100) + '%';
            marker.style.backgroundColor = getEventColor(type);
            marker.title = `${type} events`;
            timelineMarkers.appendChild(marker);
        });
    }

    function renderPlayback(currentEvents) {
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

        // Draw interaction zone background
        canvas.fillStyle = '#f8f9fa';
        canvas.fillRect(0, 0, canvas.canvas.width, canvas.canvas.height);

        // Draw events
        currentEvents.forEach(event => {
            drawEvent(event);
        });
    }

    function drawEvent(event) {
        canvas.fillStyle = getEventColor(event.type);
        canvas.globalAlpha = 0.7;

        switch (event.type) {
            case 'mouse':
                if (event.data.x !== undefined && event.data.y !== undefined) {
                    canvas.beginPath();
                    canvas.arc(event.data.x, event.data.y, 3, 0, 2 * Math.PI);
                    canvas.fill();
                }
                break;
            case 'touch':
                event.data.touches.forEach(touch => {
                    canvas.beginPath();
                    canvas.arc(touch.x, touch.y, 5, 0, 2 * Math.PI);
                    canvas.fill();
                });
                break;
            case 'keyboard':
                // Draw keyboard events as small rectangles at random positions
                const x = Math.random() * canvas.canvas.width;
                const y = Math.random() * canvas.canvas.height;
                canvas.fillRect(x - 10, y - 5, 20, 10);
                break;
            case 'voice':
                // Draw voice events as waves
                const centerX = canvas.canvas.width / 2;
                const centerY = canvas.canvas.height / 2;
                canvas.beginPath();
                canvas.arc(centerX, centerY, 20, 0, 2 * Math.PI);
                canvas.fill();
                break;
        }

        canvas.globalAlpha = 1;
    }

    function setupCanvas() {
        const rect = playbackCanvas.getBoundingClientRect();
        playbackCanvas.width = rect.width;
        playbackCanvas.height = rect.height;
    }

    function runAnalysis() {
        if (events.length === 0) {
            showToast('No events to analyze', 'warning');
            return;
        }

        const analysisTypeValue = analysisType.value;
        let analysisResult = {};

        switch (analysisTypeValue) {
            case 'timeline':
                analysisResult = analyzeTimeline();
                break;
            case 'frequency':
                analysisResult = analyzeFrequency();
                break;
            case 'correlation':
                analysisResult = analyzeCorrelation();
                break;
            case 'patterns':
                analysisResult = analyzePatterns();
                break;
        }

        displayAnalysisResults(analysisResult);
        renderAnalysisChart(analysisResult);
    }

    function analyzeTimeline() {
        const startTime = events[0]?.timestamp || 0;
        const endTime = events[events.length - 1]?.timestamp || 0;
        const duration = endTime - startTime;

        const timeBuckets = {};
        const bucketSize = duration / 20; // 20 buckets

        events.forEach(event => {
            const bucket = Math.floor((event.timestamp - startTime) / bucketSize);
            timeBuckets[bucket] = (timeBuckets[bucket] || 0) + 1;
        });

        return {
            type: 'timeline',
            duration: duration,
            buckets: timeBuckets,
            totalEvents: events.length,
            avgInterval: duration / events.length
        };
    }

    function analyzeFrequency() {
        const frequencies = {};
        events.forEach(event => {
            frequencies[event.type] = (frequencies[event.type] || 0) + 1;
        });

        return {
            type: 'frequency',
            frequencies: frequencies,
            totalEvents: events.length
        };
    }

    function analyzeCorrelation() {
        // Simple correlation analysis between event types
        const correlations = {};
        const types = [...new Set(events.map(e => e.type))];

        types.forEach(type1 => {
            correlations[type1] = {};
            types.forEach(type2 => {
                const events1 = events.filter(e => e.type === type1);
                const events2 = events.filter(e => e.type === type2);

                if (events1.length > 0 && events2.length > 0) {
                    // Simple proximity correlation
                    let correlation = 0;
                    events1.forEach(e1 => {
                        events2.forEach(e2 => {
                            const timeDiff = Math.abs(e1.timestamp - e2.timestamp);
                            if (timeDiff < 1000) { // Within 1 second
                                correlation++;
                            }
                        });
                    });
                    correlations[type1][type2] = correlation / Math.max(events1.length, events2.length);
                }
            });
        });

        return {
            type: 'correlation',
            correlations: correlations
        };
    }

    function analyzePatterns() {
        // Simple pattern detection
        const patterns = [];
        const sequences = [];

        // Look for repeated sequences
        for (let i = 0; i < events.length - 2; i++) {
            const sequence = [events[i].type, events[i+1].type, events[i+2].type];
            sequences.push(sequence.join('-'));
        }

        const sequenceCounts = {};
        sequences.forEach(seq => {
            sequenceCounts[seq] = (sequenceCounts[seq] || 0) + 1;
        });

        Object.entries(sequenceCounts).forEach(([seq, count]) => {
            if (count > 1) {
                patterns.push({ sequence: seq, count: count });
            }
        });

        return {
            type: 'patterns',
            patterns: patterns
        };
    }

    function displayAnalysisResults(result) {
        totalEventsEl.textContent = events.length;
        sessionDurationEl.textContent = formatDuration(result.duration || 0);
        avgIntervalEl.textContent = formatDuration(result.avgInterval || 0);

        // Find peak activity
        if (result.buckets) {
            const peakBucket = Object.entries(result.buckets).reduce((a, b) => 
                result.buckets[a[0]] > result.buckets[b[0]] ? a : b
            );
            const peakTime = (parseInt(peakBucket[0]) * (result.duration / 20));
            peakActivityEl.textContent = formatDuration(peakTime);
        }

        // Generate insights
        insightsList.innerHTML = '';
        generateInsights(result).forEach(insight => {
            const li = document.createElement('li');
            li.textContent = insight;
            insightsList.appendChild(li);
        });
    }

    function generateInsights(result) {
        const insights = [];

        if (result.type === 'frequency') {
            const dominantType = Object.entries(result.frequencies).reduce((a, b) => 
                result.frequencies[a[0]] > result.frequencies[b[0]] ? a : b
            );
            insights.push(`Most frequent input type: ${dominantType[0]} (${dominantType[1]} events)`);
        }

        if (result.type === 'timeline') {
            const avgEventsPerSecond = result.totalEvents / (result.duration / 1000);
            insights.push(`Average events per second: ${avgEventsPerSecond.toFixed(2)}`);
        }

        if (result.type === 'correlation') {
            // Find highest correlation
            let maxCorrelation = 0;
            let correlatedPair = '';
            Object.entries(result.correlations).forEach(([type1, corr]) => {
                Object.entries(corr).forEach(([type2, value]) => {
                    if (value > maxCorrelation && type1 !== type2) {
                        maxCorrelation = value;
                        correlatedPair = `${type1} and ${type2}`;
                    }
                });
            });
            if (correlatedPair) {
                insights.push(`Highest correlation between: ${correlatedPair} (${(maxCorrelation * 100).toFixed(1)}%)`);
            }
        }

        if (result.type === 'patterns') {
            if (result.patterns.length > 0) {
                const topPattern = result.patterns[0];
                insights.push(`Most common pattern: ${topPattern.sequence.replace(/-/g, ' → ')} (repeated ${topPattern.count} times)`);
            }
        }

        return insights;
    }

    function renderAnalysisChart(result) {
        // This would use Chart.js to render different types of charts
        // Simplified implementation
        const ctx = analysisChart.getContext('2d');
        ctx.clearRect(0, 0, analysisChart.width, analysisChart.height);

        // Draw a simple bar chart for frequency analysis
        if (result.type === 'frequency') {
            const types = Object.keys(result.frequencies);
            const values = Object.values(result.frequencies);
            const maxValue = Math.max(...values);

            const barWidth = analysisChart.width / types.length;
            types.forEach((type, index) => {
                const barHeight = (values[index] / maxValue) * (analysisChart.height - 40);
                const x = index * barWidth;
                const y = analysisChart.height - barHeight - 20;

                ctx.fillStyle = getEventColor(type);
                ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(type, x + barWidth / 2, analysisChart.height - 5);
                ctx.fillText(values[index], x + barWidth / 2, y - 5);
            });
        }
    }

    function exportAnalysis() {
        const analysisData = {
            timestamp: new Date().toISOString(),
            events: events,
            analysis: {
                totalEvents: events.length,
                duration: events.length > 0 ? events[events.length - 1].timestamp - events[0].timestamp : 0,
                eventTypes: [...new Set(events.map(e => e.type))],
                frequencies: events.reduce((acc, event) => {
                    acc[event.type] = (acc[event.type] || 0) + 1;
                    return acc;
                }, {})
            }
        };

        const dataStr = JSON.stringify(analysisData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `analysis-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showToast('Analysis exported!', 'success');
    }

    function switchTab(event) {
        const tabId = event.target.dataset.tab;

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        event.target.classList.add('active');
        document.getElementById(tabId + '-tab').classList.add('active');
    }

    function closeModals() {
        saveModal.classList.remove('show');
        confirmModal.classList.remove('show');
    }

    function showConfirmModal(message, onConfirm) {
        document.getElementById('confirmMessage').textContent = message;
        confirmModal.classList.add('show');

        confirmYesBtn.onclick = () => {
            onConfirm();
            closeModals();
        };
    }

    function confirmAction() {
        // Handled by onclick set in showConfirmModal
    }

    function handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'r':
                    event.preventDefault();
                    if (isRecording) stopCapture(); else startCapture();
                    break;
                case 'p':
                    event.preventDefault();
                    togglePlayback();
                    break;
                case 's':
                    event.preventDefault();
                    if (events.length > 0) showSaveModal();
                    break;
            }
        }
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Settings functions
    function loadSettings() {
        const savedSettings = localStorage.getItem('multimodalSettings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        applySettingsToUI();
    }

    function saveSettings() {
        localStorage.setItem('multimodalSettings', JSON.stringify(settings));
    }

    function applySettingsToUI() {
        maxRecordingTimeEl.value = settings.maxRecordingTime;
        bufferSizeEl.value = settings.bufferSize;
        autoSaveEl.checked = settings.autoSave;
        mouseThresholdEl.value = settings.mouseThreshold;
        mouseThresholdValue.textContent = settings.mouseThreshold + 'px';
        touchSensitivityEl.value = settings.touchSensitivity;
        touchSensitivityValue.textContent = settings.touchSensitivity + 'x';
        voiceThresholdEl.value = settings.voiceThreshold;
        voiceThresholdValue.textContent = settings.voiceThreshold + '%';
        showHeatmapEl.checked = settings.showHeatmap;
        showTrailsEl.checked = settings.showTrails;
        trailLengthEl.value = settings.trailLength;
        trailLengthValue.textContent = settings.trailLength;
    }

    function updateMaxRecordingTime() {
        settings.maxRecordingTime = parseInt(maxRecordingTimeEl.value);
        saveSettings();
    }

    function updateBufferSize() {
        settings.bufferSize = parseInt(bufferSizeEl.value);
        saveSettings();
    }

    function updateAutoSave() {
        settings.autoSave = autoSaveEl.checked;
        saveSettings();
    }

    function updateMouseThreshold() {
        settings.mouseThreshold = parseInt(mouseThresholdEl.value);
        mouseThresholdValue.textContent = settings.mouseThreshold + 'px';
        saveSettings();
    }

    function updateTouchSensitivity() {
        settings.touchSensitivity = parseFloat(touchSensitivityEl.value);
        touchSensitivityValue.textContent = settings.touchSensitivity + 'x';
        saveSettings();
    }

    function updateVoiceThreshold() {
        settings.voiceThreshold = parseInt(voiceThresholdEl.value);
        voiceThresholdValue.textContent = settings.voiceThreshold + '%';
        saveSettings();
    }

    function updateShowHeatmap() {
        settings.showHeatmap = showHeatmapEl.checked;
        saveSettings();
    }

    function updateShowTrails() {
        settings.showTrails = showTrails.checked;
        saveSettings();
    }

    function updateTrailLength() {
        settings.trailLength = parseInt(trailLengthEl.value);
        trailLengthValue.textContent = settings.trailLength;
        saveSettings();
    }

    function exportSettings() {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = 'multimodal-settings.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showToast('Settings exported!', 'success');
    }

    function importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSettings = JSON.parse(e.target.result);
                        settings = { ...settings, ...importedSettings };
                        saveSettings();
                        applySettingsToUI();
                        showToast('Settings imported successfully!', 'success');
                    } catch (error) {
                        showToast('Error importing settings: ' + error.message, 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    function resetSettings() {
        showConfirmModal('Are you sure you want to reset all settings to defaults?', () => {
            settings = {
                maxRecordingTime: 10,
                bufferSize: 1000,
                autoSave: false,
                mouseThreshold: 5,
                touchSensitivity: 1,
                voiceThreshold: 30,
                showHeatmap: true,
                showTrails: true,
                trailLength: 50
            };
            saveSettings();
            applySettingsToUI();
            showToast('Settings reset to defaults', 'warning');
        });
    }

    // Utility functions
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function getDistance(pos1, pos2) {
        return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
    }

    // Window resize handler
    window.addEventListener('resize', () => {
        setupCanvas();
    });
});