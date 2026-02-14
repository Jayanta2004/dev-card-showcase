        // DOM Elements
        const qrContent = document.getElementById('qr-content');
        const qrType = document.getElementById('qr-type');
        const qrSize = document.getElementById('qr-size');
        const sizeValue = document.getElementById('size-value');
        const errorCorrection = document.getElementById('error-correction');
        const generateBtn = document.getElementById('generate-btn');
        const downloadBtn = document.getElementById('download-btn');
        const clearBtn = document.getElementById('clear-btn');
        const qrcodeCanvas = document.getElementById('qrcode');
        const qrcodeContainer = document.getElementById('qrcode-container');
        const qrcodePlaceholder = document.getElementById('qrcode-placeholder');
        const colorPreviews = document.querySelectorAll('.color-preview');
        const downloadOptions = document.querySelectorAll('.download-btn');
        const exampleCards = document.querySelectorAll('.example-card');
        
        // State variables
        let currentQRCode = null;
        let selectedColor = "#000000";
        let currentDownloadFormat = "png";
        
        // Initialize the app
        function init() {
            updateSizeDisplay();
            attachEventListeners();
            generateQRCode(); // Generate initial QR code
        }
        
        // Attach event listeners
        function attachEventListeners() {
            // Generate button
            generateBtn.addEventListener('click', generateQRCode);
            
            // Clear button
            clearBtn.addEventListener('click', clearQRCode);
            
            // Size slider
            qrSize.addEventListener('input', updateSizeDisplay);
            qrSize.addEventListener('change', generateQRCode);
            
            // Color selection
            colorPreviews.forEach(preview => {
                preview.addEventListener('click', () => {
                    // Remove active class from all colors
                    colorPreviews.forEach(p => p.classList.remove('active'));
                    
                    // Add active class to clicked color
                    preview.classList.add('active');
                    
                    // Update selected color
                    selectedColor = preview.getAttribute('data-color');
                    
                    // Regenerate QR code with new color
                    generateQRCode();
                });
            });
            
            // Download format selection
            downloadOptions.forEach(option => {
                option.addEventListener('click', () => {
                    currentDownloadFormat = option.getAttribute('data-format');
                    downloadQRCode();
                });
            });
            
            // Download button
            downloadBtn.addEventListener('click', () => downloadQRCode());
            
            // Example cards
            exampleCards.forEach(card => {
                card.addEventListener('click', () => {
                    const content = card.getAttribute('data-content');
                    qrContent.value = content;
                    generateQRCode();
                });
            });
            
            // QR type change
            qrType.addEventListener('change', () => {
                // Update placeholder text based on type
                const type = qrType.value;
                let placeholder = "";
                
                switch(type) {
                    case 'url':
                        placeholder = "Enter URL (e.g., https://example.com)";
                        break;
                    case 'text':
                        placeholder = "Enter any text you want to encode...";
                        break;
                    case 'email':
                        placeholder = "Enter email address (e.g., mailto:user@example.com)";
                        break;
                    case 'wifi':
                        placeholder = "Enter WiFi details (e.g., WIFI:T:WPA;S:NetworkName;P:Password;;)";
                        break;
                    case 'phone':
                        placeholder = "Enter phone number (e.g., tel:+1234567890)";
                        break;
                }
                
                qrContent.placeholder = placeholder;
            });
            
            // Error correction change
            errorCorrection.addEventListener('change', generateQRCode);
        }
        
        // Update size display
        function updateSizeDisplay() {
            sizeValue.textContent = `${qrSize.value}px`;
            qrcodeContainer.style.width = `${qrSize.value}px`;
            qrcodeContainer.style.height = `${qrSize.value}px`;
        }
        
        // Generate QR code
        function generateQRCode() {
            const content = qrContent.value.trim();
            
            if (!content) {
                alert("Please enter some content to generate a QR code.");
                return;
            }
            
            // Format content based on selected type
            let formattedContent = content;
            const type = qrType.value;
            
            if (type === 'email' && !content.startsWith('mailto:')) {
                formattedContent = `mailto:${content}`;
            } else if (type === 'phone' && !content.startsWith('tel:')) {
                formattedContent = `tel:${content}`;
            } else if (type === 'url' && !content.startsWith('http://') && !content.startsWith('https://')) {
                formattedContent = `https://${content}`;
            }
            
            // Clear previous QR code
            const ctx = qrcodeCanvas.getContext('2d');
            ctx.clearRect(0, 0, qrcodeCanvas.width, qrcodeCanvas.height);
            
            // Set canvas size
            const size = parseInt(qrSize.value);
            qrcodeCanvas.width = size;
            qrcodeCanvas.height = size;
            
            // Generate QR code
            try {
                QRCode.toCanvas(qrcodeCanvas, formattedContent, {
                    width: size,
                    margin: 1,
                    color: {
                        dark: selectedColor,
                        light: "#ffffff"
                    },
                    errorCorrectionLevel: errorCorrection.value
                }, function(error) {
                    if (error) {
                        console.error(error);
                        alert("Error generating QR code. Please try different content.");
                        return;
                    }
                    
                    // Show QR code and hide placeholder
                    qrcodeCanvas.style.display = 'block';
                    qrcodePlaceholder.style.display = 'none';
                    
                    // Enable download button
                    downloadBtn.disabled = false;
                    
                    // Store current QR code
                    currentQRCode = qrcodeCanvas;
                });
            } catch (error) {
                console.error("QR Code generation error:", error);
                alert("Could not generate QR code. Please check your input.");
            }
        }
        
        // Download QR code
        function downloadQRCode() {
            if (!currentQRCode) {
                alert("Please generate a QR code first.");
                return;
            }
            
            // Create a temporary link element
            const link = document.createElement('a');
            
            // Generate filename
            const content = qrContent.value.trim().substring(0, 20);
            const sanitizedContent = content.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `qrcode_${sanitizedContent || 'myqrcode'}`;
            
            if (currentDownloadFormat === 'svg') {
                // For SVG, we need to generate a new QR code
                const size = parseInt(qrSize.value);
                
                QRCode.toString(qrContent.value, {
                    type: 'svg',
                    width: size,
                    margin: 1,
                    color: {
                        dark: selectedColor,
                        light: "#ffffff"
                    },
                    errorCorrectionLevel: errorCorrection.value
                }, function(error, svgString) {
                    if (error) {
                        console.error(error);
                        alert("Error generating SVG QR code.");
                        return;
                    }
                    
                    const blob = new Blob([svgString], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    
                    link.href = url;
                    link.download = `${filename}.svg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Clean up URL
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                });
            } else {
                // For PNG/JPG, use the canvas
                let mimeType, extension;
                
                if (currentDownloadFormat === 'jpg') {
                    mimeType = 'image/jpeg';
                    extension = 'jpg';
                } else {
                    mimeType = 'image/png';
                    extension = 'png';
                }
                
                link.href = currentQRCode.toDataURL(mimeType);
                link.download = `${filename}.${extension}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
        
        // Clear QR code
        function clearQRCode() {
            qrContent.value = '';
            qrcodeCanvas.style.display = 'none';
            qrcodePlaceholder.style.display = 'block';
            downloadBtn.disabled = true;
            currentQRCode = null;
        }
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', init);