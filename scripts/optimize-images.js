const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDirs = [
    path.join(__dirname, '../assets/images'),
    path.join(__dirname, '../assets/favicon')
];

/**
 * Optimizes images in-place to reduce sizing.
 */
async function optimizeImages(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            await optimizeImages(filePath);
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
            const tempPath = filePath + '.tmp';

            try {
                let sharpInstance = sharp(filePath);

                if (/\.(jpg|jpeg)$/i.test(file)) {
                    sharpInstance = sharpInstance.jpeg({ quality: 80, mozjpeg: true });
                } else if (/\.png$/i.test(file)) {
                    sharpInstance = sharpInstance.png({ quality: 80, compressionLevel: 8 });
                } else if (/\.webp$/i.test(file)) {
                    sharpInstance = sharpInstance.webp({ quality: 80 });
                }

                await sharpInstance.toFile(tempPath);
                fs.renameSync(tempPath, filePath);
                console.log(`Optimized: ${filePath}`);
            } catch (error) {
                console.error(`Error optimizing ${filePath}:`, error);
                if (fs.existsSync(tempPath)) {
                    fs.unlinkSync(tempPath);
                }
            }
        }
    }
}

async function run() {
    console.log('Starting image optimization...');
    for (const dir of inputDirs) {
        await optimizeImages(dir);
    }
    console.log('Image optimization complete!');
}

run();
