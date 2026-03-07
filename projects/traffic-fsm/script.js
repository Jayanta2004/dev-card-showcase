        (function() {
            // ---------- TRAFFIC LIGHT FSM ----------
            const TrafficFSM = {
                // States
                states: {
                    GREEN: 'GREEN',
                    YELLOW: 'YELLOW',
                    RED: 'RED',
                    PEDESTRIAN: 'PEDESTRIAN'  // pedestrian crossing phase
                },
                
                current: 'GREEN',
                
                // Transition table
                transitions: {
                    // Normal flow
                    'GREEN_TIMER': 'YELLOW',
                    'YELLOW_TIMER': 'RED',
                    'RED_TIMER': 'GREEN',
                    
                    // Pedestrian request (only from GREEN)
                    'GREEN_PEDESTRIAN': 'PEDESTRIAN',
                    
                    // From PEDESTRIAN, timer goes to RED (then normal cycle)
                    'PEDESTRIAN_TIMER': 'RED',
                    
                    // Emergency override: from any state to RED
                    'GREEN_EMERGENCY': 'RED',
                    'YELLOW_EMERGENCY': 'RED',
                    'RED_EMERGENCY': 'RED',
                    'PEDESTRIAN_EMERGENCY': 'RED',
                    
                    // Additional: pedestrian can't be requested during pedestrian phase (but we can ignore or go nowhere)
                    // Also, pedestrian from YELLOW/RED invalid -> stay
                },
                
                dispatch(event) {
                    const from = this.current;
                    const key = `${from}_${event}`;
                    
                    if (this.transitions.hasOwnProperty(key)) {
                        return this.transitions[key];
                    }
                    return from; // invalid transition
                },
                
                send(event) {
                    const before = this.current;
                    const after = this.dispatch(event);
                    this.current = after;
                    
                    // For animation: if changed, return true
                    return { changed: before !== after, from: before, to: after };
                },
                
                reset() {
                    this.current = 'GREEN';
                    return this.current;
                }
            };

            // ---------- DOM elements ----------
            const redLight = document.getElementById('lightRed');
            const yellowLight = document.getElementById('lightYellow');
            const greenLight = document.getElementById('lightGreen');
            const pedLight = document.getElementById('lightPed');
            const phaseDisplay = document.getElementById('phaseDisplay');
            const timerProgress = document.getElementById('timerProgress');
            
            const btnTimer = document.getElementById('btnTimer');
            const btnPedestrian = document.getElementById('btnPedestrian');
            const btnEmergency = document.getElementById('btnEmergency');
            const btnReset = document.getElementById('btnReset');

            // Timer simulation (auto progress bar)
            let timerInterval = null;
            let timeRemaining = 0;        // seconds
            const MAX_TIME = 5;            // 5 seconds per phase (except pedestrian shorter)
            let currentPhaseDuration = MAX_TIME;

            // Helper: map state to active light
            function updateLights() {
                const state = TrafficFSM.current;
                
                // Remove all active classes
                redLight.classList.remove('active');
                yellowLight.classList.remove('active');
                greenLight.classList.remove('active');
                pedLight.classList.remove('active');
                
                // Add active class based on state
                switch(state) {
                    case 'GREEN':
                        greenLight.classList.add('active');
                        phaseDisplay.innerText = 'GREEN';
                        currentPhaseDuration = 5;
                        break;
                    case 'YELLOW':
                        yellowLight.classList.add('active');
                        phaseDisplay.innerText = 'YELLOW';
                        currentPhaseDuration = 3; // yellow shorter
                        break;
                    case 'RED':
                        redLight.classList.add('active');
                        phaseDisplay.innerText = 'RED';
                        currentPhaseDuration = 4;
                        break;
                    case 'PEDESTRIAN':
                        pedLight.classList.add('active');
                        phaseDisplay.innerText = 'PEDESTRIAN';
                        currentPhaseDuration = 4;
                        break;
                    default: break;
                }
                
                // Reset timer progress bar
                timeRemaining = currentPhaseDuration;
                updateTimerBar();
                
                // Update button enabled states based on valid transitions
                updateButtons();
            }

            // Timer bar update
            function updateTimerBar() {
                const percent = (timeRemaining / currentPhaseDuration) * 100;
                timerProgress.style.width = `${Math.max(0, percent)}%`;
                
                // Color code timer based on phase
                if (TrafficFSM.current === 'GREEN') timerProgress.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
                else if (TrafficFSM.current === 'YELLOW') timerProgress.style.background = 'linear-gradient(90deg, #f1c40f, #e67e22)';
                else if (TrafficFSM.current === 'RED') timerProgress.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
                else timerProgress.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
            }

            // Timer countdown
            function startTimer() {
                if (timerInterval) clearInterval(timerInterval);
                
                timerInterval = setInterval(() => {
                    timeRemaining -= 0.1;
                    
                    if (timeRemaining <= 0) {
                        // Time's up: send TIMER event
                        handleEvent('TIMER');
                    } else {
                        updateTimerBar();
                    }
                }, 100);
            }

            // Stop timer (reset or state change)
            function stopTimer() {
                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
            }

            // Handle FSM events
            function handleEvent(eventType) {
                // Store previous state
                const prevState = TrafficFSM.current;
                
                // Send event to FSM
                const result = TrafficFSM.send(eventType);
                
                // If state changed, update lights and restart timer
                if (result.changed || eventType === 'TIMER') {  // TIMER might stay same if invalid but we check changed
                    updateLights();
                    
                    // Restart timer with new phase duration
                    stopTimer();
                    startTimer();
                    
                    // Optional flash feedback if transition invalid (no change) but we already handle via change
                } else {
                    // Invalid transition: flash current light red
                    const activeLight = getActiveLightElement(prevState);
                    if (activeLight) {
                        activeLight.style.transition = 'background 0.1s, box-shadow 0.1s';
                        activeLight.style.background = '#ff6b6b';
                        activeLight.style.boxShadow = '0 0 60px red';
                        setTimeout(() => {
                            // revert based on actual state
                            updateLights();  // resets to correct colors
                        }, 200);
                    }
                }
            }

            function getActiveLightElement(state) {
                switch(state) {
                    case 'GREEN': return greenLight;
                    case 'YELLOW': return yellowLight;
                    case 'RED': return redLight;
                    case 'PEDESTRIAN': return pedLight;
                    default: return null;
                }
            }

            // Dynamic button disabling (based on valid transitions)
            function updateButtons() {
                const cur = TrafficFSM.current;
                
                // Timer button: enabled if there's a TIMER transition from current state
                const timerValid = TrafficFSM.transitions.hasOwnProperty(`${cur}_TIMER`);
                btnTimer.disabled = !timerValid;
                
                // Pedestrian: only valid from GREEN
                btnPedestrian.disabled = (cur !== 'GREEN');
                
                // Emergency: always enabled (from all states)
                btnEmergency.disabled = false;
            }

            // Reset everything
            function resetToGreen() {
                stopTimer();
                TrafficFSM.reset();
                updateLights();
                startTimer();
            }

            // Initialize
            function init() {
                // Set initial state
                TrafficFSM.current = 'GREEN';
                updateLights();
                startTimer();
                
                // Event listeners
                btnTimer.addEventListener('click', () => handleEvent('TIMER'));
                btnPedestrian.addEventListener('click', () => handleEvent('PEDESTRIAN'));
                btnEmergency.addEventListener('click', () => handleEvent('EMERGENCY'));
                btnReset.addEventListener('click', resetToGreen);
            }

            // Cleanup on page unload
            window.addEventListener('beforeunload', () => stopTimer());

            // Start everything
            init();

            // Add extra safety: if pedestrian active, timer leads to RED, etc.
            // Also handle emergency properly
            // For better UX, we may tweak durations
        })();
    </script>

    <style>
        /* Additional micro-interactions */
        .light {
            transition: background 0.2s, box-shadow 0.2s, border-color 0.2s;
            cursor: pointer;
        }
        .light:hover {
            filter: brightness(1.2);
        }
        #timerProgress {
            transition: width 0.1s linear;
        }
        .traffic-btn {
            transition: transform 0.06s, box-shadow 0.1s, background 0.2s;
        }
        .traffic-btn:hover {
            background: #3a5770;
        }
        .pedestrian-btn:hover {
            background: #3a93d0;
        }