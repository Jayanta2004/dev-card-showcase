        const cards = [
            { name: 'THE STAR', symbol: '⭐', meaning: 'hope, inspiration, serenity' },
            { name: 'THE MOON', symbol: '🌙', meaning: 'intuition, dreams, uncertainty' },
            { name: 'THE SUN', symbol: '☀️', meaning: 'success, vitality, joy' },
            { name: 'THE HERMIT', symbol: '🏮', meaning: 'solitude, wisdom, introspection' },
            { name: 'WHEEL OF FORTUNE', symbol: '🎡', meaning: 'change, cycles, destiny' },
            { name: 'JUSTICE', symbol: '⚖️', meaning: 'balance, truth, karma' },
            { name: 'THE HANGED MAN', symbol: '🪢', meaning: 'surrender, new perspective' },
            { name: 'DEATH', symbol: '💀', meaning: 'transformation, endings' },
            { name: 'TEMPERANCE', symbol: '⚗️', meaning: 'balance, moderation, patience' },
            { name: 'THE DEVIL', symbol: '👹', meaning: 'bondage, materialism' },
            { name: 'THE TOWER', symbol: '🏰', meaning: 'sudden change, revelation' },
            { name: 'THE WORLD', symbol: '🌍', meaning: 'completion, fulfillment' }
        ];
        
        let drawnCards = [];
        let question = '';
        
        function renderCards() {
            const grid = document.getElementById('cardsGrid');
            grid.innerHTML = '';
            
            // Show 3 cards
            for (let i = 0; i < 3; i++) {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.index = i;
                
                const front = document.createElement('div');
                front.className = 'card-front';
                
                if (drawnCards[i]) {
                    card.classList.add('revealed');
                    front.innerHTML = `
                        <div class="card-symbol">${drawnCards[i].symbol}</div>
                        <div class="card-name">${drawnCards[i].name}</div>
                        <div class="card-meaning">${drawnCards[i].meaning}</div>
                    `;
                } else {
                    front.innerHTML = `
                        <div class="card-symbol">🃏</div>
                        <div class="card-name">?</div>
                    `;
                }
                
                card.appendChild(front);
                
                card.addEventListener('click', () => revealCard(i));
                grid.appendChild(card);
            }
        }
        
        function revealCard(index) {
            if (drawnCards[index]) {
                // Already revealed
                return;
            }
            
            // Draw a random card
            const availableCards = cards.filter(c => !drawnCards.includes(c));
            if (availableCards.length > 0) {
                const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
                drawnCards[index] = randomCard;
                renderCards();
                
                // Update interpretation if all cards drawn
                if (drawnCards.filter(c => c).length === 3) {
                    generateInterpretation();
                }
            }
        }
        
        function generateInterpretation() {
            const interpretations = [
                `The cards speak of ${drawnCards.map(c => c.name.toLowerCase()).join(', ')}. ${drawnCards[0].meaning} leads to ${drawnCards[1].meaning}, revealing ${drawnCards[2].meaning}.`,
                
                `For your question about "${question || 'your path'}", the oracle sees: ${drawnCards[0].name} (${drawnCards[0].meaning}) in the past, ${drawnCards[1].name} (${drawnCards[1].meaning}) in the present, and ${drawnCards[2].name} (${drawnCards[2].meaning}) in the future.`,
                
                `The cards reveal: ${drawnCards[0].symbol} ${drawnCards[0].name} - ${drawnCards[0].meaning}. Crossed by ${drawnCards[1].symbol} ${drawnCards[1].name} - ${drawnCards[1].meaning}. Ultimately crowned by ${drawnCards[2].symbol} ${drawnCards[2].name} - ${drawnCards[2].meaning}.`
            ];
            
            document.getElementById('interpretation').innerHTML = 
                interpretations[Math.floor(Math.random() * interpretations.length)];
            
            // Crystal ball animation
            const crystal = document.getElementById('crystalBall');
            crystal.style.transform = 'scale(1.1)';
            setTimeout(() => crystal.style.transform = 'scale(1)', 200);
        }
        
        function drawNewReading() {
            question = document.getElementById('questionInput').value;
            drawnCards = [];
            renderCards();
            document.getElementById('interpretation').innerHTML = 'draw three cards by clicking them...';
        }
        
        document.getElementById('drawBtn').addEventListener('click', drawNewReading);
        
        // Initialize with empty cards
        renderCards();