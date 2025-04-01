const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

// Create Chrome package
const createChromePackage = () => {
    console.log('Creating Chrome package...');
    const zip = new AdmZip();

    // Add dist directory contents
    const distDir = path.join(__dirname, '../dist');
    if (fs.existsSync(distDir)) {
        const distFiles = fs.readdirSync(distDir);
        distFiles.forEach(file => {
            if (!file.endsWith('.zip')) {
                zip.addLocalFile(path.join(distDir, file), 'dist');
            }
        });
    }

    // Add manifest.json for Chrome package
    zip.addLocalFile(path.join(__dirname, '../manifest.json'), '', 'manifest.json');
    
    // Add background script to src directory
    zip.addLocalFile(path.join(__dirname, '../src/background.js'), 'src');

    // Add CSS files from src/styles
    const stylesDir = path.join(__dirname, '../src/styles');
    if (fs.existsSync(stylesDir)) {
        const styleFiles = fs.readdirSync(stylesDir);
        styleFiles.forEach(file => {
            if (file.endsWith('.css')) {
                zip.addLocalFile(path.join(stylesDir, file), 'src/styles');
            }
        });
    }
    
    // Add options.html and options.js
    const srcDir = path.join(__dirname, '../src');
    if (fs.existsSync(srcDir)) {
        ['options.html', 'options.js'].forEach(file => {
            const filePath = path.join(srcDir, file);
            if (fs.existsSync(filePath)) {
                zip.addLocalFile(filePath, 'src');
            }
        });
    }
    
    // Add icons
    const iconsDir = path.join(__dirname, '../icons');
    if (fs.existsSync(iconsDir)) {
        const iconFiles = fs.readdirSync(iconsDir);
        iconFiles.forEach(file => {
            if (file.endsWith('.png')) {
                zip.addLocalFile(path.join(iconsDir, file), 'icons');
            }
        });
    }
    
    // Add _locales directory
    const localesDir = path.join(__dirname, '../_locales');
    if (fs.existsSync(localesDir)) {
        const localeDirs = fs.readdirSync(localesDir);
        localeDirs.forEach(localeDir => {
            const localePath = path.join(localesDir, localeDir);
            if (fs.statSync(localePath).isDirectory()) {
                const localeFiles = fs.readdirSync(localePath);
                localeFiles.forEach(file => {
                    if (file === 'messages.json') {
                        zip.addLocalFile(path.join(localePath, file), `_locales/${localeDir}`);
                    }
                });
            }
        });
    }

    // Create dist directory if it doesn't exist
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    // Write the zip file
    zip.writeZip(path.join(distDir, 'metasearch-chrome.zip'));
    

    console.log('Chrome package created: dist/metasearch-chrome.zip');
};

// Create Firefox package
const createFirefoxPackage = () => {
    console.log('Creating Firefox package...');
    const zip = new AdmZip();

    // Add dist directory contents
    const distDir = path.join(__dirname, '../dist');
    if (fs.existsSync(distDir)) {
        const distFiles = fs.readdirSync(distDir);
        distFiles.forEach(file => {
            if (!file.endsWith('.zip')) {
                zip.addLocalFile(path.join(distDir, file), 'dist');
            }
        });
    }

    // Add manifest.firefox.json as manifest.json
    zip.addLocalFile(path.join(__dirname, '../manifest.firefox.json'), '', 'manifest.json');

    // Add background script to root directory
    zip.addLocalFile(path.join(__dirname, '../src/background.js'), '', 'background.js');

    // Add CSS files from src/styles
    const stylesDir = path.join(__dirname, '../src/styles');
    if (fs.existsSync(stylesDir)) {
        const styleFiles = fs.readdirSync(stylesDir);
        styleFiles.forEach(file => {
            if (file.endsWith('.css')) {
                zip.addLocalFile(path.join(stylesDir, file), 'src/styles');
            }
        });
    }
    
    // Add options.html and options.js
    const srcDir = path.join(__dirname, '../src');
    if (fs.existsSync(srcDir)) {
        ['options.html', 'options.js'].forEach(file => {
            const filePath = path.join(srcDir, file);
            if (fs.existsSync(filePath)) {
                zip.addLocalFile(filePath, 'src');
            }
        });
    }

    // Add icons
    const iconsDir = path.join(__dirname, '../icons');
    if (fs.existsSync(iconsDir)) {
        const iconFiles = fs.readdirSync(iconsDir);
        iconFiles.forEach(file => {
            if (file.endsWith('.png')) {
                zip.addLocalFile(path.join(iconsDir, file), 'icons');
            }
        });
    }
    
    // Add _locales directory
    const localesDir = path.join(__dirname, '../_locales');
    if (fs.existsSync(localesDir)) {
        const localeDirs = fs.readdirSync(localesDir);
        localeDirs.forEach(localeDir => {
            const localePath = path.join(localesDir, localeDir);
            if (fs.statSync(localePath).isDirectory()) {
                const localeFiles = fs.readdirSync(localePath);
                localeFiles.forEach(file => {
                    if (file === 'messages.json') {
                        zip.addLocalFile(path.join(localePath, file), `_locales/${localeDir}`);
                    }
                });
            }
        });
    }

    // Create dist directory if it doesn't exist
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    // Write the zip file
    zip.writeZip(path.join(distDir, 'metasearch-firefox.zip'));
    
    console.log('Firefox package created: dist/metasearch-firefox.zip');
};

// Create both packages
createChromePackage();
createFirefoxPackage();