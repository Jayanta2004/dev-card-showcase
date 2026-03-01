        const instruments = document.querySelectorAll('.instrument');
        const musicRoll = document.getElementById('musicRoll');
        let isPlaying = false;
        let tempo = 120;
        
        const notes = ['♪', '♫', '♩', '♬', '🎵', '🎶'];
        const melodies = {
            piano: ['do', 're', 'mi', 'fa', 'sol', 'la', 'ti'],
            violin: ['♫—♫—', '—♫—♫', '♫♫——'],
            drum: ['boom', 'tss', 'bam', 'pow'],
            flute: ['♩♪♫', '♪♫♩', '♫♩♪'],
            harp: ['✨', '💫', '⭐', '🌟'],
            bell: ['ding', 'dong', 'ding-dong']
        };
        
        function playNote() {
            if (!isPlaying) return;
            
            // Create floating note
            const note = document.createElement('span');
            note.className = 'note';
            note.textContent = notes[Math.floor(Math.random() * notes.length)];
            note.style.top = Math.random() * 80 + '%';
            note.style.animationDuration = (3 - tempo/200) + 's';
            musicRoll.appendChild(note);
            
            // Remove note after animation
            setTimeout(() => note.remove(), 3000);
            
            // Play active instruments
            instruments.forEach(instrument => {
                if (instrument.classList.contains('playing')) {
                    const instrumentName = instrument.dataset.instrument;
                    const slider = instrument.querySelector('input');
                    const volume = slider.value / 100;
                    
                    // Show instrument-specific note
                    const melody = melodies[instrumentName];
                    if (melody) {
                        const melodyNote = document.createElement('span');
                        melodyNote.className = 'note';
                        melodyNote.textContent = melody[Math.floor(Math.random() * melody.length)];
                        melodyNote.style.top = Math.random() * 80 + '%';
                        melodyNote.style.color = `hsl(${volume * 360}, 80%, 70%)`;
                        musicRoll.appendChild(melodyNote);
                        setTimeout(() => melodyNote.remove(), 3000);
                    }
                }
            });
            
            // Schedule next note
            setTimeout(playNote, 60000 / tempo);
        }
        
        instruments.forEach(instrument => {
            instrument.addEventListener('click', () => {
                instrument.classList.toggle('playing');
            });
        });
        
        document.getElementById('playBtn').addEventListener('click', () => {
            if (!isPlaying) {
                isPlaying = true;
                playNote();
                musicRoll.innerHTML = '🎼 the orchestra begins... 🎼';
            }
        });
        
        document.getElementById('stopBtn').addEventListener('click', () => {
            isPlaying = false;
            musicRoll.innerHTML = 'the clockwork orchestra rests...';
        });
        
        document.getElementById('tempoBtn').addEventListener('click', () => {
            tempo = Math.min(200, tempo + 20);
            musicRoll.innerHTML = `tempo increased to ${tempo} BPM`;
        });