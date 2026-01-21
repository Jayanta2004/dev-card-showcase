// PDF Watermark Tool - Main JavaScript

// Global Variables
let uploadedFiles = [];
let currentFileIndex = 0;
let currentPage = 1;
let totalPages = 0;
let pdfDoc = null;
let canvas = null;
let ctx = null;
let watermarkImage = null;
let processedFiles = [];

// DOM Elements
const dom = {
    fileInput: document.getElementById('fileInput'),
    dropArea: document.getElementById('dropArea'),
    selectedFiles: document.getElementById('selectedFiles'),
    fileCount: document.getElementById('fileCount'),
    totalSize: document.getElementById('totalSize'),
    pdfPreview: document.getElementById('pdfPreview'),
    pageInfo: document.getElementById('pageInfo'),
    prevPage: document.getElementById('prevPage'),
    nextPage: document.getElementById('nextPage'),
    
    // Watermark controls
    watermarkText: document.getElementById('watermarkText'),
    textFont: document.getElementById('textFont'),
    textSize: document.getElementById('textSize'),
    textSizeValue: document.getElementById('textSizeValue'),
    textColor: document.getElementById('textColor'),
    
    imageInput: document.getElementById('imageInput'),
    imagePreview: document.getElementById('imagePreview'),
    imageSize: document.getElementById('imageSize'),
    imageSizeValue: document.getElementById('imageSizeValue'),
    
    opacity: document.getElementById('opacity'),
    opacityValue: document.getElementById('opacityValue'),
    rotation: document.getElementById('rotation'),
    rotationValue: document.getElementById('rotationValue'),
    
    typeBtns: document.querySelectorAll('.type-btn'),
    textControls: document.getElementById('textControls'),
    imageControls: document.getElementById('imageControls'),
    
    posBtns: document.querySelectorAll('.pos-btn'),
    
    pageRadios: document.querySelectorAll('input[name="pages"]'),
    pageRange: document.getElementById('pageRange'),
    
    applyToAll: document.getElementById('applyToAll'),
    batchInfo: document.getElementById('batchInfo'),
    
    applyWatermark: document.getElementById('applyWatermark'),
    downloadAll: document.getElementById('downloadAll'),
    clearAll: document.getElementById('clearAll'),
    
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    
    themeToggle: document.querySelector('.theme-toggle'),
    themeIcon: document.getElementById('themeIcon'),
    
    helpBtn: document.getElementById('helpBtn'),
    aboutBtn: document.getElementById('aboutBtn'),
    helpModal: document.getElementById('helpModal'),
    aboutModal: document.getElementById('aboutModal'),
    modalCloses: document.querySelectorAll('.modal-close')
};

// Initialize the application
function init() {
    setupEventListeners();
    setupDragAndDrop();
    updateBatchInfo();
}

