        // DOM Elements
        const wallpaperCanvas = document.getElementById('wallpaperCanvas');
        const quoteDisplay = document.getElementById('quoteDisplay');
        const quoteText = document.getElementById('quoteText');
        const quoteAuthor = document.getElementById('quoteAuthor');
        const quoteInput = document.getElementById('quoteInput');
        const authorInput = document.getElementById('authorInput');
        const colorSchemes = document.getElementById('colorSchemes');
        const fontOptions = document.getElementById('fontOptions');
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const fontSizeValue = document.getElementById('fontSizeValue');
        const textAlignOptions = document.getElementById('textAlignOptions');
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        const generateBtn = document.getElementById('generateBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const randomQuoteBtn = document.getElementById('randomQuoteBtn');
        const quotesGrid = document.getElementById('quotesGrid');
        const notification = document.getElementById('notification');
        const notificationTitle = document.getElementById('notificationTitle');
        const notificationMessage = document.getElementById('notificationMessage');

        // Canvas context
        const ctx = wallpaperCanvas.getContext('2d');

        // Current wallpaper settings
        let currentSettings = {
            quote: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            colorScheme: "autumn",
            fontFamily: "Playfair Display",
            fontSize: 42,
            textAlign: "left",
            opacity: 0.8
        };

        // Color schemes (no blue or purple)
        const colorPalettes = {
            autumn: {
                name: "Autumn Warmth",
                colors: ["#8B4513", "#D2691E", "#CD853F"],
                textColor: "#2C1810"
            },
            sunset: {
                name: "Sunset Glow",
                colors: ["#FF7F50", "#FF6347", "#FF4500"],
                textColor: "#2C1810"
            },
            earth: {
                name: "Earth Tones",
                colors: ["#556B2F", "#8FBC8F", "#BDB76B"],
                textColor: "#2C1810"
            },
            golden: {
                name: "Golden Hour",
                colors: ["#DAA520", "#F4A460", "#FFD700"],
                textColor: "#2C1810"
            },
            coffee: {
                name: "Coffee Blend",
                colors: ["#4B3621", "#6F4E37", "#A0522D"],
                textColor: "#F5F5DC"
            },
            desert: {
                name: "Desert Sands",
                colors: ["#DEB887", "#F5DEB3", "#F4A460"],
                textColor: "#2C1810"
            }
        };

        // Quote library
        const quoteLibrary = [
            {
                text: "The journey of a thousand miles begins with one step.",
                author: "Lao Tzu"
            },
            {
                text: "Life is what happens to you while you're busy making other plans.",
                author: "John Lennon"
            },
            {
                text: "In the middle of difficulty lies opportunity.",
                author: "Albert Einstein"
            },
            {
                text: "The purpose of our lives is to be happy.",
                author: "Dalai Lama"
            },
            {
                text: "You only live once, but if you do it right, once is enough.",
                author: "Mae West"
            },
            {
                text: "If you want to live a happy life, tie it to a goal, not to people or things.",
                author: "Albert Einstein"
            },
            {
                text: "The best time to plant a tree was 20 years ago. The second best time is now.",
                author: "Chinese Proverb"
            },
            {
                text: "Don't count the days, make the days count.",
                author: "Muhammad Ali"
            },
            {
                text: "It is during our darkest moments that we must focus to see the light.",
                author: "Aristotle"
            },
            {
                text: "Whoever is happy will make others happy too.",
                author: "Anne Frank"
            },
            {
                text: "The secret of getting ahead is getting started.",
                author: "Mark Twain"
            },
            {
                text: "Everything you've ever wanted is on the other side of fear.",
                author: "George Addair"
            },
            {
                text: "I can't change the direction of the wind, but I can adjust my sails to always reach my destination.",
                author: "Jimmy Dean"
            },
            {
                text: "Believe you can and you're halfway there.",
                author: "Theodore Roosevelt"
            },
            {
                text: "You miss 100% of the shots you don't take.",
                author: "Wayne Gretzky"
            },
            {
                text: "The mind is everything. What you think you become.",
                author: "Buddha"
            }
        ];

        // Initialize the app
        function initApp() {
            // Set canvas size to match preview container
            updateCanvasSize();
            
            // Set initial values
            fontSizeValue.textContent = `${currentSettings.fontSize}px`;
            opacityValue.textContent = `${currentSettings.opacity * 100}%`;
            
            // Generate initial wallpaper
            generateWallpaper();
            
            // Populate quote library
            populateQuoteLibrary();
            
            // Set up event listeners
            setupEventListeners();
        }

        // Update canvas size to match container
        function updateCanvasSize() {
            const preview = document.getElementById('wallpaperPreview');
            wallpaperCanvas.width = preview.clientWidth;
            wallpaperCanvas.height = preview.clientHeight;
        }

        // Generate the wallpaper
        function generateWallpaper() {
            // Clear canvas
            ctx.clearRect(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);
            
            // Get current color palette
            const palette = colorPalettes[currentSettings.colorScheme];
            
            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);
            gradient.addColorStop(0, palette.colors[0]);
            gradient.addColorStop(0.5, palette.colors[1]);
            gradient.addColorStop(1, palette.colors[2]);
            
            // Fill with gradient
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);
            
            // Add some texture/pattern for visual interest
            addCanvasTexture();
            
            // Update quote display styling
            updateQuoteDisplay();
            
            // Show notification
            showNotification("Wallpaper Updated", "Your wallpaper has been generated with the new settings.");
        }

        // Add texture to canvas background
        function addCanvasTexture() {
            // Create a subtle noise effect
            const imageData = ctx.getImageData(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);
            const data = imageData.data;
            
            // Add very subtle noise
            for (let i = 0; i < data.length; i += 4) {
                // Only affect every 10th pixel for subtlety
                if (Math.random() > 0.9) {
                    const noise = Math.random() * 10 - 5; // -5 to +5
                    data[i] = Math.min(255, Math.max(0, data[i] + noise));     // R
                    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
                    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // B
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // Add a very subtle vignette effect
            const vignette = ctx.createRadialGradient(
                wallpaperCanvas.width / 2, wallpaperCanvas.height / 2, 0,
                wallpaperCanvas.width / 2, wallpaperCanvas.height / 2, Math.max(wallpaperCanvas.width, wallpaperCanvas.height) / 1.5
            );
            
            vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vignette.addColorStop(1, `rgba(0, 0, 0, ${0.1 * currentSettings.opacity})`);
            
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, wallpaperCanvas.width, wallpaperCanvas.height);
        }

        // Update the quote display styling
        function updateQuoteDisplay() {
            const palette = colorPalettes[currentSettings.colorScheme];
            
            // Update text content
            quoteText.textContent = currentSettings.quote;
            quoteAuthor.textContent = currentSettings.author ? `— ${currentSettings.author}` : "";
            
            // Update styles
            quoteText.style.fontFamily = currentSettings.fontFamily;
            quoteText.style.fontSize = `${currentSettings.fontSize}px`;
            quoteText.style.textAlign = currentSettings.textAlign;
            quoteText.style.color = palette.textColor;
            
            quoteAuthor.style.fontFamily = currentSettings.fontFamily === "Dancing Script" ? "Dancing Script" : "Montserrat";
            quoteAuthor.style.color = palette.textColor;
            quoteAuthor.style.opacity = "0.9";
            
            // Update display container opacity
            quoteDisplay.style.backgroundColor = `rgba(255, 248, 240, ${currentSettings.opacity})`;
            quoteDisplay.style.backdropFilter = `blur(${10 * currentSettings.opacity}px)`;
            quoteDisplay.style.borderRadius = "15px";
            quoteDisplay.style.padding = "40px";
            quoteDisplay.style.boxShadow = `0 10px 30px rgba(0, 0, 0, ${0.2 * currentSettings.opacity})`;
        }

        // Populate the quote library grid
        function populateQuoteLibrary() {
            quotesGrid.innerHTML = "";
            
            quoteLibrary.forEach((quote, index) => {
                const quoteItem = document.createElement('div');
                quoteItem.className = 'quote-item';
                quoteItem.dataset.index = index;
                
                quoteItem.innerHTML = `
                    <div class="quote-item-text">"${quote.text}"</div>
                    <div class="quote-item-author">— ${quote.author}</div>
                `;
                
                quoteItem.addEventListener('click', () => {
                    // Update inputs with selected quote
                    quoteInput.value = quote.text;
                    authorInput.value = quote.author;
                    
                    // Update current settings
                    currentSettings.quote = quote.text;
                    currentSettings.author = quote.author;
                    
                    // Generate wallpaper
                    generateWallpaper();
                    
                    // Scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
                
                quotesGrid.appendChild(quoteItem);
            });
        }

        // Get a random quote from the library
        function getRandomQuote() {
            const randomIndex = Math.floor(Math.random() * quoteLibrary.length);
            const randomQuote = quoteLibrary[randomIndex];
            
            // Update inputs
            quoteInput.value = randomQuote.text;
            authorInput.value = randomQuote.author;
            
            // Update current settings
            currentSettings.quote = randomQuote.text;
            currentSettings.author = randomQuote.author;
            
            // Generate wallpaper
            generateWallpaper();
        }

        // Download the wallpaper as an image
        function downloadWallpaper() {
            // Create a temporary canvas with higher resolution for download
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // Set higher resolution for better quality download
            const scale = 2;
            tempCanvas.width = wallpaperCanvas.width * scale;
            tempCanvas.height = wallpaperCanvas.height * scale;
            
            // Get current palette
            const palette = colorPalettes[currentSettings.colorScheme];
            
            // Create gradient background on temp canvas
            const gradient = tempCtx.createLinearGradient(0, 0, tempCanvas.width, tempCanvas.height);
            gradient.addColorStop(0, palette.colors[0]);
            gradient.addColorStop(0.5, palette.colors[1]);
            gradient.addColorStop(1, palette.colors[2]);
            
            tempCtx.fillStyle = gradient;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Add texture to temp canvas
            addTextureToCanvas(tempCtx, tempCanvas.width, tempCanvas.height);
            
            // Add quote text to temp canvas
            tempCtx.fillStyle = palette.textColor;
            tempCtx.font = `bold ${currentSettings.fontSize * scale}px "${currentSettings.fontFamily}"`;
            tempCtx.textAlign = currentSettings.textAlign;
            
            // Calculate text position
            const maxWidth = tempCanvas.width * 0.8;
            const x = currentSettings.textAlign === 'center' ? tempCanvas.width / 2 :
                     currentSettings.textAlign === 'right' ? tempCanvas.width * 0.9 : tempCanvas.width * 0.1;
            const y = tempCanvas.height / 2 - (currentSettings.fontSize * scale);
            
            // Wrap text
            const words = currentSettings.quote.split(' ');
            let line = '';
            let lineHeight = currentSettings.fontSize * scale * 1.4;
            let lineY = y;
            
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                const metrics = tempCtx.measureText(testLine);
                const testWidth = metrics.width;
                
                if (testWidth > maxWidth && i > 0) {
                    tempCtx.fillText(line, x, lineY);
                    line = words[i] + ' ';
                    lineY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            tempCtx.fillText(line, x, lineY);
            
            // Add author if exists
            if (currentSettings.author) {
                const authorFontSize = currentSettings.fontSize * scale * 0.6;
                tempCtx.font = `italic ${authorFontSize}px "${currentSettings.fontFamily === "Dancing Script" ? "Dancing Script" : "Montserrat"}"`;
                tempCtx.fillText(`— ${currentSettings.author}`, x, lineY + lineHeight * 0.8);
            }
            
            // Create download link
            const link = document.createElement('a');
            link.download = `quote-wallpaper-${Date.now()}.png`;
            link.href = tempCanvas.toDataURL('image/png');
            link.click();
            
            // Show notification
            showNotification("Download Started", "Your wallpaper is being downloaded as a high-quality PNG image.");
        }

        // Add texture to a canvas
        function addTextureToCanvas(context, width, height) {
            const imageData = context.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            // Add subtle noise
            for (let i = 0; i < data.length; i += 4) {
                if (Math.random() > 0.9) {
                    const noise = Math.random() * 10 - 5;
                    data[i] = Math.min(255, Math.max(0, data[i] + noise));
                    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
                    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
                }
            }
            
            context.putImageData(imageData, 0, 0);
            
            // Add vignette
            const vignette = context.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) / 1.5
            );
            
            vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vignette.addColorStop(1, `rgba(0, 0, 0, ${0.1 * currentSettings.opacity})`);
            
            context.fillStyle = vignette;
            context.fillRect(0, 0, width, height);
        }

        // Show notification
        function showNotification(title, message) {
            notificationTitle.textContent = title;
            notificationMessage.textContent = message;
            notification.classList.add('show');
            
            // Auto-hide after 4 seconds
            setTimeout(() => {
                notification.classList.remove('show');
            }, 4000);
        }

        // Set up event listeners
        function setupEventListeners() {
            // Update canvas size on window resize
            window.addEventListener('resize', () => {
                updateCanvasSize();
                generateWallpaper();
            });
            
            // Color scheme selection
            colorSchemes.querySelectorAll('.color-scheme').forEach(scheme => {
                scheme.addEventListener('click', () => {
                    // Remove active class from all schemes
                    colorSchemes.querySelectorAll('.color-scheme').forEach(s => {
                        s.classList.remove('active');
                    });
                    
                    // Add active class to clicked scheme
                    scheme.classList.add('active');
                    
                    // Update current settings
                    currentSettings.colorScheme = scheme.dataset.scheme;
                    
                    // Generate wallpaper
                    generateWallpaper();
                });
            });
            
            // Font selection
            fontOptions.querySelectorAll('.font-option').forEach(font => {
                font.addEventListener('click', () => {
                    // Remove active class from all fonts
                    fontOptions.querySelectorAll('.font-option').forEach(f => {
                        f.classList.remove('active');
                    });
                    
                    // Add active class to clicked font
                    font.classList.add('active');
                    
                    // Update current settings
                    currentSettings.fontFamily = font.dataset.font;
                    
                    // Generate wallpaper
                    generateWallpaper();
                });
            });
            
            // Font size slider
            fontSizeSlider.addEventListener('input', () => {
                const size = parseInt(fontSizeSlider.value);
                fontSizeValue.textContent = `${size}px`;
                currentSettings.fontSize = size;
                generateWallpaper();
            });
            
            // Text alignment selection
            textAlignOptions.querySelectorAll('.align-option').forEach(align => {
                align.addEventListener('click', () => {
                    // Remove active class from all align options
                    textAlignOptions.querySelectorAll('.align-option').forEach(a => {
                        a.classList.remove('active');
                    });
                    
                    // Add active class to clicked align option
                    align.classList.add('active');
                    
                    // Update current settings
                    currentSettings.textAlign = align.dataset.align;
                    
                    // Generate wallpaper
                    generateWallpaper();
                });
            });
            
            // Opacity slider
            opacitySlider.addEventListener('input', () => {
                const opacity = parseInt(opacitySlider.value) / 100;
                opacityValue.textContent = `${opacity * 100}%`;
                currentSettings.opacity = opacity;
                generateWallpaper();
            });
            
            // Generate button
            generateBtn.addEventListener('click', () => {
                // Update current settings from inputs
                currentSettings.quote = quoteInput.value.trim();
                currentSettings.author = authorInput.value.trim();
                
                // Generate wallpaper
                generateWallpaper();
            });
            
            // Download button
            downloadBtn.addEventListener('click', downloadWallpaper);
            
            // Random quote button
            randomQuoteBtn.addEventListener('click', getRandomQuote);
            
            // Allow Enter key to generate (while in textarea)
            quoteInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    generateBtn.click();
                }
            });
        }

        // Initialize the app when page loads
        window.addEventListener('load', initApp);