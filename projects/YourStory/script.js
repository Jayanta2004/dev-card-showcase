        // DOM Elements
        const comicPanels = document.querySelectorAll('.comic-panel');
        const dialogueText = document.getElementById('dialogueText');
        const speaker = document.getElementById('speaker');
        const choicesContainer = document.getElementById('choicesContainer');
        const chapterNum = document.getElementById('chapterNum');
        const choiceCount = document.getElementById('choiceCount');
        const pathType = document.getElementById('pathType');
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        const inventoryItems = document.getElementById('inventoryItems');
        const restartBtn = document.getElementById('restartBtn');
        const hintBtn = document.getElementById('hintBtn');

        // Game State
        let currentChapter = 1;
        let choicesMade = 0;
        let playerPath = 'NEUTRAL'; // Can be HEROIC, RUTHLESS, CAUTIOUS, or NEUTRAL
        let inventory = ['Apartment Key', 'Neural Interface'];
        let storyProgress = 0;
        
        // Story data structure
        const storyData = {
            1: {
                title: "The Mysterious Message",
                panels: [
                    { bg: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', text: 'The city of Neo-Tokyo 2049. Mega corporations rule from skyscrapers that pierce the clouds.', character: 'NARRATOR' },
                    { bg: 'linear-gradient(135deg, #333333 0%, #666666 100%)', text: 'You\'re a freelance "data runner" with a mysterious past and cybernetic enhancements.', character: 'YOU' },
                    { bg: 'linear-gradient(135deg, #8b0000 0%, #b22222 100%)', text: 'Your wrist-com buzzes with an urgent message from an anonymous sender.', character: 'MYSTERIOUS CONTACT' },
                    { bg: 'linear-gradient(135deg, #2e8b57 0%, #3cb371 100%)', text: 'The message contains coordinates to a hidden location in the Old City ruins.', character: 'MESSAGE' }
                ],
                dialogue: 'You wake up in your cramped apartment in the Neon District. The rain hasn\'t stopped for weeks. Your wrist-com buzzes with an urgent, encrypted message: "Meet me at the coordinates. Time is running out. Bring your skills and your instincts. - Phoenix"',
                speaker: 'NARRATOR',
                choices: [
                    { text: 'Follow the coordinates to the Old City ruins', icon: 'fa-map-marked-alt', nextChapter: 2, pathEffect: 'HEROIC', inventory: null },
                    { text: 'Investigate the sender first - who is "Phoenix"?', icon: 'fa-user-secret', nextChapter: 3, pathEffect: 'CAUTIOUS', inventory: 'Data Tracker' },
                    { text: 'Visit your tech dealer for upgraded gear first', icon: 'fa-store', nextChapter: 4, pathEffect: 'CAUTIOUS', inventory: 'Grappling Hook' },
                    { text: 'Ignore the message - it\'s probably a trap', icon: 'fa-ignore', nextChapter: 5, pathEffect: 'RUTHLESS', inventory: null }
                ]
            },
            2: {
                title: "Into the Ruins",
                panels: [
                    { bg: 'linear-gradient(135deg, #654321 0%, #8b4513 100%)', text: 'The Old City ruins are overgrown with neon vines and patrolled by security drones.', character: 'NARRATOR' },
                    { bg: 'linear-gradient(135deg, #2f4f4f 0%, #708090 100%)', text: 'You navigate through collapsed buildings, using your cybernetic eyes to scan for threats.', character: 'YOU' },
                    { bg: 'linear-gradient(135deg, #8b0000 0%, #b22222 100%)', text: 'A figure emerges from the shadows - it\'s a woman with glowing cybernetic arms.', character: 'PHOENIX' },
                    { bg: 'linear-gradient(135deg, #4b0082 0%, #9400d3 100%)', text: 'She hands you a data chip containing evidence of corporate corruption.', character: 'PHOENIX' }
                ],
                dialogue: '"I\'m glad you came," says the woman, her voice modulated by a vocal synthesizer. "The corporations are planning something big. This data chip proves it. But we need to move quickly - they\'re already hunting for it."',
                speaker: 'PHOENIX',
                choices: [
                    { text: 'Take the chip and promise to help expose the truth', icon: 'fa-shield-alt', nextChapter: 6, pathEffect: 'HEROIC', inventory: 'Encrypted Data Chip' },
                    { text: 'Demand payment for your services first', icon: 'fa-money-bill-wave', nextChapter: 7, pathEffect: 'RUTHLESS', inventory: 'Credits' },
                    { text: 'Ask for more details about the danger involved', icon: 'fa-question-circle', nextChapter: 8, pathEffect: 'CAUTIOUS', inventory: null },
                    { text: 'Refuse the chip - this is too dangerous', icon: 'fa-running', nextChapter: 5, pathEffect: 'NEUTRAL', inventory: null }
                ]
            },
            3: {
                title: "The Investigation",
                panels: [
                    { bg: 'linear-gradient(135deg, #191970 0%, #4169e1 100%)', text: 'You hack into the city\'s surveillance network to trace the message origin.', character: 'YOU' },
                    { bg: 'linear-gradient(135deg, #006400 0%, #228b22 100%)', text: 'The trail leads to a secured server in the Arasaka Tower.', character: 'NARRATOR' },
                    { bg: 'linear-gradient(135deg, #8b4513 0%, #d2691e 100%)', text: 'Your investigation reveals "Phoenix" is a codename for a rogue AI researcher.', character: 'DATABASE' },
                    { bg: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)', text: 'Security forces detect your intrusion and begin tracing your location.', character: 'ALERT' }
                ],
                dialogue: 'The data trail is complex but you manage to uncover that "Phoenix" is Dr. Akira Sato, a former Arasaka Corporation AI researcher who disappeared six months ago after allegedly discovering something dangerous.',
                speaker: 'DATABASE ENTRY',
                choices: [
                    { text: 'Continue investigating Dr. Sato\'s disappearance', icon: 'fa-search', nextChapter: 9, pathEffect: 'CAUTIOUS', inventory: 'Research Notes' },
                    { text: 'Cover your tracks and delete all evidence of your search', icon: 'fa-eraser', nextChapter: 10, pathEffect: 'RUTHLESS', inventory: null },
                    { text: 'Send a counter-message to arrange a secure meeting', icon: 'fa-comments', nextChapter: 2, pathEffect: 'HEROIC', inventory: null },
                    { text: 'Abandon the investigation - it\'s getting too hot', icon: 'fa-home', nextChapter: 5, pathEffect: 'NEUTRAL', inventory: null }
                ]
            },
            4: {
                title: "Tech Upgrade",
                panels: [
                    { bg: 'linear-gradient(135deg, #2f4f4f 0%, #696969 100%)', text: 'The "Chop Shop" is a hidden tech market under a noodle bar in Chinatown.', character: 'NARRATOR' },
                    { bg: 'linear-gradient(135deg, #8b0000 0%, #dc143c 100%)', text: 'Your dealer, Jin, shows you the latest illegal cyberware upgrades.', character: 'JIN' },
                    { bg: 'linear-gradient(135deg, #4b0082 0%, #8a2be2 100%)', text: 'Military-grade optic implants with thermal vision and threat detection.', character: 'UPGRADE' },
                    { bg: 'linear-gradient(135deg, #006400 0%, #32cd32 100%)', text: 'You notice a familiar face in the security feed - it\'s Phoenix!', character: 'SURVEILLANCE' }
                ],
                dialogue: '"Business is good, my friend," Jin says while adjusting a cybernetic arm on his workbench. "I\'ve got something special today - prototype optic implants with thermal and threat detection. But they\'ll cost you. Or... I have another job that could cover the cost."',
                speaker: 'JIN',
                choices: [
                    { text: 'Buy the optic implants with your savings', icon: 'fa-eye', nextChapter: 11, pathEffect: 'NEUTRAL', inventory: 'Thermal Optic Implants' },
                    { text: 'Take Jin\'s job offer to earn the upgrades', icon: 'fa-briefcase', nextChapter: 12, pathEffect: 'RUTHLESS', inventory: 'Stolen Data' },
                    { text: 'Forget the upgrades and follow the Phoenix lead', icon: 'fa-user-secret', nextChapter: 2, pathEffect: 'HEROIC', inventory: null },
                    { text: 'Bargain for a cheaper, less powerful version', icon: 'fa-handshake', nextChapter: 13, pathEffect: 'CAUTIOUS', inventory: 'Basic Optic Upgrade' }
                ]
            },
            5: {
                title: "The Safe Choice",
                panels: [
                    { bg: 'linear-gradient(135deg, #696969 0%, #a9a9a9 100%)', text: 'You decide to lay low and ignore the mysterious message.', character: 'NARRATOR' },
                    { bg: 'linear-gradient(135deg, #2f4f4f 0%, #708090 100%)', text: 'Days pass in your normal routine of small data-running jobs.', character: 'YOU' },
                    { bg: 'linear-gradient(135deg, #8b0000 0%, #b22222 100%)', text: 'News reports show explosions in the Old City district.', character: 'NEWS FEED' },
                    { bg: 'linear-gradient(135deg, #006400 0%, #228b22 100%)', text: 'A sense of regret grows as you realize you avoided something important.', character: 'NARRATOR' }
                ],
                dialogue: 'A week later, you see news reports about "terrorist activity" in the Old City ruins. Corporate security forces have cordoned off the area. There are unconfirmed reports of casualties. You can\'t shake the feeling that you could have made a difference.',
                speaker: 'NARRATOR',
                choices: [
                    { text: 'Continue with your normal life (NEUTRAL ENDING)', icon: 'fa-home', nextChapter: 'end1', pathEffect: 'NEUTRAL', inventory: null },
                    { text: 'Try to contact Phoenix now (LATE START)', icon: 'fa-phone', nextChapter: 14, pathEffect: 'HEROIC', inventory: null },
                    { text: 'Investigate the incident yourself (RISKY)', icon: 'fa-search', nextChapter: 15, pathEffect: 'CAUTIOUS', inventory: null }
                ]
            },
            // Additional chapters would continue here...
            6: {
                title: "The Truth Seeker",
                panels: [
                    { bg: 'linear-gradient(135deg, #00008b 0%, #0000cd 100%)', text: 'You accept the data chip and promise to help expose the corporate conspiracy.', character: 'YOU' },
                    { bg: 'linear-gradient(135deg, #8b0000 0%, #b22222 100%)', text: 'Phoenix smiles faintly. "I knew I could count on you. Meet me tomorrow at the docks."', character: 'PHOENIX' },
                    { bg: 'linear-gradient(135deg, #006400 0%, #228b22 100%)', text: 'The data chip contains blueprints for a dangerous new mind-control technology.', character: 'DATA ANALYSIS' },
                    { bg: 'linear-gradient(135deg, #4b0082 0%, #9400d3 100%)', text: 'Arasaka Corporation plans to mass-produce it within the month.', character: 'REVELATION' }
                ],
                dialogue: 'Back in your apartment, you analyze the data chip. What you find is horrifying - Project "Cerebral Dominion," a technology that can override free will through neural implants. Arasaka plans to launch it in their next generation of consumer cyberware.',
                speaker: 'DATA ANALYSIS',
                choices: [
                    { text: 'Contact underground journalists to expose the truth (CONTINUE)', icon: 'fa-newspaper', nextChapter: 16, pathEffect: 'HEROIC', inventory: null },
                    { text: 'Try to sell the information to Arasaka\'s competitors (ALTERNATE PATH)', icon: 'fa-money-bill-wave', nextChapter: 17, pathEffect: 'RUTHLESS', inventory: null },
                    { text: 'Destroy the chip and pretend you never saw it (SAFE)', icon: 'fa-trash', nextChapter: 'end2', pathEffect: 'NEUTRAL', inventory: null }
                ]
            },
            // More chapters would follow in a full game...
            end1: {
                title: "The Neutral Ending",
                panels: [
                    { bg: 'linear-gradient(135deg, #696969 0%, #a9a9a9 100%)', text: 'You continue your life as a data runner, taking safe jobs and avoiding trouble.', character: 'NARRATOR' },
                    { bg: 'linear-gradient(135deg, #2f4f4f 0%, #708090 100%)', text: 'The city changes around you, becoming more controlled and surveilled.', character: 'NARRATOR' },
                    { bg: 'linear-gradient(135deg, #8b0000 0%, #b22222 100%)', text: 'Sometimes you wonder what might have happened if you had taken the risk.', character: 'YOU' },
                    { bg: 'linear-gradient(135deg, #006400 0%, #228b22 100%)', text: 'But in this world, sometimes survival is the only victory.', character: 'NARRATOR' }
                ],
                dialogue: 'Years pass. Neo-Tokyo becomes more controlled than ever. New mandatory "safety implants" are installed in every citizen. You live a comfortable, safe life. But sometimes, in the quiet moments, you remember the message from Phoenix and wonder what might have been. THE END.',
                speaker: 'NARRATOR',
                choices: [
                    { text: 'Restart the adventure and make different choices', icon: 'fa-redo', nextChapter: 1, pathEffect: null, inventory: null }
                ]
            },
            end2: {
                title: "The Destroyer of Truth",
                panels: [
                    { bg: 'linear-gradient(135deg, #8b0000 0%, #b22222 100%)', text: 'You destroy the data chip, erasing the evidence of Arasaka\'s plans.', character: 'YOU' },
                    { bg: 'linear-gradient(135deg, #2f4f4f 0%, #708090 100%)', text: 'Without the evidence, Phoenix has no leverage against the corporation.', character: 'NARRATOR' },
                    { bg: 'linear-gradient(135deg, #4b0082 0%, #9400d3 100%)', text: 'Months later, new "happiness implants" become mandatory for all citizens.', character: 'NEWS' },
                    { bg: 'linear-gradient(135deg, #006400 0%, #228b22 100%)', text: 'You smile, feeling content. Everyone else does too, thanks to their implants.', character: 'YOU' }
                ],
                dialogue: 'You made the safe choice. The world continues, seemingly happy and peaceful. You never hear from Phoenix again. Sometimes you notice your thoughts feel clearer after your mandatory neural implant update. You feel at peace. Everyone does. THE END.',
                speaker: 'NARRATOR',
                choices: [
                    { text: 'Restart the adventure and make different choices', icon: 'fa-redo', nextChapter: 1, pathEffect: null, inventory: null }
                ]
            }
        };

        // Initialize the game
        function initGame() {
            loadChapter(1);
            updateStats();
            updateInventoryDisplay();
        }

        // Load a chapter
        function loadChapter(chapterId) {
            const chapter = storyData[chapterId];
            if (!chapter) return;
            
            currentChapter = chapterId;
            
            // Update comic panels
            comicPanels.forEach((panel, index) => {
                if (chapter.panels[index]) {
                    const panelContent = panel.querySelector('.panel-content');
                    const panelText = panel.querySelector('.panel-text');
                    const panelCharacter = panel.querySelector('.panel-character');
                    
                    panelContent.style.background = chapter.panels[index].bg;
                    panelText.textContent = chapter.panels[index].text;
                    panelCharacter.textContent = chapter.panels[index].character;
                    
                    // Reset active state
                    panel.classList.remove('active');
                }
            });
            
            // Set first panel as active
            comicPanels[0].classList.add('active');
            
            // Update dialogue
            dialogueText.textContent = chapter.dialogue;
            speaker.textContent = chapter.speaker;
            
            // Update choices
            updateChoices(chapter.choices);
            
            // Update chapter number
            chapterNum.textContent = chapterId;
            
            // Update progress
            updateProgress(chapterId);
            
            // Update path type color
            updatePathDisplay();
        }

        // Update choices display
        function updateChoices(choices) {
            choicesContainer.innerHTML = '';
            
            choices.forEach((choice, index) => {
                const choiceBtn = document.createElement('button');
                choiceBtn.className = 'choice-btn';
                choiceBtn.dataset.choice = choice.nextChapter;
                
                choiceBtn.innerHTML = `
                    <div class="choice-number">${index + 1}</div>
                    <i class="fas ${choice.icon}"></i>
                    <span>${choice.text}</span>
                `;
                
                choiceBtn.addEventListener('click', () => {
                    makeChoice(choice);
                });
                
                choicesContainer.appendChild(choiceBtn);
            });
        }

        // Handle player choice
        function makeChoice(choice) {
            choicesMade++;
            
            // Update player path
            if (choice.pathEffect) {
                playerPath = choice.pathEffect;
            }
            
            // Add to inventory if applicable
            if (choice.inventory && !inventory.includes(choice.inventory)) {
                inventory.push(choice.inventory);
                updateInventoryDisplay();
                
                // Visual feedback for new inventory item
                showInventoryEffect(choice.inventory);
            }
            
            // Animate panel transition
            animatePanelTransition();
            
            // Update stats
            updateStats();
            
            // Load next chapter after delay
            setTimeout(() => {
                if (typeof choice.nextChapter === 'string' && choice.nextChapter.startsWith('end')) {
                    loadChapter(choice.nextChapter);
                } else {
                    loadChapter(choice.nextChapter);
                }
            }, 800);
        }

        // Update statistics display
        function updateStats() {
            choiceCount.textContent = choicesMade;
            pathType.textContent = playerPath;
        }

        // Update inventory display
        function updateInventoryDisplay() {
            inventoryItems.innerHTML = '';
            
            inventory.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'inventory-item';
                itemEl.innerHTML = `<i class="fas fa-cube"></i> ${item}`;
                inventoryItems.appendChild(itemEl);
            });
        }

        // Show visual effect for new inventory item
        function showInventoryEffect(itemName) {
            // Create a temporary notification
            const notification = document.createElement('div');
            notification.textContent = `+ ${itemName}`;
            notification.style.position = 'fixed';
            notification.style.top = '50%';
            notification.style.left = '50%';
            notification.style.transform = 'translate(-50%, -50%)';
            notification.style.background = 'rgba(107, 207, 127, 0.9)';
            notification.style.color = 'white';
            notification.style.padding = '15px 25px';
            notification.style.borderRadius = '10px';
            notification.style.fontWeight = 'bold';
            notification.style.zIndex = '1000';
            notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
            notification.style.animation = 'fadeOut 2s forwards';
            
            document.body.appendChild(notification);
            
            // Remove after animation
            setTimeout(() => {
                notification.remove();
            }, 2000);
            
            // Add CSS for animation
            if (!document.querySelector('#fadeOutAnimation')) {
                const style = document.createElement('style');
                style.id = 'fadeOutAnimation';
                style.textContent = `
                    @keyframes fadeOut {
                        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                        70% { opacity: 1; transform: translate(-50%, -150%) scale(1.1); }
                        100% { opacity: 0; transform: translate(-50%, -200%) scale(1.2); }
                    }
                `;
                document.head.appendChild(style);
            }
        }

        // Update progress bar
        function updateProgress(chapterId) {
            // Calculate progress percentage
            const totalChapters = Object.keys(storyData).length;
            const chapterNumber = typeof chapterId === 'string' ? parseInt(chapterId) : chapterId;
            const progress = (chapterNumber / totalChapters) * 100;
            
            // Limit to 100%
            const displayProgress = Math.min(progress, 100);
            
            // Update progress bar
            progressFill.style.width = `${displayProgress}%`;
            progressPercent.textContent = `${Math.round(displayProgress)}%`;
            
            // Update story progress
            storyProgress = displayProgress;
        }

        // Update path display color
        function updatePathDisplay() {
            const pathColors = {
                'HEROIC': '#4d96ff',
                'RUTHLESS': '#ff6b6b',
                'CAUTIOUS': '#6bcf7f',
                'NEUTRAL': '#ffd93d'
            };
            
            pathType.style.color = pathColors[playerPath] || '#ffd93d';
        }

        // Animate panel transition
        function animatePanelTransition() {
            // Add animation to all panels
            comicPanels.forEach(panel => {
                panel.style.transform = 'scale(0.95)';
                panel.style.opacity = '0.7';
            });
            
            // Reset after delay
            setTimeout(() => {
                comicPanels.forEach(panel => {
                    panel.style.transform = '';
                    panel.style.opacity = '';
                });
            }, 400);
        }

        // Show story hint
        function showHint() {
            const hints = [
                "Different choices lead to different story branches and endings.",
                "Your inventory items might unlock special options later.",
                "The path you're on (Heroic, Ruthless, Cautious, Neutral) affects available choices.",
                "There are multiple endings to discover - try different paths!",
                "Some choices might seem similar but lead to very different outcomes."
            ];
            
            const randomHint = hints[Math.floor(Math.random() * hints.length)];
            
            // Create hint notification
            const hintNotification = document.createElement('div');
            hintNotification.innerHTML = `<i class="fas fa-lightbulb"></i> HINT: ${randomHint}`;
            hintNotification.style.position = 'fixed';
            hintNotification.style.bottom = '20px';
            hintNotification.style.right = '20px';
            hintNotification.style.background = 'rgba(255, 217, 61, 0.9)';
            hintNotification.style.color = '#333';
            hintNotification.style.padding = '15px 20px';
            hintNotification.style.borderRadius = '10px';
            hintNotification.style.fontWeight = 'bold';
            hintNotification.style.zIndex = '1000';
            hintNotification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
            hintNotification.style.maxWidth = '300px';
            hintNotification.style.animation = 'slideInRight 0.5s forwards, fadeOut 3s 2.5s forwards';
            
            document.body.appendChild(hintNotification);
            
            // Remove after animation
            setTimeout(() => {
                hintNotification.remove();
            }, 5500);
        }

        // Event Listeners
        restartBtn.addEventListener('click', () => {
            // Reset game state
            currentChapter = 1;
            choicesMade = 0;
            playerPath = 'NEUTRAL';
            inventory = ['Apartment Key', 'Neural Interface'];
            storyProgress = 0;
            
            // Restart game
            initGame();
            
            // Show restart notification
            const notification = document.createElement('div');
            notification.textContent = 'Adventure Restarted!';
            notification.style.position = 'fixed';
            notification.style.top = '50%';
            notification.style.left = '50%';
            notification.style.transform = 'translate(-50%, -50%)';
            notification.style.background = 'rgba(255, 107, 107, 0.9)';
            notification.style.color = 'white';
            notification.style.padding = '15px 25px';
            notification.style.borderRadius = '10px';
            notification.style.fontWeight = 'bold';
            notification.style.zIndex = '1000';
            notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
            notification.style.animation = 'fadeOut 2s forwards';
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 2000);
        });

        hintBtn.addEventListener('click', showHint);

        // Panel click to enlarge
        comicPanels.forEach(panel => {
            panel.addEventListener('click', () => {
                // Toggle active state
                comicPanels.forEach(p => p.classList.remove('active'));
                panel.classList.add('active');
            });
        });

        // Initialize the game
        window.addEventListener('load', initGame);
        
        // Add CSS for slide animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);