// Setup event listeners
function setupEventListeners() {
    // File upload
    dom.fileInput.addEventListener('change', handleFileSelect);
    dom.dropArea.addEventListener('click', () => dom.fileInput.click());
    
    // PDF navigation
    dom.prevPage.addEventListener('click', prevPage);
    dom.nextPage.addEventListener('click', nextPage);
    
    // Watermark type selection
    dom.typeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchWatermarkType(btn.dataset.type));
    });
    
    // Real-time value displays
    dom.textSize.addEventListener('input', () => {
        dom.textSizeValue.textContent = dom.textSize.value + 'px';
        if (uploadedFiles.length > 0) renderPage();
    });
    
    dom.imageSize.addEventListener('input', () => {
        dom.imageSizeValue.textContent = dom.imageSize.value + 'px';
        if (uploadedFiles.length > 0) renderPage();
    });
    
    dom.opacity.addEventListener('input', () => {
        const value = Math.round(dom.opacity.value * 100);
        dom.opacityValue.textContent = value + '%';
        if (uploadedFiles.length > 0) renderPage();
    });
    
    dom.rotation.addEventListener('input', () => {
        dom.rotationValue.textContent = dom.rotation.value + '°';
        if (uploadedFiles.length > 0) renderPage();
    });
    
    // Color change
    dom.textColor.addEventListener('input', () => {
        if (uploadedFiles.length > 0) renderPage();
    });
    
    // Font change
    dom.textFont.addEventListener('change', () => {
        if (uploadedFiles.length > 0) renderPage();
    });
    
    // Text change
    dom.watermarkText.addEventListener('input', () => {
        if (uploadedFiles.length > 0) renderPage();
    });
    
    // Image upload
    dom.imageInput.addEventListener('change', handleImageUpload);
    
    // Position selection
    dom.posBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dom.posBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (uploadedFiles.length > 0) renderPage();
        });
    });
    
    // Page range selection
    dom.pageRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            dom.pageRange.disabled = this.value !== 'custom';
            if (this.value === 'custom') {
                dom.pageRange.focus();
            }
        });
    });
    
    dom.pageRange.addEventListener('input', () => {
        if (uploadedFiles.length > 0) renderPage();
    });
    
    // Batch processing
    dom.applyToAll.addEventListener('change', updateBatchInfo);
    
    // Action buttons
    dom.applyWatermark.addEventListener('click', applyWatermarkToFiles);
    dom.downloadAll.addEventListener('click', downloadAllFiles);
    dom.clearAll.addEventListener('click', clearAllFiles);
    
    // Theme toggle
    dom.themeToggle.addEventListener('click', toggleTheme);
    
    // Modal controls
    dom.helpBtn.addEventListener('click', () => showModal(dom.helpModal));
    dom.aboutBtn.addEventListener('click', () => showModal(dom.aboutModal));
    
    dom.modalCloses.forEach(close => {
        close.addEventListener('click', () => {
            close.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Setup drag and drop
function setupDragAndDrop() {
    const dropArea = dom.dropArea;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.style.borderColor = '#3498db';
        dropArea.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
    }
    
    function unhighlight() {
        dropArea.style.borderColor = '#bdc3c7';
        dropArea.style.backgroundColor = '#ecf0f1';
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
}

// Handle file selection
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
        alert('Please select PDF files only.');
        return;
    }
    
    pdfFiles.forEach(file => {
        if (!uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
            uploadedFiles.push({
                file: file,
                name: file.name,
                size: file.size,
                status: 'pending'
            });
        }
    });
    
    updateFileList();
    updateFileStats();
    
    if (uploadedFiles.length > 0 && currentFileIndex === 0) {
        loadPDF(uploadedFiles[0].file);
    }
}

// Handle image upload for watermark
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        watermarkImage = new Image();
        watermarkImage.onload = function() {
            dom.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Watermark">`;
            if (uploadedFiles.length > 0) renderPage();
        };
        watermarkImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Update file list display
function updateFileList() {
    dom.selectedFiles.innerHTML = '';
    
    uploadedFiles.forEach((fileData, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info-left">
                <i class="fas fa-file-pdf file-icon"></i>
                <div>
                    <div class="file-name" title="${fileData.name}">${fileData.name}</div>
                    <div class="file-size">${formatFileSize(fileData.size)}</div>
                </div>
            </div>
            <i class="fas fa-times file-remove" data-index="${index}"></i>
        `;
        
        dom.selectedFiles.appendChild(fileItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.file-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            removeFile(index);
        });
    });
}

// Update file statistics
function updateFileStats() {
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    dom.fileCount.textContent = `${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''} selected`;
    dom.totalSize.textContent = formatFileSize(totalSize);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Remove a file
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFileList();
    updateFileStats();
    
    if (uploadedFiles.length === 0) {
        clearPreview();
        currentFileIndex = 0;
    } else if (currentFileIndex >= uploadedFiles.length) {
        currentFileIndex = uploadedFiles.length - 1;
        loadPDF(uploadedFiles[currentFileIndex].file);
    }
}

// Load and display PDF
async function loadPDF(file) {
    try {
        showLoading();
        
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        totalPages = pdfDoc.getPageCount();
        
        // Create canvas if it doesn't exist
        if (!canvas) {
            canvas = document.createElement('canvas');
            ctx = canvas.getContext('2d');
            dom.pdfPreview.innerHTML = '';
            dom.pdfPreview.appendChild(canvas);
        }
        
        currentPage = 1;
        updatePageInfo();
        await renderPage();
        
        hideLoading();
    } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF file. Please make sure it\'s a valid PDF.');
        hideLoading();
    }
}

// Render current page with watermark preview
async function renderPage() {
    if (!pdfDoc || !canvas) return;
    
    try {
        const page = await pdfDoc.getPage(currentPage - 1);
        
        // Calculate scale for canvas
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Apply watermark preview
        applyWatermarkPreview();
    } catch (error) {
        console.error('Error rendering page:', error);
    }
}

// Apply watermark preview on canvas
function applyWatermarkPreview() {
    if (!ctx) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Save context state
    ctx.save();
    
    // Set global alpha for opacity
    ctx.globalAlpha = parseFloat(dom.opacity.value);
    
    // Get position
    const position = getCurrentPosition();
    
    // Calculate position coordinates
    let x, y;
    switch (position) {
        case 'top-left':
            x = canvasWidth * 0.1;
            y = canvasHeight * 0.1;
            break;
        case 'top-center':
            x = canvasWidth / 2;
            y = canvasHeight * 0.1;
            break;
        case 'top-right':
            x = canvasWidth * 0.9;
            y = canvasHeight * 0.1;
            break;
        case 'middle-left':
            x = canvasWidth * 0.1;
            y = canvasHeight / 2;
            break;
        case 'center':
            x = canvasWidth / 2;
            y = canvasHeight / 2;
            break;
        case 'middle-right':
            x = canvasWidth * 0.9;
            y = canvasHeight / 2;
            break;
        case 'bottom-left':
            x = canvasWidth * 0.1;
            y = canvasHeight * 0.9;
            break;
        case 'bottom-center':
            x = canvasWidth / 2;
            y = canvasHeight * 0.9;
            break;
        case 'bottom-right':
            x = canvasWidth * 0.9;
            y = canvasHeight * 0.9;
            break;
        default:
            x = canvasWidth / 2;
            y = canvasHeight / 2;
    }
    
    // Apply rotation
    ctx.translate(x, y);
    ctx.rotate(parseInt(dom.rotation.value) * Math.PI / 180);
    
    const watermarkType = document.querySelector('.type-btn.active').dataset.type;
    
    if (watermarkType === 'text') {
        // Text watermark
        const text = dom.watermarkText.value || 'CONFIDENTIAL';
        const fontSize = parseInt(dom.textSize.value);
        const fontColor = dom.textColor.value;
        const fontFamily = dom.textFont.value;
        
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fontColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
    } else if (watermarkType === 'image' && watermarkImage) {
        // Image watermark
        const imgSize = parseInt(dom.imageSize.value);
        ctx.drawImage(
            watermarkImage,
            -imgSize / 2,
            -imgSize / 2,
            imgSize,
            imgSize
        );
    }
    
    // Restore context state
    ctx.restore();
}

// Get current position from active button
function getCurrentPosition() {
    const activeBtn = document.querySelector('.pos-btn.active');
    return activeBtn ? activeBtn.dataset.pos : 'center';
}

// Get pages to apply watermark to
function getPagesToApply() {
    const selected = document.querySelector('input[name="pages"]:checked').value;
    
    switch (selected) {
        case 'all':
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        case 'first':
            return [1];
        case 'custom':
            return parsePageRange(dom.pageRange.value);
        default:
            return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
}

// Parse page range string (e.g., "1-3,5,7-10")
function parsePageRange(rangeStr) {
    if (!rangeStr.trim()) return [];
    
    const pages = new Set();
    const parts = rangeStr.split(',');
    
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) {
                if (i >= 1 && i <= totalPages) pages.add(i);
            }
        } else {
            const page = Number(part);
            if (page >= 1 && page <= totalPages) pages.add(page);
        }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
}

// Switch between text and image watermark controls
function switchWatermarkType(type) {
    dom.typeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) btn.classList.add('active');
    });
    
    if (type === 'text') {
        dom.textControls.style.display = 'block';
        dom.imageControls.style.display = 'none';
    } else {
        dom.textControls.style.display = 'none';
        dom.imageControls.style.display = 'block';
    }
    
    if (uploadedFiles.length > 0) renderPage();
}

// Update batch processing info
function updateBatchInfo() {
    const applyToAll = dom.applyToAll.checked;
    if (applyToAll) {
        dom.batchInfo.textContent = `Will apply same settings to all ${uploadedFiles.length} files`;
    } else {
        dom.batchInfo.textContent = `Processing 1 file at a time`;
    }
}

// Apply watermark to files
async function applyWatermarkToFiles() {
    if (uploadedFiles.length === 0) {
        alert('Please upload PDF files first.');
        return;
    }
    
    const watermarkType = document.querySelector('.type-btn.active').dataset.type;
    
    if (watermarkType === 'image' && !watermarkImage) {
        alert('Please upload an image for the watermark.');
        return;
    }
    
    processedFiles = [];
    dom.progressContainer.style.display = 'block';
    dom.applyWatermark.disabled = true;
    
    const filesToProcess = dom.applyToAll.checked ? uploadedFiles : [uploadedFiles[currentFileIndex]];
    
    for (let i = 0; i < filesToProcess.length; i++) {
        const fileData = filesToProcess[i];
        dom.progressText.textContent = `Processing: ${fileData.name} (${i + 1}/${filesToProcess.length})`;
        dom.progressFill.style.width = `${((i) / filesToProcess.length) * 100}%`;
        
        try {
            const watermarkedPDF = await addWatermarkToPDF(fileData.file);
            processedFiles.push({
                name: `watermarked_${fileData.name}`,
                data: watermarkedPDF
            });
            
            fileData.status = 'processed';
        } catch (error) {
            console.error('Error processing file:', error);
            fileData.status = 'error';
        }
        
        // Update UI
        updateFileList();
    }
    
    dom.progressFill.style.width = '100%';
    dom.progressText.textContent = 'Processing complete!';
    dom.applyWatermark.disabled = false;
    dom.downloadAll.disabled = false;
    
    // Auto-hide progress bar after 3 seconds
    setTimeout(() => {
        dom.progressContainer.style.display = 'none';
        dom.progressFill.style.width = '0%';
    }, 3000);
}

// Add watermark to a PDF
async function addWatermarkToPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const pagesToApply = getPagesToApply();
    
    const watermarkType = document.querySelector('.type-btn.active').dataset.type;
    const opacity = parseFloat(dom.opacity.value);
    const rotation = parseInt(dom.rotation.value);
    const position = getCurrentPosition();
    
    for (const pageNum of pagesToApply) {
        if (pageNum > pages.length) continue;
        
        const page = pages[pageNum - 1];
        const { width, height } = page.getSize();
        
        // Calculate position
        let x, y;
        switch (position) {
            case 'top-left': x = width * 0.1; y = height * 0.9; break;
            case 'top-center': x = width / 2; y = height * 0.9; break;
            case 'top-right': x = width * 0.9; y = height * 0.9; break;
            case 'middle-left': x = width * 0.1; y = height / 2; break;
            case 'center': x = width / 2; y = height / 2; break;
            case 'middle-right': x = width * 0.9; y = height / 2; break;
            case 'bottom-left': x = width * 0.1; y = height * 0.1; break;
            case 'bottom-center': x = width / 2; y = height * 0.1; break;
            case 'bottom-right': x = width * 0.9; y = height * 0.1; break;
        }
        
        if (watermarkType === 'text') {
            // Add text watermark
            const text = dom.watermarkText.value || 'CONFIDENTIAL';
            const fontSize = parseInt(dom.textSize.value);
            const fontColor = dom.textColor.value;
            const fontFamily = dom.textFont.value;
            
            page.drawText(text, {
                x: x,
                y: y,
                size: fontSize,
                color: PDFLib.rgbFromHex(fontColor.replace('#', '')),
                opacity: opacity,
                rotate: PDFLib.degrees(rotation),
                font: await pdfDoc.embedFont(PDFLib.StandardFonts[fontFamily === 'Arial' ? 'Helvetica' : fontFamily])
            });
        } else if (watermarkType === 'image' && watermarkImage) {
            // Add image watermark
            const imageBytes = await fetch(watermarkImage.src).then(res => res.arrayBuffer());
            let image;
            
            if (watermarkImage.src.includes('png')) {
                image = await pdfDoc.embedPng(imageBytes);
            } else {
                image = await pdfDoc.embedJpg(imageBytes);
            }
            
            const imgSize = parseInt(dom.imageSize.value);
            const scale = imgSize / Math.max(image.width, image.height);
            
            page.drawImage(image, {
                x: x - (image.width * scale) / 2,
                y: y - (image.height * scale) / 2,
                width: image.width * scale,
                height: image.height * scale,
                opacity: opacity,
                rotate: PDFLib.degrees(rotation)
            });
        }
    }
    
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

// Download all processed files
function downloadAllFiles() {
    if (processedFiles.length === 0) return;
    
    if (processedFiles.length === 1) {
        downloadFile(processedFiles[0].name, processedFiles[0].data);
    } else {
        // Create zip file for multiple files
        alert('Multiple files would be downloaded as a ZIP file. (ZIP functionality requires additional library)');
        // For simplicity, download first file
        downloadFile(processedFiles[0].name, processedFiles[0].data);
    }
}

// Download a single file
function downloadFile(filename, data) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Clear all files
function clearAllFiles() {
    if (uploadedFiles.length === 0 && processedFiles.length === 0) return;
    
    if (confirm('Are you sure you want to clear all files?')) {
        uploadedFiles = [];
        processedFiles = [];
        currentFileIndex = 0;
        pdfDoc = null;
        watermarkImage = null;
        
        updateFileList();
        updateFileStats();
        clearPreview();
        dom.downloadAll.disabled = true;
        dom.imagePreview.innerHTML = '';
    }
}

// Clear preview
function clearPreview() {
    dom.pdfPreview.innerHTML = `
        <div class="preview-placeholder">
            <i class="fas fa-file-pdf"></i>
            <p>Upload PDF to preview</p>
        </div>
    `;
    dom.pageInfo.textContent = 'Page 0 of 0';
    canvas = null;
    ctx = null;
}

// PDF navigation
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePageInfo();
        renderPage();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        updatePageInfo();
        renderPage();
    }
}

function updatePageInfo() {
    dom.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    dom.prevPage.disabled = currentPage === 1;
    dom.nextPage.disabled = currentPage === totalPages;
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = dom.themeIcon;
    
    if (document.body.classList.contains('dark-theme')) {
        document.body.style.backgroundColor = '#1a1a2e';
        document.body.style.color = '#ffffff';
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Show modal
function showModal(modal) {
    modal.style.display = 'flex';
}

// Loading states
function showLoading() {
    const preview = dom.pdfPreview.querySelector('.preview-placeholder');
    if (preview) {
        preview.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading PDF...</p>
        `;
    }
}

function hideLoading() {
    // Loading state is cleared when canvas is created
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add CSS for dark theme
const darkThemeCSS = `
    .dark-theme {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
        color: #ffffff !important;
    }
    
    .dark-theme .left-panel,
    .dark-theme .right-panel,
    .dark-theme .modal-content {
        background: #2d3047 !important;
        color: #ffffff !important;
    }
    
    .dark-theme input,
    .dark-theme select,
    .dark-theme textarea {
        background: #3a3e5c !important;
        color: #ffffff !important;
        border-color: #4a4e7a !important;
    }
    
    .dark-theme .upload-area,
    .dark-theme .image-upload {
        background: #3a3e5c !important;
        border-color: #4a4e7a !important;
    }
    
    .dark-theme .file-item {
        background: #3a3e5c !important;
        border-color: #4a4e7a !important;
    }
    
    .dark-theme .preview-container {
        border-color: #4a4e7a !important;
    }
    
    .dark-theme .btn-secondary {
        background: #3a3e5c !important;
        color: #ffffff !important;
        border-color: #4a4e7a !important;
    }
    
    .dark-theme .type-btn,
    .dark-theme .pos-btn {
        background: #3a3e5c !important;
        color: #ffffff !important;
        border-color: #4a4e7a !important;
    }
    
    .dark-theme .type-btn.active,
    .dark-theme .pos-btn.active {
        background: #3498db !important;
        border-color: #3498db !important;
    }
    
    .dark-theme .radio-label:hover,
    .dark-theme .checkbox-label:hover {
        background: rgba(52, 152, 219, 0.1) !important;
    }
    
    .dark-theme .batch-info {
        background: rgba(52, 152, 219, 0.2) !important;
    }
    
    .dark-theme .pdf-preview {
        background: #1a1a2e !important;
    }
`;

// Add dark theme CSS to document
const style = document.createElement('style');
style.textContent = darkThemeCSS;
document.head.appendChild(style);