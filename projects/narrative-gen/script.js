        const storyText = document.getElementById('storyText');
        const threadSpools = document.querySelectorAll('.thread-spool');
        
        let selectedThread = null;
        let currentStory = [];
        let storyElements = [];
        
        // Story fragments
        const storyFragments = {
            passion: ['burning', 'fierce', 'intense', 'yearning', 'fiery'],
            melancholy: ['whispering', 'fading', 'distant', 'haunting', 'silent'],
            hope: ['glowing', 'rising', 'blooming', 'promising', 'warm'],
            mystery: ['shadowed', 'hidden', 'ancient', 'cryptic', 'veiled'],
            dreams: ['floating', 'ethereal', 'shifting', 'illusory', 'dreamlike'],
            
            character: ['a wanderer', 'the weaver', 'a child', 'an oracle', 'the keeper'],
            place: ['in a forgotten library', 'beneath silver stars', 'within a crystal cave', 'by the endless sea', 'at the edge of time'],
            object: ['a glowing thread', 'an ancient key', 'a broken mirror', 'a whispering shell', 'a frozen moment'],
            emotion: ['with quiet hope', 'carrying sorrow', 'filled with wonder', 'burning with purpose', 'drifting in peace'],
            event: ['as dawn breaks', 'when the veil thins', 'during the eclipse', 'while the world sleeps', 'at the turning tide']
        };
        
        threadSpools.forEach(spool => {
            spool.addEventListener('click', () => {
                threadSpools.forEach(s => s.classList.remove('selected'));
                spool.classList.add('selected');
                selectedThread = spool.dataset.thread;
            });
        });
        
        function addElement(type) {
            if (!selectedThread) {
                storyText.textContent = "💫 select a thread first...";
                return;
            }
            
            const elementArray = storyFragments[type] || storyFragments[selectedThread];
            if (elementArray) {
                const randomElement = elementArray[Math.floor(Math.random() * elementArray.length)];
                storyElements.push(randomElement);
                
                // Update story
                weaveStory();
            }
        }
        
        function weaveStory() {
            if (storyElements.length === 0) {
                storyText.textContent = "pull threads to weave your tale...";
                return;
            }
            
            // Construct a narrative from elements
            let narrative = "";
            
            if (storyElements.length >= 3) {
                narrative = `Once, ${storyElements[0]} came to ${storyElements[1]}, ${storyElements[2]}.`;
            } else if (storyElements.length === 2) {
                narrative = `${storyElements[0]} met ${storyElements[1]}...`;
            } else {
                narrative = `${storyElements[0]} awaits...`;
            }
            
            // Add more elements if available
            if (storyElements.length >= 4) {
                narrative += ` There, ${storyElements[3]} was found.`;
            }
            if (storyElements.length >= 5) {
                narrative += ` And ${storyElements[4]} changed everything.`;
            }
            
            storyText.textContent = narrative;
        }
        
        function weaveTime(time) {
            if (storyElements.length === 0) {
                storyText.textContent = "weave some elements first...";
                return;
            }
            
            let timeNarrative = "";
            
            switch(time) {
                case 'past':
                    timeNarrative = `Long ago, ${storyElements.join(' ')}... This memory still echoes.`;
                    break;
                case 'present':
                    timeNarrative = `Now, ${storyElements.join(' ')} unfolds in the eternal now.`;
                    break;
                case 'future':
                    timeNarrative = `Someday, ${storyElements.join(' ')} will be remembered as prophecy.`;
                    break;
            }
            
            storyText.textContent = timeNarrative;
        }
        
        function resetWeave() {
            storyElements = [];
            storyText.textContent = "Pull the threads to weave a tale...";
        }
        
        document.querySelectorAll('.element-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                addElement(tag.dataset.element);
            });
        });
        
        document.getElementById('weavePast').addEventListener('click', () => weaveTime('past'));
        document.getElementById('weavePresent').addEventListener('click', () => weaveTime('present'));
        document.getElementById('weaveFuture').addEventListener('click', () => weaveTime('future'));
        
        // Double-click to reset
        storyText.addEventListener('dblclick', resetWeave);