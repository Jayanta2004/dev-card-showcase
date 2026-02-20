const ImageProcessor = {
    canvas: null,
    ctx: null,
    currentImage: null,
    
    init() {
        this.canvas = document.getElementById('hiddenCanvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    },
    
    loadImage(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                reject(new Error('File must be an image'));
                return;
            }
            
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                reject(new Error('Image must be smaller than 10MB'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    this.currentImage = img;
                    resolve(img);
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    },
    
    samplePixels(density) {
        if (!this.currentImage) {
            throw new Error('No image loaded');
        }
        
        const img = this.currentImage;
        const maxDimension = 200;
        let width = img.width;
        let height = img.height;
        
        if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }
        
        const sampleRate = Math.max(1, 6 - density);
        const sampledWidth = Math.floor(width / sampleRate);
        const sampledHeight = Math.floor(height / sampleRate);
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = this.ctx.getImageData(0, 0, width, height);
        const pixels = [];
        
        for (let y = 0; y < sampledHeight; y++) {
            const row = [];
            for (let x = 0; x < sampledWidth; x++) {
                const srcX = x * sampleRate;
                const srcY = y * sampleRate;
                const index = (srcY * width + srcX) * 4;
                
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                const a = imageData.data[index + 3];
                
                if (a < 128) {
                    row.push({ r: 255, g: 255, b: 255, brightness: 255 });
                } else {
                    const brightness = this.calculateBrightness(r, g, b);
                    row.push({ r, g, b, brightness });
                }
            }
            pixels.push(row);
        }
        
        return pixels;
    },
    
    calculateBrightness(r, g, b) {
        return Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
    },
    
    getImageDimensions() {
        if (!this.currentImage) {
            return { width: 0, height: 0 };
        }
        return {
            width: this.currentImage.width,
            height: this.currentImage.height
        };
    }
};

ImageProcessor.init();
