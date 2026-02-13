        // Emotion to color mapping database
        const emotionColors = {
            // Basic emotions
            "joy": ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#FF9A76"],
            "happy": ["#FFD166", "#FF9A76", "#06D6A0", "#118AB2", "#EF476F"],
            "sad": ["#6C757D", "#495057", "#ADB5BD", "#6C757D", "#343A40"],
            "anger": ["#E63946", "#D90429", "#9D0208", "#FF5400", "#FF9E00"],
            "fear": ["#4A4E69", "#22223B", "#9A8C98", "#C9ADA7", "#F2E9E4"],
            "love": ["#FF6B8B", "#FF8E9E", "#FFAAA5", "#FFD3B6", "#FFE6E6"],
            "calm": ["#A8DADC", "#457B9D", "#1D3557", "#F1FAEE", "#E9F5DB"],
            "peace": ["#A8DADC", "#CCD5AE", "#E9EDC9", "#FEFAE0", "#FAEDCD"],
            "energy": ["#FF5400", "#FF9E00", "#FFD166", "#06D6A0", "#118AB2"],
            "excitement": ["#FF5400", "#FF9E00", "#FF006E", "#8338EC", "#3A86FF"],
            
            // Complex emotions
            "nostalgia": ["#9B5DE5", "#F15BB5", "#FEE440", "#00BBF9", "#00F5D4"],
            "hope": ["#FFD166", "#06D6A0", "#118AB2", "#073B4C", "#EF476F"],
            "serenity": ["#A8DADC", "#CCD5AE", "#E9EDC9", "#FEFAE0", "#FAEDCD"],
            "melancholy": ["#6D6875", "#B5838D", "#E5989B", "#FFB4A2", "#FFCDB2"],
            "euphoria": ["#9B5DE5", "#F15BB5", "#00F5D4", "#00BBF9", "#FEE440"],
            "anxiety": ["#6D6875", "#B5838D", "#E5989B", "#FFB4A2", "#FFCDB2"],
            "gratitude": ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#FF9A76"],
            "contentment": ["#CCD5AE", "#E9EDC9", "#FEFAE0", "#FAEDCD", "#D4A373"],
            
            // Descriptive emotions
            "warm": ["#FF5400", "#FF9E00", "#FFD166", "#EF476F", "#FF9A76"],
            "cool": ["#118AB2", "#073B4C", "#06D6A0", "#4CC9F0", "#4895EF"],
            "vibrant": ["#FF006E", "#FFBE0B", "#FB5607", #8338EC", "#3A86FF"],
            "soft": ["#FFCDB2", "#FFB4A2", "#E5989B", "#B5838D", #6D6875"],
            "bright": ["#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#FF9A76"],
            "dark": ["#22223B", #4A4E69", "#9A8C98", "#C9ADA7", "#F2E9E4"],
            "romantic": ["#FF6B8B", "#FF8E9E", "#FFAAA5", "#FFD3B6", "#FFE6E6"],
            "mysterious": ["#560BAD", #480CA8", "#3A0CA3", "#3F37C9", "#4361EE"],
        };

        // Emotion descriptions
        const emotionDescriptions = {
            "joy": "A vibrant palette of warm yellows and energetic pinks that captures the essence of happiness and delight.",
            "happy": "Bright, cheerful colors that radiate positivity and optimism, perfect for uplifting moments.",
            "sad": "Muted, cool tones reflecting introspection and melancholy with subtle depth.",
            "anger": "Intense reds and fiery oranges that convey passion, intensity, and strong emotion.",
            "fear": "Dark, subdued shades that evoke tension and uncertainty with subtle contrasts.",
            "love": "Soft pinks and warm peaches that embody affection, tenderness, and romance.",
            "calm": "Cool blues and serene greens that promote relaxation and peaceful contemplation.",
            "peace": "Soft, harmonious hues that create a sense of tranquility and balance.",
            "energy": "Vibrant oranges and yellows that capture dynamism, enthusiasm, and vitality.",
            "excitement": "A bold mix of electric colors that represent anticipation and high energy.",
            "nostalgia": "A blend of retro-inspired colors that evoke memories and sentimental feelings.",
            "hope": "Bright, optimistic colors that symbolize positivity and looking forward to the future.",
            "serenity": "Soft, pastel tones that create a calming and peaceful atmosphere.",
            "melancholy": "Muted, desaturated colors that reflect thoughtful introspection.",
            "euphoria": "A vibrant, psychedelic palette representing intense happiness and elation.",
            "anxiety": "Unsettling color combinations that reflect tension and unease.",
            "gratitude": "Warm, appreciative colors that embody thankfulness and contentment.",
            "contentment": "Comfortable, soothing hues that represent satisfaction and peace of mind.",
            "warm": "Cozy, inviting colors that evoke feelings of comfort and familiarity.",
            "cool": "Refreshing, tranquil shades that promote calmness and clarity.",
            "vibrant": "Bold, saturated colors full of life and energy.",
            "soft": "Gentle, muted tones that are easy on the eyes and soothing to the spirit.",
            "bright": "Luminous, cheerful colors that uplift and energize.",
            "dark": "Deep, mysterious shades that convey intensity and sophistication.",
            "romantic": "Delicate, affectionate colors that speak of love and tenderness.",
            "mysterious": "Deep, enigmatic hues that evoke curiosity and intrigue."
        };

        // Suggested emotions for quick selection
        const suggestedEmotions = [
            "joy", "calm", "energy", "love", "nostalgia", 
            "peace", "excitement", "melancholy", "hope", "serenity"
        ];

        // DOM Elements
        const emotionInput = document.getElementById('emotionInput');
        const suggestionsContainer = document.getElementById('suggestions');
        const convertBtn = document.getElementById('convertBtn');
        const randomBtn = document.getElementById('randomBtn');
        const colorPalette = document.getElementById('colorPalette');
        const paletteName = document.getElementById('paletteName');
        const paletteDescription = document.getElementById('paletteDescription');
        const historyItems = document.getElementById('historyItems');
        const clearHistoryBtn = document.getElementById('clearHistory');
        const copyNotification = document.getElementById('copyNotification');

        // App state
        let emotionHistory = JSON.parse(localStorage.getItem('emotionHistory')) || [];
        let currentEmotion = "joy";

        // Initialize the app
        function initApp() {
            // Create suggestion tags
            createSuggestionTags();
            
            // Generate initial palette
            generatePalette(currentEmotion);
            
            // Load history
            renderHistory();
            
            // Set up event listeners
            convertBtn.addEventListener('click', handleConvert);
            randomBtn.addEventListener('click', generateRandomPalette);
            clearHistoryBtn.addEventListener('click', clearHistory);
            emotionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleConvert();
            });
            
            // Set focus to input
            emotionInput.focus();
        }

        // Create suggestion tags
        function createSuggestionTags() {
            suggestionsContainer.innerHTML = '';
            
            suggestedEmotions.forEach(emotion => {
                const tag = document.createElement('div');
                tag.className = 'suggestion-tag';
                tag.textContent = emotion;
                tag.addEventListener('click', () => {
                    // Set the input value and generate palette
                    emotionInput.value = emotion;
                    generatePalette(emotion);
                    
                    // Highlight the selected tag
                    document.querySelectorAll('.suggestion-tag').forEach(t => t.classList.remove('active'));
                    tag.classList.add('active');
                });
                
                suggestionsContainer.appendChild(tag);
            });
        }

        // Handle convert button click
        function handleConvert() {
            const inputValue = emotionInput.value.trim().toLowerCase();
            if (!inputValue) return;
            
            generatePalette(inputValue);
            
            // Add to history
            addToHistory(inputValue);
        }

        // Generate color palette for a given emotion
        function generatePalette(emotion) {
            // Update current emotion
            currentEmotion = emotion;
            
            // Get colors for emotion or generate random ones
            let colors;
            
            if (emotionColors[emotion]) {
                colors = [...emotionColors[emotion]];
            } else {
                // For unknown emotions, generate based on the emotion string
                colors = generateColorsFromString(emotion);
            }
            
            // Clear the palette
            colorPalette.innerHTML = '';
            
            // Create color items
            const colorNames = ["Primary", "Secondary", "Accent", "Background", "Highlight"];
            
            colors.forEach((color, index) => {
                const colorItem = document.createElement('div');
                colorItem.className = 'color-item';
                colorItem.style.backgroundColor = color;
                colorItem.setAttribute('data-color', color);
                
                const colorName = document.createElement('div');
                colorName.className = 'color-name';
                colorName.textContent = colorNames[index];
                
                const colorValue = document.createElement('div');
                colorValue.className = 'color-value';
                colorValue.textContent = color;
                
                colorItem.appendChild(colorName);
                colorItem.appendChild(colorValue);
                
                // Add click to copy functionality
                colorItem.addEventListener('click', () => copyToClipboard(color));
                
                colorPalette.appendChild(colorItem);
            });
            
            // Update palette info
            updatePaletteInfo(emotion, colors);
        }

        // Generate colors based on emotion string
        function generateColorsFromString(emotion) {
            // Create a hash from the emotion string
            let hash = 0;
            for (let i = 0; i < emotion.length; i++) {
                hash = emotion.charCodeAt(i) + ((hash << 5) - hash);
            }
            
            // Generate 5 colors based on the hash
            const colors = [];
            for (let i = 0; i < 5; i++) {
                // Adjust the hash for each color
                const hue = (hash + i * 50) % 360;
                const saturation = 60 + (hash % 30); // 60-90%
                const lightness = 40 + ((hash + i * 20) % 30); // 40-70%
                
                colors.push(hslToHex(hue, saturation, lightness));
            }
            
            return colors;
        }

        // Convert HSL to HEX color
        function hslToHex(h, s, l) {
            h /= 360;
            s /= 100;
            l /= 100;
            
            let r, g, b;
            
            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            const toHex = (x) => {
                const hex = Math.round(x * 255).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };
            
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
        }

        // Update palette information
        function updatePaletteInfo(emotion, colors) {
            // Format emotion name for display
            const displayName = emotion.charAt(0).toUpperCase() + emotion.slice(1);
            paletteName.textContent = `${displayName} Harmony`;
            
            // Get or generate description
            if (emotionDescriptions[emotion]) {
                paletteDescription.textContent = emotionDescriptions[emotion];
            } else {
                // Generate a description based on the colors
                const isWarm = colors.some(color => {
                    const hex = color.replace('#', '');
                    const r = parseInt(hex.substr(0, 2), 16);
                    const g = parseInt(hex.substr(2, 2), 16);
                    const b = parseInt(hex.substr(4, 2), 16);
                    
                    // Calculate warmth (red/orange dominance)
                    return r > g + 50 && r > b + 50;
                });
                
                const isBright = colors.some(color => {
                    const hex = color.replace('#', '');
                    const r = parseInt(hex.substr(0, 2), 16);
                    const g = parseInt(hex.substr(2, 2), 16);
                    const b = parseInt(hex.substr(4, 2), 16);
                    
                    // Calculate brightness
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                    return brightness > 180;
                });
                
                const mood = isWarm ? "warm and inviting" : "cool and calming";
                const energy = isBright ? "vibrant and energetic" : "subdued and thoughtful";
                
                paletteDescription.textContent = `This ${mood} palette represents the emotion of ${emotion} with ${energy} colors that uniquely express this feeling.`;
            }
        }

        // Generate random palette
        function generateRandomPalette() {
            const emotions = Object.keys(emotionColors);
            const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            
            emotionInput.value = randomEmotion;
            generatePalette(randomEmotion);
            addToHistory(randomEmotion);
        }

        // Add emotion to history
        function addToHistory(emotion) {
            // Check if already in history
            const existingIndex = emotionHistory.findIndex(item => item.emotion === emotion);
            
            if (existingIndex !== -1) {
                // Remove from current position
                emotionHistory.splice(existingIndex, 1);
            }
            
            // Add to beginning
            emotionHistory.unshift({
                emotion: emotion,
                timestamp: Date.now(),
                colors: emotionColors[emotion] || generateColorsFromString(emotion)
            });
            
            // Keep only last 6 items
            if (emotionHistory.length > 6) {
                emotionHistory = emotionHistory.slice(0, 6);
            }
            
            // Save to localStorage
            localStorage.setItem('emotionHistory', JSON.stringify(emotionHistory));
            
            // Update history display
            renderHistory();
        }

        // Render history items
        function renderHistory() {
            historyItems.innerHTML = '';
            
            emotionHistory.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.setAttribute('data-emotion', item.emotion);
                
                const historyColors = document.createElement('div');
                historyColors.className = 'history-colors';
                
                // Take first 3 colors for preview
                const previewColors = item.colors.slice(0, 3);
                previewColors.forEach(color => {
                    const historyColor = document.createElement('div');
                    historyColor.className = 'history-color';
                    historyColor.style.backgroundColor = color;
                    historyColors.appendChild(historyColor);
                });
                
                const historyEmotion = document.createElement('div');
                historyEmotion.className = 'history-emotion';
                historyEmotion.textContent = item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1);
                
                historyItem.appendChild(historyColors);
                historyItem.appendChild(historyEmotion);
                
                // Add click event to load this palette
                historyItem.addEventListener('click', () => {
                    emotionInput.value = item.emotion;
                    generatePalette(item.emotion);
                });
                
                historyItems.appendChild(historyItem);
            });
        }

        // Clear history
        function clearHistory() {
            emotionHistory = [];
            localStorage.setItem('emotionHistory', JSON.stringify(emotionHistory));
            renderHistory();
        }

        // Copy color to clipboard
        function copyToClipboard(color) {
            navigator.clipboard.writeText(color).then(() => {
                // Show notification
                copyNotification.style.display = 'flex';
                setTimeout(() => {
                    copyNotification.style.display = 'none';
                }, 2000);
            });
        }

        // Initialize the app when page loads
        window.addEventListener('DOMContentLoaded', initApp);