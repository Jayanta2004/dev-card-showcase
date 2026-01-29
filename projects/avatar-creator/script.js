        // Avatar state
        const avatarState = {
            hairstyle: 'short',
            clothing: 'tshirt',
            hairColor: '#4A3520',
            clothingColor: '#3498db',
            skinColor: '#F8C8A0',
            avatarName: 'My Avatar'
        };

        // Available options
        const options = {
            hairstyles: [
                { id: 'short', name: 'Short', icon: '✂️' },
                { id: 'long', name: 'Long', icon: '👩' },
                { id: 'curly', name: 'Curly', icon: '🦱' },
                { id: 'ponytail', name: 'Ponytail', icon: '💁‍♀️' },
                { id: 'mohawk', name: 'Mohawk', icon: '👨‍🎤' },
                { id: 'bald', name: 'Bald', icon: '👨‍🦲' }
            ],
            clothing: [
                { id: 'tshirt', name: 'T-Shirt', icon: '👕' },
                { id: 'dress', name: 'Dress', icon: '👗' },
                { id: 'suit', name: 'Suit', icon: '👔' },
                { id: 'hoodie', name: 'Hoodie', icon: '🧥' },
                { id: 'tanktop', name: 'Tank Top', icon: '🎽' },
                { id: 'formal', name: 'Formal', icon: '🥼' }
            ],
            hairColors: [
                '#4A3520', // Dark Brown
                '#8B4513', // Saddle Brown
                '#D2691E', // Chocolate
                '#F0D8B8', // Blonde
                '#2C2C2C', // Black
                '#C0C0C0', // Silver
                '#A52A2A', // Brown
                '#E6C9A8'  // Light Blonde
            ],
            clothingColors: [
                '#3498db', // Blue
                '#e74c3c', // Red
                '#2ecc71', // Green
                '#f1c40f', // Yellow
                '#9b59b6', // Purple
                '#1abc9c', // Teal
                '#e67e22', // Orange
                '#34495e'  // Dark Blue
            ],
            skinColors: [
                '#F8C8A0', // Light
                '#E8B897', 
                '#D8A57A',
                '#C98C5F',
                '#B57349',
                '#9C5A34',
                '#83421F',
                '#6A2A0A'  // Dark
            ]
        };

        // Initialize the app
        function initApp() {
            renderHairstyleOptions();
            renderClothingOptions();
            renderColorOptions();
            updateAvatar();
            
            // Set up event listeners
            document.getElementById('downloadBtn').addEventListener('click', downloadAvatar);
            document.getElementById('randomBtn').addEventListener('click', randomizeAvatar);
            document.getElementById('avatarName').addEventListener('input', function() {
                avatarState.avatarName = this.value || 'My Avatar';
            });
        }

        // Render hairstyle options
        function renderHairstyleOptions() {
            const container = document.getElementById('hairstyleOptions');
            container.innerHTML = '';
            
            options.hairstyles.forEach(style => {
                const option = document.createElement('div');
                option.className = `option ${avatarState.hairstyle === style.id ? 'active' : ''}`;
                option.dataset.id = style.id;
                
                option.innerHTML = `
                    <div class="option-icon">${style.icon}</div>
                    <div class="option-name">${style.name}</div>
                `;
                
                option.addEventListener('click', () => {
                    avatarState.hairstyle = style.id;
                    updateActiveOption('hairstyleOptions', style.id);
                    updateAvatar();
                });
                
                container.appendChild(option);
            });
        }

        // Render clothing options
        function renderClothingOptions() {
            const container = document.getElementById('clothingOptions');
            container.innerHTML = '';
            
            options.clothing.forEach(item => {
                const option = document.createElement('div');
                option.className = `option ${avatarState.clothing === item.id ? 'active' : ''}`;
                option.dataset.id = item.id;
                
                option.innerHTML = `
                    <div class="option-icon">${item.icon}</div>
                    <div class="option-name">${item.name}</div>
                `;
                
                option.addEventListener('click', () => {
                    avatarState.clothing = item.id;
                    updateActiveOption('clothingOptions', item.id);
                    updateAvatar();
                });
                
                container.appendChild(option);
            });
        }

        // Render color options
        function renderColorOptions() {
            renderColorPalette('hairColorOptions', options.hairColors, 'hairColor', 'Hair');
            renderColorPalette('clothingColorOptions', options.clothingColors, 'clothingColor', 'Clothing');
            renderColorPalette('skinColorOptions', options.skinColors, 'skinColor', 'Skin');
        }

        // Render a color palette
        function renderColorPalette(containerId, colors, type, label) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            
            colors.forEach(color => {
                const colorOption = document.createElement('div');
                colorOption.className = `color-option ${avatarState[type] === color ? 'active' : ''}`;
                colorOption.style.backgroundColor = color;
                colorOption.dataset.color = color;
                
                colorOption.addEventListener('click', () => {
                    avatarState[type] = color;
                    updateActiveColor(containerId, color);
                    updateAvatar();
                });
                
                container.appendChild(colorOption);
            });
        }

        // Update active option in a container
        function updateActiveOption(containerId, activeId) {
            const container = document.getElementById(containerId);
            const options = container.querySelectorAll('.option');
            
            options.forEach(option => {
                option.classList.toggle('active', option.dataset.id === activeId);
            });
        }

        // Update active color in a container
        function updateActiveColor(containerId, activeColor) {
            const container = document.getElementById(containerId);
            const colors = container.querySelectorAll('.color-option');
            
            colors.forEach(color => {
                color.classList.toggle('active', color.dataset.color === activeColor);
            });
        }

        // Update the avatar preview
        function updateAvatar() {
            const canvas = document.getElementById('avatarCanvas');
            canvas.innerHTML = '';
            
            // Create SVG container
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("viewBox", "0 0 100 100");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.setAttribute("id", "avatarSvg");
            
            // Background circle
            const bgCircle = document.createElementNS(svgNS, "circle");
            bgCircle.setAttribute("cx", "50");
            bgCircle.setAttribute("cy", "50");
            bgCircle.setAttribute("r", "48");
            bgCircle.setAttribute("fill", avatarState.skinColor);
            bgCircle.setAttribute("stroke", "#ddd");
            bgCircle.setAttribute("stroke-width", "0.5");
            svg.appendChild(bgCircle);
            
            // Add clothing based on selection
            addClothing(svg, svgNS);
            
            // Add hair based on selection
            addHair(svg, svgNS);
            
            // Add face features
            addFace(svg, svgNS);
            
            canvas.appendChild(svg);
        }

        // Add clothing to avatar
        function addClothing(svg, svgNS) {
            // Common clothing base (neck area)
            const neck = document.createElementNS(svgNS, "ellipse");
            neck.setAttribute("cx", "50");
            neck.setAttribute("cy", "60");
            neck.setAttribute("rx", "15");
            neck.setAttribute("ry", "10");
            neck.setAttribute("fill", avatarState.clothingColor);
            svg.appendChild(neck);
            
            if (avatarState.clothing === 'tshirt') {
                // T-shirt body
                const body = document.createElementNS(svgNS, "path");
                body.setAttribute("d", "M 30 60 Q 50 85 70 60 L 70 85 Q 50 95 30 85 Z");
                body.setAttribute("fill", avatarState.clothingColor);
                svg.appendChild(body);
                
                // Sleeves
                const leftSleeve = document.createElementNS(svgNS, "ellipse");
                leftSleeve.setAttribute("cx", "30");
                leftSleeve.setAttribute("cy", "60");
                leftSleeve.setAttribute("rx", "8");
                leftSleeve.setAttribute("ry", "5");
                leftSleeve.setAttribute("fill", avatarState.clothingColor);
                svg.appendChild(leftSleeve);
                
                const rightSleeve = document.createElementNS(svgNS, "ellipse");
                rightSleeve.setAttribute("cx", "70");
                rightSleeve.setAttribute("cy", "60");
                rightSleeve.setAttribute("rx", "8");
                rightSleeve.setAttribute("ry", "5");
                rightSleeve.setAttribute("fill", avatarState.clothingColor);
                svg.appendChild(rightSleeve);
                
            } else if (avatarState.clothing === 'dress') {
                // Dress body
                const body = document.createElementNS(svgNS, "path");
                body.setAttribute("d", "M 35 60 Q 50 90 65 60 L 65 95 Q 50 98 35 95 Z");
                body.setAttribute("fill", avatarState.clothingColor);
                svg.appendChild(body);
                
            } else if (avatarState.clothing === 'suit') {
                // Suit jacket
                const body = document.createElementNS(svgNS, "path");
                body.setAttribute("d", "M 30 60 Q 50 80 70 60 L 70 90 Q 50 95 30 90 Z");
                body.setAttribute("fill", avatarState.clothingColor);
                svg.appendChild(body);
                
                // Collar
                const collar = document.createElementNS(svgNS, "path");
                collar.setAttribute("d", "M 40 58 L 50 53 L 60 58");
                collar.setAttribute("stroke", avatarState.clothingColor);
                collar.setAttribute("stroke-width", "3");
                collar.setAttribute("fill", "none");
                svg.appendChild(collar);
                
            } else if (avatarState.clothing === 'hoodie') {
                // Hoodie body
                const body = document.createElementNS(svgNS, "path");
                body.setAttribute("d", "M 30 60 Q 50 85 70 60 L 70 90 Q 50 95 30 90 Z");
                body.setAttribute("fill", avatarState.clothingColor);
                svg.appendChild(body);
                
                // Hood
                const hood = document.createElementNS(svgNS, "ellipse");
                hood.setAttribute("cx", "50");
                hood.setAttribute("cy", "40");
                hood.setAttribute("rx", "20");
                hood.setAttribute("ry", "15");
                hood.setAttribute("fill", avatarState.clothingColor);
                svg.appendChild(hood);
                
            } else if (avatarState.clothing === 'tanktop') {
                // Tank top body
                const body = document.createElementNS(svgNS, "path");
                body.setAttribute("d", "M 35 60 Q 50 80 65 60 L 65 85 Q 50 90 35 85 Z");
                body.setAttribute("fill", avatarState.clothingColor);
                svg.appendChild(body);
                
            } else if (avatarState.clothing === 'formal') {
                // Formal shirt
                const body = document.createElementNS(svgNS, "path");
                body.setAttribute("d", "M 35 60 L 35 90 Q 50 92 65 90 L 65 60");
                body.setAttribute("fill", avatarState.clothingColor);
                svg.appendChild(body);
                
                // Tie
                const tie = document.createElementNS(svgNS, "path");
                tie.setAttribute("d", "M 50 60 L 45 70 L 50 75 L 55 70 Z");
                tie.setAttribute("fill", "#e74c3c");
                svg.appendChild(tie);
            }
        }

        // Add hair to avatar
        function addHair(svg, svgNS) {
            if (avatarState.hairstyle === 'short') {
                // Short hair
                const hair = document.createElementNS(svgNS, "ellipse");
                hair.setAttribute("cx", "50");
                hair.setAttribute("cy", "40");
                hair.setAttribute("rx", "20");
                hair.setAttribute("ry", "15");
                hair.setAttribute("fill", avatarState.hairColor);
                svg.appendChild(hair);
                
            } else if (avatarState.hairstyle === 'long') {
                // Long hair
                const hair = document.createElementNS(svgNS, "path");
                hair.setAttribute("d", "M 30 35 Q 50 25 70 35 Q 75 55 70 70 Q 50 80 30 70 Q 25 55 30 35");
                hair.setAttribute("fill", avatarState.hairColor);
                svg.appendChild(hair);
                
            } else if (avatarState.hairstyle === 'curly') {
                // Curly hair
                const hair = document.createElementNS(svgNS, "ellipse");
                hair.setAttribute("cx", "50");
                hair.setAttribute("cy", "35");
                hair.setAttribute("rx", "22");
                hair.setAttribute("ry", "18");
                hair.setAttribute("fill", avatarState.hairColor);
                svg.appendChild(hair);
                
                // Add some curl details
                for (let i = 0; i < 5; i++) {
                    const curl = document.createElementNS(svgNS, "circle");
                    const x = 40 + i * 5;
                    const y = 40 + Math.sin(i) * 3;
                    curl.setAttribute("cx", x.toString());
                    curl.setAttribute("cy", y.toString());
                    curl.setAttribute("r", "3");
                    curl.setAttribute("fill", avatarState.hairColor);
                    curl.setAttribute("opacity", "0.8");
                    svg.appendChild(curl);
                }
                
            } else if (avatarState.hairstyle === 'ponytail') {
                // Head hair
                const headHair = document.createElementNS(svgNS, "ellipse");
                headHair.setAttribute("cx", "50");
                headHair.setAttribute("cy", "40");
                headHair.setAttribute("rx", "20");
                headHair.setAttribute("ry", "15");
                headHair.setAttribute("fill", avatarState.hairColor);
                svg.appendChild(headHair);
                
                // Ponytail
                const ponytail = document.createElementNS(svgNS, "ellipse");
                ponytail.setAttribute("cx", "50");
                ponytail.setAttribute("cy", "60");
                ponytail.setAttribute("rx", "8");
                ponytail.setAttribute("ry", "20");
                ponytail.setAttribute("fill", avatarState.hairColor);
                svg.appendChild(ponytail);
                
            } else if (avatarState.hairstyle === 'mohawk') {
                // Mohawk strip
                const mohawk = document.createElementNS(svgNS, "path");
                mohawk.setAttribute("d", "M 40 30 L 50 20 L 60 30 L 60 50 L 40 50 Z");
                mohawk.setAttribute("fill", avatarState.hairColor);
                svg.appendChild(mohawk);
                
            } else if (avatarState.hairstyle === 'bald') {
                // Bald - no hair added
                // Just add a subtle shine to indicate bald head
                const shine = document.createElementNS(svgNS, "ellipse");
                shine.setAttribute("cx", "55");
                shine.setAttribute("cy", "42");
                shine.setAttribute("rx", "8");
                shine.setAttribute("ry", "4");
                shine.setAttribute("fill", "white");
                shine.setAttribute("opacity", "0.2");
                svg.appendChild(shine);
            }
        }

        // Add face features
        function addFace(svg, svgNS) {
            // Eyes
            const leftEye = document.createElementNS(svgNS, "ellipse");
            leftEye.setAttribute("cx", "40");
            leftEye.setAttribute("cy", "45");
            leftEye.setAttribute("rx", "3");
            leftEye.setAttribute("ry", "4");
            leftEye.setAttribute("fill", "#2c3e50");
            svg.appendChild(leftEye);
            
            const rightEye = document.createElementNS(svgNS, "ellipse");
            rightEye.setAttribute("cx", "60");
            rightEye.setAttribute("cy", "45");
            rightEye.setAttribute("rx", "3");
            rightEye.setAttribute("ry", "4");
            rightEye.setAttribute("fill", "#2c3e50");
            svg.appendChild(rightEye);
            
            // Eyebrows
            const leftBrow = document.createElementNS(svgNS, "path");
            leftBrow.setAttribute("d", "M 35 38 Q 40 35 45 38");
            leftBrow.setAttribute("stroke", "#2c3e50");
            leftBrow.setAttribute("stroke-width", "1.5");
            leftBrow.setAttribute("fill", "none");
            svg.appendChild(leftBrow);
            
            const rightBrow = document.createElementNS(svgNS, "path");
            rightBrow.setAttribute("d", "M 55 38 Q 60 35 65 38");
            rightBrow.setAttribute("stroke", "#2c3e50");
            rightBrow.setAttribute("stroke-width", "1.5");
            rightBrow.setAttribute("fill", "none");
            svg.appendChild(rightBrow);
            
            // Nose
            const nose = document.createElementNS(svgNS, "path");
            nose.setAttribute("d", "M 50 50 Q 52 55 50 58");
            nose.setAttribute("stroke", "#2c3e50");
            nose.setAttribute("stroke-width", "1");
            nose.setAttribute("fill", "none");
            svg.appendChild(nose);
            
            // Mouth
            const mouth = document.createElementNS(svgNS, "path");
            mouth.setAttribute("d", "M 42 65 Q 50 70 58 65");
            mouth.setAttribute("stroke", "#e74c3c");
            mouth.setAttribute("stroke-width", "1.5");
            mouth.setAttribute("fill", "none");
            svg.appendChild(mouth);
        }

        // Randomize avatar
        function randomizeAvatar() {
            // Randomly select options
            const randomHairstyle = options.hairstyles[Math.floor(Math.random() * options.hairstyles.length)];
            const randomClothing = options.clothing[Math.floor(Math.random() * options.clothing.length)];
            const randomHairColor = options.hairColors[Math.floor(Math.random() * options.hairColors.length)];
            const randomClothingColor = options.clothingColors[Math.floor(Math.random() * options.clothingColors.length)];
            const randomSkinColor = options.skinColors[Math.floor(Math.random() * options.skinColors.length)];
            
            // Update state
            avatarState.hairstyle = randomHairstyle.id;
            avatarState.clothing = randomClothing.id;
            avatarState.hairColor = randomHairColor;
            avatarState.clothingColor = randomClothingColor;
            avatarState.skinColor = randomSkinColor;
            
            // Update UI
            updateActiveOption('hairstyleOptions', randomHairstyle.id);
            updateActiveOption('clothingOptions', randomClothing.id);
            updateActiveColor('hairColorOptions', randomHairColor);
            updateActiveColor('clothingColorOptions', randomClothingColor);
            updateActiveColor('skinColorOptions', randomSkinColor);
            
            // Update avatar
            updateAvatar();
        }

        // Download avatar as PNG
        function downloadAvatar() {
            const svgElement = document.getElementById('avatarSvg');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions
            canvas.width = 500;
            canvas.height = 500;
            
            // Create an image from SVG
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = function() {
                // Draw the image on canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Add avatar name text
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = '#2c3e50';
                ctx.textAlign = 'center';
                ctx.fillText(avatarState.avatarName, canvas.width/2, 470);
                
                // Create download link
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `${avatarState.avatarName.replace(/\s+/g, '_')}_avatar.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                // Clean up
                URL.revokeObjectURL(url);
            };
            
            img.src = url;
        }

        // Initialize the app when page loads
        window.addEventListener('DOMContentLoaded', initApp);
