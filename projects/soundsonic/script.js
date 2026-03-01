        (function() {
            // ---- web audio setup ----
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            let audioCtx = null;

            // nodes
            let masterGain = null;
            const oscillators = {};  // id => { osc, gain, type, active }
            const sounds = [
                { id: 'drone', label: 'drone', icon: 'fa-solid fa-dharmachakra', baseFreq: 90, type: 'sine' },
                { id: 'pulse', label: 'pulse', icon: 'fa-solid fa-wave-pulse', baseFreq: 140, type: 'triangle' },
                { id: 'tide', label: 'tide', icon: 'fa-solid fa-water', baseFreq: 60, type: 'sine' },
                { id: 'hum', label: 'hum', icon: 'fa-solid fa-bolt', baseFreq: 210, type: 'sawtooth' },
                { id: 'ember', label: 'ember', icon: 'fa-solid fa-fire', baseFreq: 320, type: 'sine' },
                { id: 'crystal', label: 'crystal', icon: 'fa-solid fa-gem', baseFreq: 540, type: 'square' }
            ];

            // UI elements
            const canvas = document.getElementById('visualCanvas');
            const ctx = canvas.getContext('2d');
            const soundGrid = document.getElementById('soundGrid');
            const activeSoundSpan = document.getElementById('activeSoundName');
            const masterVolumeSlider = document.getElementById('masterVolume');
            const statusChip = document.getElementById('statusChip');

            // resize canvas (visual)
            function resizeCanvas() {
                const container = canvas.parentElement;
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
            }
            window.addEventListener('resize', resizeCanvas);
            setTimeout(resizeCanvas, 50);

            // helper to init audio context on first user interaction (tile click)
            function initAudioIfNeeded() {
                if (audioCtx) return true;
                try {
                    audioCtx = new AudioContext();
                    masterGain = audioCtx.createGain();
                    masterGain.gain.value = (masterVolumeSlider.value / 100) * 0.8; // max gain .8 to avoid clipping
                    masterGain.connect(audioCtx.destination);
                    return true;
                } catch (e) {
                    console.warn('audio context error', e);
                    statusChip.innerHTML = '⚠️ audio not supported';
                    return false;
                }
            }

            // start or stop sound based on toggle
            function toggleSound(soundId) {
                if (!initAudioIfNeeded()) return;

                const sound = sounds.find(s => s.id === soundId);
                if (!sound) return;

                // if already active: stop & release
                if (oscillators[soundId] && oscillators[soundId].active) {
                    try {
                        const oscNode = oscillators[soundId];
                        oscNode.osc.stop();
                        oscNode.gain.disconnect();
                        oscNode.active = false;
                        statusChip.innerHTML = `⏹️ ${sound.label} stopped`;
                    } catch (e) {}
                    // remove tile active class
                    document.querySelectorAll('.sound-tile').forEach(t => t.classList.remove('active'));
                    activeSoundSpan.innerText = 'silence';
                    return;
                }

                // else: create new sound
                try {
                    // stop any previously active? we allow multiple? but UI will only have one active for demo (simpler)
                    for (let id in oscillators) {
                        if (oscillators[id].active) {
                            // turn off previous
                            try { oscillators[id].osc.stop(); } catch (e) {}
                            oscillators[id].active = false;
                        }
                    }
                    document.querySelectorAll('.sound-tile').forEach(t => t.classList.remove('active'));

                    const osc = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    osc.type = sound.type;
                    osc.frequency.value = sound.baseFreq;

                    // slight detune for richness
                    osc.detune.value = Math.random() * 10 - 5;

                    gainNode.gain.value = 0.4; // per-sound gain

                    osc.connect(gainNode);
                    gainNode.connect(masterGain);

                    osc.start();
                    oscillators[soundId] = { osc, gain: gainNode, active: true, baseFreq: sound.baseFreq };

                    // activate tile UI
                    document.querySelector(`.sound-tile[data-id="${soundId}"]`).classList.add('active');
                    activeSoundSpan.innerText = sound.label;
                    statusChip.innerHTML = `🎵 playing: ${sound.label} · adjust master`;
                } catch (e) {
                    console.warn(e);
                }
            }

            // build tiles
            sounds.forEach(s => {
                const tile = document.createElement('div');
                tile.className = 'sound-tile';
                tile.dataset.id = s.id;
                tile.innerHTML = `
                    <i class="fas ${s.icon}"></i>
                    <span class="sound-label">${s.label}</span>
                    <div class="sound-meter"><div class="meter-fill" id="meter-${s.id}" style="width:0%"></div></div>
                `;
                tile.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleSound(s.id);
                });
                soundGrid.appendChild(tile);
            });

            // master volume change
            masterVolumeSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) / 100;
                if (masterGain) {
                    masterGain.gain.value = val * 0.8; // smooth
                }
            });

            // ---- canvas animation: reacts to active sound, volume, etc ----
            let timeOffset = 0;
            function drawVisuals() {
                if (!canvas || !ctx) return;

                const w = canvas.width;
                const h = canvas.height;

                // check if any active sound
                let activeCount = 0;
                let totalGain = 0;
                let maxFreq = 200;
                for (let id in oscillators) {
                    if (oscillators[id].active) {
                        activeCount++;
                        totalGain += oscillators[id].gain.gain.value || 0.2;
                        maxFreq = Math.max(maxFreq, oscillators[id].baseFreq || 200);
                    }
                }

                const now = Date.now() / 500;
                const intensity = Math.min(0.8, (totalGain * 0.7) + 0.2);

                // background gradient based on active sound
                let gradient = ctx.createLinearGradient(0, 0, w, h);
                if (activeCount === 0) {
                    gradient.addColorStop(0, '#d9cdc0');
                    gradient.addColorStop(1, '#c6b7a8');
                } else {
                    // colour shift: depends on freq
                    const r = 160 + Math.sin(now * 0.7) * 30 + (maxFreq % 100);
                    const g = 130 + Math.sin(now * 0.9) * 25 + (activeCount * 20);
                    const b = 140 + Math.cos(now * 0.5) * 30;
                    gradient.addColorStop(0, `rgb(${r % 200 + 40}, ${g % 180 + 50}, ${b % 180 + 60})`);
                    gradient.addColorStop(1, `rgb(${r % 180 + 50}, ${g % 160 + 50}, ${b % 160 + 50})`);
                }
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);

                // draw waves (sensory)
                if (activeCount > 0) {
                    ctx.lineWidth = 2 + intensity * 3;
                    ctx.strokeStyle = '#ffffff60';
                    ctx.beginPath();
                    for (let x = 0; x < w; x += 20) {
                        const y = h / 2 + Math.sin(x * 0.02 + now * 3) * (20 * intensity + 10) + Math.cos(x * 0.01 + now) * 15;
                        if (x === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    // second layer
                    ctx.beginPath();
                    ctx.strokeStyle = '#ffffff30';
                    ctx.lineWidth = 4;
                    for (let x = 0; x < w; x += 30) {
                        const y = h / 3 + Math.sin(x * 0.03 + now * 2) * (20 * intensity) + Math.cos(x * 0.02) * 10;
                        if (x === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y + 30);
                    }
                    ctx.stroke();

                    // update fake meters (only aesthetic)
                    sounds.forEach(s => {
                        const meter = document.getElementById(`meter-${s.id}`);
                        if (meter) {
                            if (oscillators[s.id] && oscillators[s.id].active) {
                                meter.style.width = (40 + Math.sin(now * 5 + s.baseFreq) * 20 + 20) + '%';
                            } else {
                                meter.style.width = '0%';
                            }
                        }
                    });
                } else {
                    // draw subtle pattern
                    ctx.fillStyle = '#d4c6b9';
                    ctx.font = "14px 'Inter'";
                    ctx.fillStyle = '#b5a190';
                    ctx.fillText('∥', 30, h-40);
                }

                requestAnimationFrame(drawVisuals);
            }
            requestAnimationFrame(drawVisuals);

            // update overlay based on active
            // also handle volume via slider for already active? can modulate gain later.

            // extra: click outside to stop all (double tap)
            canvas.addEventListener('dblclick', () => {
                for (let id in oscillators) {
                    if (oscillators[id].active) {
                        try { oscillators[id].osc.stop(); } catch (e) {}
                        oscillators[id].active = false;
                    }
                }
                document.querySelectorAll('.sound-tile').forEach(t => t.classList.remove('active'));
                activeSoundSpan.innerText = 'silence';
                statusChip.innerHTML = '👐 all stopped · touch a tile';
            });

            // ensure audio context resumes on any click (browser policy)
            document.body.addEventListener('click', () => {
                if (audioCtx && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
            }, { once: false });

            // init canvas resize
            resizeCanvas();

            // set default status
            activeSoundSpan.innerText = 'silence';
        })();