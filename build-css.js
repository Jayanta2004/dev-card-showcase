#!/usr/bin/env node

/**
 * CSS Build Script
 * Concatenates and minifies CSS modules for production
 * Generates both development (expanded) and production (minified) versions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
    modulesDir: './css-modules',
    outputDir: './dist',
    devOutput: './style.css',
    prodOutput: './style.min.css',
    sourceMapOutput: './style.css.map',
    modules: [
        '00-variables.css',
        '01-base.css',
        '02-navigation.css',
        // Additional modules will be added as they're created
    ]
};

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Read and concatenate CSS modules
 */
function concatenateCSS(modules, modulesDir) {
    return modules.map(module => {
        const filePath = path.join(modulesDir, module);
        if (fs.existsSync(filePath)) {
            console.log(`  ✓ ${module}`);
            return fs.readFileSync(filePath, 'utf8');
        } else {
            console.warn(`  ⚠ ${module} not found, skipping...`);
            return '';
        }
    }).join('\n\n');
}

/**
 * Minify CSS by removing comments and extra whitespace
 */
function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove multiple whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around special characters
        .replace(/\s*([{}:;,>~+])\s*/g, '$1')
        // Remove trailing semicolons
        .replace(/;}/g, '}')
        // Remove leading/trailing whitespace
        .trim();
}

/**
 * Generate source map (simplified version)
 */
function generateSourceMap(originalCSS, minifiedCSS) {
    const version = 3;
    const mappings = 'AAAA'; // Simplified mapping

    return JSON.stringify({
        version,
        sources: ['style.css'],
        names: [],
        mappings,
        file: 'style.min.css',
    });
}

/**
 * Add banner comment to output files
 */
function addBanner(css, type) {
    const banner = `/*!
 * Dev Card Showcase - ${type} CSS
 * Generated: ${new Date().toISOString()}
 * Modules: ${CONFIG.modules.length}
 * Lines: ${css.split('\n').length}
 */\n\n`;
    return banner + css;
}

/**
 * Main build function
 */
function build() {
    console.log('\n🔨 CSS Build Process Started\n');
    console.log('📦 Configuration:');
    console.log(`   Modules Directory: ${CONFIG.modulesDir}`);
    console.log(`   Output Directory: ${CONFIG.outputDir}`);
    console.log(`   Modules: ${CONFIG.modules.length}\n`);

    // Ensure output directory exists
    ensureDir(CONFIG.outputDir);

    // Concatenate modules
    console.log('📝 Concatenating CSS modules:');
    const concatenatedCSS = concatenateCSS(CONFIG.modules, CONFIG.modulesDir);
    console.log(`\n✓ Concatenated CSS: ${concatenatedCSS.length} bytes\n`);

    // Write development version
    console.log('💾 Writing development version...');
    const devCSS = addBanner(concatenatedCSS, 'Development');
    fs.writeFileSync(CONFIG.devOutput, devCSS);
    console.log(`  ✓ ${CONFIG.devOutput} (${devCSS.length} bytes)\n`);

    // Minify for production
    console.log('⚡ Minifying CSS for production...');
    const minifiedCSS = minifyCSS(concatenatedCSS);
    const prodCSS = addBanner(minifiedCSS, 'Production');
    fs.writeFileSync(CONFIG.prodOutput, prodCSS);
    console.log(`  ✓ ${CONFIG.prodOutput} (${prodCSS.length} bytes)\n`);

    // Generate source map
    console.log('🗺️  Generating source map...');
    const sourceMap = generateSourceMap(concatenatedCSS, minifiedCSS);
    fs.writeFileSync(CONFIG.sourceMapOutput, sourceMap);
    console.log(`  ✓ ${CONFIG.sourceMapOutput}\n`);

    // Calculate savings
    const originalSize = concatenatedCSS.length;
    const minifiedSize = minifiedCSS.length;
    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(2);

    console.log('📊 Build Statistics:');
    console.log(`   Original Size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Minified Size: ${(minifiedSize / 1024).toFixed(2)} KB`);
    console.log(`   Savings: ${savings}%\n`);

    console.log('✅ Build completed successfully!\n');
}

/**
 * Watch mode for development
 */
function watch() {
    console.log('👀 Watching for changes...\n');
    build();

    const chokidar = require('chokidar');

    const watcher = chokidar.watch(path.join(CONFIG.modulesDir, '*.css'), {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    watcher
        .on('change', (filePath) => {
            console.log(`\n📝 File changed: ${path.basename(filePath)}`);
            build();
        })
        .on('error', error => console.error(`Watcher error: ${error}`));
}

// CLI interface
const command = process.argv[2] || 'build';

if (command === 'watch') {
    try {
        watch();
    } catch (error) {
        console.error('Watch mode requires chokidar. Install it with: npm install chokidar');
        console.log('Falling back to single build...\n');
        build();
    }
} else if (command === 'build') {
    build();
} else {
    console.log('Usage: node build-css.js [build|watch]');
    console.log('  build  - Build CSS once (default)');
    console.log('  watch  - Watch for changes and rebuild');
    process.exit(1);
}
