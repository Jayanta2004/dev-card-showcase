// script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const canvasPlaceholder = document.getElementById('canvasPlaceholder');
    
    // Theme toggler
    const themeToggle = document.getElementById('themeToggle');
    
    // Image info elements
    const fileNameElement = document.getElementById('fileName');
    const fileSizeElement = document.getElementById('fileSize');
    const fileDimensionsElement = document.getElementById('fileDimensions');
    
    // Transformation buttons
    const rotateLeftBtn = document.getElementById('rotateLeft');
    const rotateRightBtn = document.getElementById('rotateRight');
    const flipHorizontalBtn = document.getElementById('flipHorizontal');
    const flipVerticalBtn = document.getElementById('flipVertical');
    const applyCropBtn = document.getElementById('applyCrop');
    
    // Crop inputs
    const cropXInput = document.getElementById('cropX');
    const cropYInput = document.getElementById('cropY');
    const cropWidthInput = document.getElementById('cropWidth');
    const cropHeightInput = document.getElementById('cropHeight');
    
    // Filter sliders
    const brightnessSlider = document.getElementById('brightness');
    const contrastSlider = document.getElementById('contrast');
    const saturationSlider = document.getElementById('saturation');
    const grayscaleSlider = document.getElementById('grayscale');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    // Slider value displays
    const brightnessValue = document.getElementById('brightnessValue');
    const contrastValue = document.getElementById('contrastValue');
    const saturationValue = document.getElementById('saturationValue');
    const grayscaleValue = document.getElementById('grayscaleValue');
    
    // Resize controls
    const resizeWidthInput = document.getElementById('resizeWidth');
    const resizeHeightInput = document.getElementById('resizeHeight');
    const maintainAspectCheckbox = document.getElementById('maintainAspect');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const applyResizeBtn = document.getElementById('applyResize');
    
    // Watermark controls
    const watermarkTextInput = document.getElementById('watermarkText');
    const watermarkOpacitySlider = document.getElementById('watermarkOpacity');
    const watermarkSizeSlider = document.getElementById('watermarkSize');
    const addWatermarkBtn = document.getElementById('addWatermark');
    const removeWatermarkBtn = document.getElementById('removeWatermark');
    const watermarkOpacityValue = document.getElementById('watermarkOpacityValue');
    const watermarkSizeValue = document.getElementById('watermarkSizeValue');
    
    // Canvas controls
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetZoomBtn = document.getElementById('resetZoom');
    const zoomValue = document.getElementById('zoomValue');
    
    // Download controls
    const formatSelect = document.getElementById('formatSelect');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');
    const estimatedSizeElement = document.getElementById('estimatedSize');
    
    // Footer buttons
    const resetAllBtn = document.getElementById('resetAllBtn');
    const helpBtn = document.getElementById('helpBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    
    // Modals
    const helpModal = document.getElementById('helpModal');
    const aboutModal = document.getElementById('aboutModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // App state
    let currentImage = null;
    let originalImage = null;
    let currentRotation = 0;
    let currentScaleX = 1;
    let currentScaleY = 1;
    let zoomLevel = 1;
    let filters = {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: 0
    };
    
    let hasWatermark = false;
    let watermarkSettings = {
        text: '© ImageCanvas',
        opacity: 70,
        size: 24
    };
    
    // Initialize the app
    function init() {
        // Set initial theme
        const savedTheme = localStorage.getItem('imageCanvasTheme') || 'light';
        setTheme(savedTheme);
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize canvas size
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);
        
        // Image upload
        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        imageInput.addEventListener('change', handleImageUpload);
        
        // Transformations
        rotateLeftBtn.addEventListener('click', () => rotateImage(-90));
        rotateRightBtn.addEventListener('click', () => rotateImage(90));
        flipHorizontalBtn.addEventListener('click', () => flipImage('horizontal'));
        flipVerticalBtn.addEventListener('click', () => flipImage('vertical'));
        applyCropBtn.addEventListener('click', applyCrop);
        
        // Filter sliders
        brightnessSlider.addEventListener('input', updateFilter);
        contrastSlider.addEventListener('input', updateFilter);
        saturationSlider.addEventListener('input', updateFilter);
        grayscaleSlider.addEventListener('input', updateFilter);
        resetFiltersBtn.addEventListener('click', resetFilters);
        
        // Resize controls
        resizeWidthInput.addEventListener('input', handleWidthChange);
        applyResizeBtn.addEventListener('click', applyResize);
        
        // Watermark controls
        watermarkTextInput.addEventListener('input', (e) => {
            watermarkSettings.text = e.target.value || '© ImageCanvas';
        });
        watermarkOpacitySlider.addEventListener('input', (e) => {
            watermarkSettings.opacity = parseInt(e.target.value);
            watermarkOpacityValue.textContent = `${watermarkSettings.opacity}%`;
        });
        watermarkSizeSlider.addEventListener('input', (e) => {
            watermarkSettings.size = parseInt(e.target.value);
            watermarkSizeValue.textContent = watermarkSettings.size;
        });
        addWatermarkBtn.addEventListener('click', addWatermark);
        removeWatermarkBtn.addEventListener('click', removeWatermark);
        
        // Canvas controls
        zoomInBtn.addEventListener('click', () => adjustZoom(1.1));
        zoomOutBtn.addEventListener('click', () => adjustZoom(0.9));
        resetZoomBtn.addEventListener('click', resetZoom);
        
        // Download controls
        downloadBtn.addEventListener('click', downloadImage);
        copyBtn.addEventListener('click', copyToClipboard);
        formatSelect.addEventListener('change', updateEstimatedSize);
        
        // Footer buttons
        resetAllBtn.addEventListener('click', resetAll);
        helpBtn.addEventListener('click', () => showModal(helpModal));
        aboutBtn.addEventListener('click', () => showModal(aboutModal));
        
        // Modal close buttons
        closeModalButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                helpModal.style.display = 'none';
                aboutModal.style.display = 'none';
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.style.display = 'none';
            if (e.target === aboutModal) aboutModal.style.display = 'none';
        });
    }
    
    // Theme functions
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('imageCanvasTheme', theme);
        
        // Update theme button text and icon
        if (theme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark';
        }
    }
    
    // Image upload functions
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
    }
    
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                loadImage(file);
            } else {
                alert('Please upload an image file (JPEG, PNG, etc.)');
            }
        }
    }
    
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            loadImage(file);
        }
    }
    
    function loadImage(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                originalImage = img;
                currentImage = img;
                currentRotation = 0;
                currentScaleX = 1;
                currentScaleY = 1;
                zoomLevel = 1;
                
                // Reset filters
                resetFilters();
                
                // Update image info
                updateImageInfo(file, img);
                
                // Update crop/resize inputs with image dimensions
                cropWidthInput.value = img.width;
                cropHeightInput.value = img.height;
                resizeWidthInput.value = img.width;
                resizeHeightInput.value = img.height;
                
                // Remove watermark
                hasWatermark = false;
                
                // Draw image
                drawImage();
                
                // Hide placeholder
                canvasPlaceholder.style.display = 'none';
                
                // Update estimated file size
                updateEstimatedSize();
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    function updateImageInfo(file, img) {
        fileNameElement.textContent = file.name;
        fileSizeElement.textContent = formatFileSize(file.size);
        fileDimensionsElement.textContent = `${img.width} × ${img.height}px`;
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Canvas drawing functions
    function updateCanvasSize() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        if (currentImage) {
            drawImage();
        }
    }
    
    function drawImage() {
        if (!currentImage) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate image dimensions with rotation
        let drawWidth = currentImage.width;
        let drawHeight = currentImage.height;
        
        // Apply rotation
        if (currentRotation === 90 || currentRotation === 270) {
            [drawWidth, drawHeight] = [drawHeight, drawWidth];
        }
        
        // Apply zoom
        drawWidth *= zoomLevel;
        drawHeight *= zoomLevel;
        
        // Center the image on canvas
        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;
        
        // Save context state
        ctx.save();
        
        // Move to center of canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // Apply rotation
        ctx.rotate(currentRotation * Math.PI / 180);
        
        // Apply flip
        ctx.scale(currentScaleX, currentScaleY);
        
        // Apply filters
        applyCanvasFilters();
        
        // Draw image
        ctx.drawImage(
            currentImage,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );
        
        // Apply watermark if needed
        if (hasWatermark) {
            applyWatermark();
        }
        
        // Restore context state
        ctx.restore();
    }
    
    function applyCanvasFilters() {
        let filterString = '';
        
        if (filters.brightness !== 100) {
            filterString += `brightness(${filters.brightness}%) `;
        }
        
        if (filters.contrast !== 100) {
            filterString += `contrast(${filters.contrast}%) `;
        }
        
        if (filters.saturation !== 100) {
            filterString += `saturate(${filters.saturation}%) `;
        }
        
        if (filters.grayscale !== 0) {
            filterString += `grayscale(${filters.grayscale}%) `;
        }
        
        ctx.filter = filterString.trim();
    }
    
    // Transformation functions
    function rotateImage(degrees) {
        currentRotation = (currentRotation + degrees) % 360;
        if (currentRotation < 0) currentRotation += 360;
        drawImage();
    }
    
    function flipImage(direction) {
        if (direction === 'horizontal') {
            currentScaleX *= -1;
        } else if (direction === 'vertical') {
            currentScaleY *= -1;
        }
        drawImage();
    }
    
    function applyCrop() {
        if (!currentImage) return;
        
        const x = parseInt(cropXInput.value) || 0;
        const y = parseInt(cropYInput.value) || 0;
        const width = parseInt(cropWidthInput.value) || 100;
        const height = parseInt(cropHeightInput.value) || 100;
        
        // Create a temporary canvas for cropping
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        // Apply current filters to the cropped image
        applyCanvasFilters.call({ filter: tempCtx.filter });
        
        // Draw the cropped portion
        tempCtx.drawImage(
            currentImage,
            x, y, width, height,
            0, 0, width, height
        );
        
        // Create a new image from the cropped canvas
        const croppedImage = new Image();
        croppedImage.onload = function() {
            currentImage = croppedImage;
            
            // Update crop/resize inputs
            cropWidthInput.value = width;
            cropHeightInput.value = height;
            resizeWidthInput.value = width;
            resizeHeightInput.value = height;
            
            // Reset transformations
            currentRotation = 0;
            currentScaleX = 1;
            currentScaleY = 1;
            zoomLevel = 1;
            zoomValue.textContent = '100%';
            
            drawImage();
            updateEstimatedSize();
        };
        croppedImage.src = tempCanvas.toDataURL();
    }
    
    // Filter functions
    function updateFilter(e) {
        const filterName = e.target.id;
        const value = parseInt(e.target.value);
        
        filters[filterName] = value;
        
        // Update the value display
        document.getElementById(`${filterName}Value`).textContent = `${value}%`;
        
        drawImage();
        updateEstimatedSize();
    }
    
    function resetFilters() {
        // Reset filter values
        filters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            grayscale: 0
        };
        
        // Reset sliders
        brightnessSlider.value = 100;
        contrastSlider.value = 100;
        saturationSlider.value = 100;
        grayscaleSlider.value = 0;
        
        // Reset value displays
        brightnessValue.textContent = '100%';
        contrastValue.textContent = '100%';
        saturationValue.textContent = '100%';
        grayscaleValue.textContent = '0%';
        
        drawImage();
        updateEstimatedSize();
    }
    
    // Resize functions
    function handleWidthChange() {
        if (!currentImage || !maintainAspectCheckbox.checked) return;
        
        const newWidth = parseInt(resizeWidthInput.value) || currentImage.width;
        const aspectRatio = currentImage.height / currentImage.width;
        const newHeight = Math.round(newWidth * aspectRatio);
        
        resizeHeightInput.value = newHeight;
    }
    
    function applyResize() {
        if (!currentImage) return;
        
        const width = parseInt(resizeWidthInput.value) || currentImage.width;
        const height = parseInt(resizeHeightInput.value) || currentImage.height;
        
        // Create a temporary canvas for resizing
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        // Apply current filters
        applyCanvasFilters.call({ filter: tempCtx.filter });
        
        // Draw the resized image
        tempCtx.drawImage(currentImage, 0, 0, width, height);
        
        // Create a new image from the resized canvas
        const resizedImage = new Image();
        resizedImage.onload = function() {
            currentImage = resizedImage;
            
            // Update crop inputs
            cropWidthInput.value = width;
            cropHeightInput.value = height;
            
            // Reset zoom
            zoomLevel = 1;
            zoomValue.textContent = '100%';
            
            drawImage();
            updateEstimatedSize();
        };
        resizedImage.src = tempCanvas.toDataURL();
    }
    
    // Watermark functions
    function addWatermark() {
        if (!currentImage) return;
        
        hasWatermark = true;
        watermarkSettings.text = watermarkTextInput.value || '© ImageCanvas';
        watermarkSettings.opacity = parseInt(watermarkOpacitySlider.value);
        watermarkSettings.size = parseInt(watermarkSizeSlider.value);
        
        drawImage();
        updateEstimatedSize();
    }
    
    function removeWatermark() {
        hasWatermark = false;
        drawImage();
        updateEstimatedSize();
    }
    
    function applyWatermark() {
        if (!watermarkSettings.text) return;
        
        // Set watermark properties
        ctx.font = `bold ${watermarkSettings.size}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${watermarkSettings.opacity / 100})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        
        // Draw watermark in the center
        ctx.fillText(watermarkSettings.text, 0, 0);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
    
    // Zoom functions
    function adjustZoom(factor) {
        zoomLevel *= factor;
        zoomLevel = Math.max(0.1, Math.min(5, zoomLevel)); // Limit between 0.1x and 5x
        zoomValue.textContent = `${Math.round(zoomLevel * 100)}%`;
        drawImage();
    }
    
    function resetZoom() {
        zoomLevel = 1;
        zoomValue.textContent = '100%';
        drawImage();
    }
    
    // Download functions
    function updateEstimatedSize() {
        if (!currentImage) {
            estimatedSizeElement.textContent = '-';
            return;
        }
        
        // Create a temporary canvas to estimate file size
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = currentImage.width;
        tempCanvas.height = currentImage.height;
        
        // Apply current filters
        applyCanvasFilters.call({ filter: tempCtx.filter });
        
        // Draw the current image
        tempCtx.drawImage(currentImage, 0, 0);
        
        // Apply watermark if needed
        if (hasWatermark) {
            tempCtx.font = `bold ${watermarkSettings.size}px Arial`;
            tempCtx.fillStyle = `rgba(255, 255, 255, ${watermarkSettings.opacity / 100})`;
            tempCtx.textAlign = 'center';
            tempCtx.textBaseline = 'middle';
            tempCtx.fillText(
                watermarkSettings.text,
                currentImage.width / 2,
                currentImage.height / 2
            );
        }
        
        // Get data URL
        const format = formatSelect.value;
        const quality = parseInt(qualitySlider.value) / 100;
        const dataUrl = tempCanvas.toDataURL(`image/${format}`, quality);
        
        // Estimate size (data URL is about 33% larger than binary)
        const base64Length = dataUrl.length - 'data:image/png;base64,'.length;
        const fileSize = Math.floor(base64Length * 0.75); // Approximate binary size
        
        estimatedSizeElement.textContent = formatFileSize(fileSize);
    }
    
    function downloadImage() {
        if (!currentImage) {
            alert('Please upload an image first');
            return;
        }
        
        // Create a temporary canvas for export
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = currentImage.width;
        tempCanvas.height = currentImage.height;
        
        // Apply current filters
        applyCanvasFilters.call({ filter: tempCtx.filter });
        
        // Draw the current image
        tempCtx.drawImage(currentImage, 0, 0);
        
        // Apply watermark if needed
        if (hasWatermark) {
            tempCtx.font = `bold ${watermarkSettings.size}px Arial`;
            tempCtx.fillStyle = `rgba(255, 255, 255, ${watermarkSettings.opacity / 100})`;
            tempCtx.textAlign = 'center';
            tempCtx.textBaseline = 'middle';
            tempCtx.fillText(
                watermarkSettings.text,
                currentImage.width / 2,
                currentImage.height / 2
            );
        }
        
        // Get format and quality
        const format = formatSelect.value;
        const quality = parseInt(qualitySlider.value) / 100;
        
        // Create download link
        const link = document.createElement('a');
        link.download = `imagecanvas-edited.${format}`;
        link.href = tempCanvas.toDataURL(`image/${format}`, quality);
        link.click();
    }
    
    async function copyToClipboard() {
        if (!currentImage) {
            alert('Please upload an image first');
            return;
        }
        
        try {
            // Create a temporary canvas for export
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCanvas.width = currentImage.width;
            tempCanvas.height = currentImage.height;
            
            // Apply current filters
            applyCanvasFilters.call({ filter: tempCtx.filter });
            
            // Draw the current image
            tempCtx.drawImage(currentImage, 0, 0);
            
            // Apply watermark if needed
            if (hasWatermark) {
                tempCtx.font = `bold ${watermarkSettings.size}px Arial`;
                tempCtx.fillStyle = `rgba(255, 255, 255, ${watermarkSettings.opacity / 100})`;
                tempCtx.textAlign = 'center';
                tempCtx.textBaseline = 'middle';
                tempCtx.fillText(
                    watermarkSettings.text,
                    currentImage.width / 2,
                    currentImage.height / 2
                );
            }
            
            // Get image as blob
            const format = formatSelect.value;
            const quality = parseInt(qualitySlider.value) / 100;
            
            tempCanvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [blob.type]: blob
                        })
                    ]);
                    alert('Image copied to clipboard!');
                } catch (err) {
                    console.error('Failed to copy image: ', err);
                    alert('Failed to copy image to clipboard. Your browser may not support this feature.');
                }
            }, `image/${format}`, quality);
        } catch (err) {
            console.error('Error preparing image for clipboard: ', err);
            alert('Failed to prepare image for clipboard.');
        }
    }
    
    // Utility functions
    function resetAll() {
        if (confirm('Are you sure you want to reset everything? This will clear the current image and all edits.')) {
            // Reset image
            currentImage = null;
            originalImage = null;
            
            // Reset UI
            canvasPlaceholder.style.display = 'flex';
            fileNameElement.textContent = '-';
            fileSizeElement.textContent = '-';
            fileDimensionsElement.textContent = '-';
            estimatedSizeElement.textContent = '-';
            
            // Reset transformation state
            currentRotation = 0;
            currentScaleX = 1;
            currentScaleY = 1;
            zoomLevel = 1;
            zoomValue.textContent = '100%';
            
            // Reset watermark
            hasWatermark = false;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Reset filters
            resetFilters();
            
            // Reset inputs
            cropXInput.value = 0;
            cropYInput.value = 0;
            watermarkTextInput.value = '© ImageCanvas';
            watermarkOpacitySlider.value = 70;
            watermarkSizeSlider.value = 24;
            watermarkOpacityValue.textContent = '70%';
            watermarkSizeValue.textContent = '24';
            
            // Clear file input
            imageInput.value = '';
        }
    }
    
    function showModal(modal) {
        modal.style.display = 'flex';
    }
    
    // Initialize quality slider display
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
        updateEstimatedSize();
    });
    
    // Initialize watermark slider displays
    watermarkOpacityValue.textContent = `${watermarkOpacitySlider.value}%`;
    watermarkSizeValue.textContent = watermarkSizeSlider.value;
    
    // Initialize the app
    init();
});