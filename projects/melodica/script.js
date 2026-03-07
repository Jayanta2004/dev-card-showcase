        (function() {
            // audio context
            let audioContext = null;
            let isPlaying = false;
            let nextNoteTime = 0;
            let timerID = null;
            let currentNoteIndex = 0;

            // scales (note offsets from root)
            const scales = {
                major: [0, 2, 4, 5, 7, 9, 11],
                minor: [0, 2, 3, 5, 7, 8, 10],
                pentatonic: [0, 2, 4, 7, 9],
                blues: [0, 3, 5, 6, 7, 10],
                chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            };

            // state
            let currentScale = 'major';
            let tempo = 120;
            let density = 0.5;
            let complexity = 0.3;
            let arpeggio = 0.3;
            let octaveRange = 2;
            let noteLength = 0.5;
            
            let pattern = ['C4', 'E4', 'G4', 'C5'];
            let noteDurations = [0.5, 0.5, 0.5, 0.5];

            // DOM elements
            const noteIndicator = document.getElementById('noteIndicator');
            const currentNoteEl = document.getElementById('currentNote');
            const patternDisplay = document.getElementById('patternDisplay');
            
            const scaleBtns = document.querySelectorAll('.scale-btn');
            const tempoSlider = document.getElementById('tempo');
            const tempoVal = document.getElementById('tempoVal');
            const densitySlider = document.getElementById('density');
            const densityVal = document.getElementById('densityVal');
            const complexitySlider = document.getElementById('complexity');
            const complexityVal = document.getElementById('complexityVal');
            const arpeggioSlider = document.getElementById('arpeggio');
            const arpeggioVal = document.getElementById('arpeggioVal');
            const octaveSlider = document.getElementById('octave');
            const octaveVal = document.getElementById('octaveVal');
            const noteLengthSlider = document.getElementById('noteLength');
            const lengthVal = document.getElementById('noteLengthVal');
            
            const playBtn = document.getElementById('playBtn');
            const stopBtn = document.getElementById('stopBtn');
            const randomizeBtn = document.getElementById('randomizeBtn');
            const generateBtn = document.getElementById('generateBtn');

            // note frequency mapping
            function noteToFrequency(note) {
                const notes = {
                    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
                    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
                };
                const match = note.match(/([A-G]#?)(\d+)/);
                if (!match) return 440;
                const noteName = match[1];
                const octave = parseInt(match[2]);
                const semitone = notes[noteName];
                return 440 * Math.pow(2, (octave - 4 + (semitone - 9) / 12));
            }

            // generate new pattern
            function generatePattern() {
                const scale = scales[currentScale];
                const patternLength = 4 + Math.floor(complexity * 8);
                const newPattern = [];
                const newDurations = [];
                
                for (let i = 0; i < patternLength; i++) {
                    // pick a note from scale
                    const scaleIndex = Math.floor(Math.random() * scale.length);
                    const semitone = scale[scaleIndex];
                    
                    // determine octave
                    const octaveOffset = Math.floor(Math.random() * octaveRange) - 1;
                    const octave = 4 + octaveOffset;
                    
                    // build note name
                    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                    const noteName = noteNames[semitone % 12];
                    const note = `${noteName}${octave}`;
                    
                    newPattern.push(note);
                    
                    // determine duration based on density and arpeggio
                    let duration = 0.25 + Math.random() * 0.75;
                    if (Math.random() < arpeggio) {
                        duration = 0.125; // shorter for arpeggiated
                    }
                    newDurations.push(duration);
                }
                
                pattern = newPattern;
                noteDurations = newDurations;
                updateDisplay();
            }

            // update visual display
            function updateDisplay() {
                // update pattern text
                patternDisplay.innerText = pattern.join(' ');
                
                // update note indicator bars
                let bars = '';
                for (let i = 0; i < 8; i++) {
                    const height = i < pattern.length ? 60 + Math.random() * 60 : 20;
                    bars += `<div class="note-bar" style="height: ${height}px;"></div>`;
                }
                noteIndicator.innerHTML = bars;
            }

            // audio scheduling
            function scheduleNote() {
                if (!isPlaying) return;
                
                const secondsPerBeat = 60.0 / tempo;
                const note = pattern[currentNoteIndex];
                const duration = noteDurations[currentNoteIndex] * secondsPerBeat * 4;
                
                // play the note
                if (audioContext && note) {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.value = noteToFrequency(note);
                    
                    gain.gain.value = 0.3;
                    
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    
                    osc.start(nextNoteTime);
                    osc.stop(nextNoteTime + duration * noteLength);
                    
                    // update current note display
                    currentNoteEl.innerText = note;
                }
                
                // schedule next note
                nextNoteTime += secondsPerBeat * 4 / pattern.length;
                currentNoteIndex = (currentNoteIndex + 1) % pattern.length;
                
                timerID = setTimeout(scheduleNote, secondsPerBeat * 1000 * 4 / pattern.length);
            }

            // start playback
            function startPlayback() {
                if (!audioContext) {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                
                isPlaying = true;
                nextNoteTime = audioContext.currentTime;
                currentNoteIndex = 0;
                
                scheduleNote();
            }

            // stop playback
            function stopPlayback() {
                isPlaying = false;
                if (timerID) {
                    clearTimeout(timerID);
                    timerID = null;
                }
                currentNoteEl.innerText = '♪';
            }

            // randomize all parameters
            function randomize() {
                const scales = ['major', 'minor', 'pentatonic', 'blues', 'chromatic'];
                currentScale = scales[Math.floor(Math.random() * scales.length)];
                
                scaleBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-scale') === currentScale) {
                        btn.classList.add('active');
                    }
                });
                
                tempo = Math.floor(Math.random() * 120) + 80;
                density = Math.random();
                complexity = Math.random();
                arpeggio = Math.random();
                octaveRange = Math.floor(Math.random() * 3) + 1;
                noteLength = 0.3 + Math.random() * 0.6;
                
                tempoSlider.value = tempo;
                densitySlider.value = density;
                complexitySlider.value = complexity;
                arpeggioSlider.value = arpeggio;
                octaveSlider.value = octaveRange;
                noteLengthSlider.value = noteLength;
                
                tempoVal.innerText = tempo;
                densityVal.innerText = density.toFixed(2);
                complexityVal.innerText = complexity.toFixed(2);
                arpeggioVal.innerText = arpeggio.toFixed(2);
                octaveVal.innerText = octaveRange;
                lengthVal.innerText = noteLength.toFixed(2);
                
                generatePattern();
            }

            // event listeners
            scaleBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    scaleBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentScale = btn.getAttribute('data-scale');
                    generatePattern();
                });
            });

            tempoSlider.addEventListener('input', () => {
                tempo = parseInt(tempoSlider.value);
                tempoVal.innerText = tempo;
            });

            densitySlider.addEventListener('input', () => {
                density = parseFloat(densitySlider.value);
                densityVal.innerText = density.toFixed(2);
            });

            complexitySlider.addEventListener('input', () => {
                complexity = parseFloat(complexitySlider.value);
                complexityVal.innerText = complexity.toFixed(2);
                generatePattern();
            });

            arpeggioSlider.addEventListener('input', () => {
                arpeggio = parseFloat(arpeggioSlider.value);
                arpeggioVal.innerText = arpeggio.toFixed(2);
            });

            octaveSlider.addEventListener('input', () => {
                octaveRange = parseInt(octaveSlider.value);
                octaveVal.innerText = octaveRange;
            });

            noteLengthSlider.addEventListener('input', () => {
                noteLength = parseFloat(noteLengthSlider.value);
                lengthVal.innerText = noteLength.toFixed(2);
            });

            playBtn.addEventListener('click', startPlayback);
            stopBtn.addEventListener('click', stopPlayback);
            randomizeBtn.addEventListener('click', randomize);
            generateBtn.addEventListener('click', generatePattern);

            // initial
            generatePattern();
        })();