const App = {
    state: {
        currentFile: null,
        pixelData: null,
        settings: {
            textSize: 8,
            density: 3,
            charSet: 'medium',
            invert: false
        }
    },

    elements: {},
    debounceTimer: null,

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.updateControlValues();
    },

    cacheElements() {
        this.elements = {
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            fileInfo: document.getElementById('fileInfo'),
            errorMessage: document.getElementById('errorMessage'),
            controlsSection: document.getElementById('controlsSection'),
            outputSection: document.getElementById('outputSection'),
            outputContainer: document.getElementById('outputContainer'),
            textSizeSlider: document.getElementById('textSize'),
            textSizeValue: document.getElementById('textSizeValue'),
            densitySlider: document.getElementById('density'),
            densityValue: document.getElementById('densityValue'),
            charSetSelect: document.getElementById('charSet'),
            invertToggle: document.getElementById('invert'),
            generateBtn: document.getElementById('generateBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            copyBtn: document.getElementById('copyBtn'),
            resetBtn: document.getElementById('resetBtn')
        };
    },

    attachEventListeners() {
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.add('drag-over');
        });

        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.classList.remove('drag-over');
        });

        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            this.handleFileSelect(file);
        });

        this.elements.textSizeSlider.addEventListener('input', (e) => {
            this.state.settings.textSize = parseInt(e.target.value);
            this.updateControlValues();
            this.debouncedRegenerate();
        });

        this.elements.densitySlider.addEventListener('input', (e) => {
            this.state.settings.density = parseInt(e.target.value);
            this.updateControlValues();
            this.updateSliderProgress(this.elements.densitySlider);
        });

        this.elements.densitySlider.addEventListener('change', () => {
            this.regenerateFromImage();
        });

        this.elements.charSetSelect.addEventListener('change', (e) => {
            this.state.settings.charSet = e.target.value;
            this.debouncedRegenerate();
        });

        this.elements.invertToggle.addEventListener('change', (e) => {
            this.state.settings.invert = e.target.checked;
            this.debouncedRegenerate();
        });

        this.elements.generateBtn.addEventListener('click', () => {
            this.regenerateFromImage();
        });

        this.elements.downloadBtn.addEventListener('click', () => {
            this.downloadAsText();
        });

        this.elements.copyBtn.addEventListener('click', () => {
            this.copyToClipboard();
        });

        this.elements.resetBtn.addEventListener('click', () => {
            this.resetSettings();
        });

        this.updateSliderProgress(this.elements.textSizeSlider);
        this.updateSliderProgress(this.elements.densitySlider);

        this.elements.textSizeSlider.addEventListener('input', (e) => {
            this.updateSliderProgress(e.target);
        });
    },

    updateSliderProgress(slider) {
        const value = slider.value;
        const min = slider.min || 0;
        const max = slider.max || 100;
        const percentage = ((value - min) / (max - min)) * 100;
        slider.style.setProperty('--range-progress', `${percentage}%`);
    },

    updateControlValues() {
        this.elements.textSizeValue.textContent = `${this.state.settings.textSize}px`;

        const densityLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
        this.elements.densityValue.textContent = densityLabels[this.state.settings.density - 1];

        this.updateSliderProgress(this.elements.textSizeSlider);
        this.updateSliderProgress(this.elements.densitySlider);
    },

    async handleFileSelect(file) {
        if (!file) return;

        this.hideError();

        try {
            await ImageProcessor.loadImage(file);
            this.state.currentFile = file;

            this.elements.fileInfo.textContent = `✓ ${file.name} loaded`;
            this.elements.fileInfo.classList.add('active');

            this.elements.controlsSection.classList.add('active');

            this.regenerateFromImage();

        } catch (error) {
            this.showError(error.message);
        }
    },

    regenerateFromImage() {
        if (!this.state.currentFile) return;

        try {
            this.state.pixelData = ImageProcessor.samplePixels(this.state.settings.density);
            this.renderOutput();
        } catch (error) {
            this.showError(error.message);
        }
    },

    debouncedRegenerate() {
        if (!this.state.pixelData) return;

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.renderOutput();
        }, 100);
    },

    renderOutput() {
        if (!this.state.pixelData) return;

        TextRenderer.renderToDOM(
            this.elements.outputContainer,
            this.state.pixelData,
            this.state.settings
        );

        this.elements.outputSection.classList.add('active');
    },

    downloadAsText() {
        const textContent = TextRenderer.getTextContent(this.elements.outputContainer);

        if (!textContent) {
            this.showError('No text portrait to download');
            return;
        }

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'textify-portrait.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    async copyToClipboard() {
        const textContent = TextRenderer.getTextContent(this.elements.outputContainer);

        if (!textContent) {
            this.showError('No text portrait to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(textContent);

            const originalHTML = this.elements.copyBtn.innerHTML;
            this.elements.copyBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 6L8 14L4 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;

            setTimeout(() => {
                this.elements.copyBtn.innerHTML = originalHTML;
            }, 2000);

        } catch (error) {
            this.showError('Failed to copy to clipboard');
        }
    },

    resetSettings() {
        this.state.settings = {
            textSize: 8,
            density: 3,
            charSet: 'medium',
            invert: false
        };

        this.elements.textSizeSlider.value = 8;
        this.elements.densitySlider.value = 3;
        this.elements.charSetSelect.value = 'medium';
        this.elements.invertToggle.checked = false;

        this.updateControlValues();

        if (this.state.currentFile) {
            this.regenerateFromImage();
        }
    },

    showError(message) {
        this.elements.errorMessage.textContent = `⚠ ${message}`;
        this.elements.errorMessage.classList.add('active');

        setTimeout(() => {
            this.hideError();
        }, 5000);
    },

    hideError() {
        this.elements.errorMessage.classList.remove('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
