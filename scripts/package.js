const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

// Initialize zip
const zip = new AdmZip();

// Add dist directory contents
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
    const distFiles = fs.readdirSync(distDir);
    distFiles.forEach(file => {
        zip.addLocalFile(path.join(distDir, file));
    });
}

// Add manifest.json
zip.addLocalFile(path.join(__dirname, '../manifest.json'));

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

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Write the zip file
zip.writeZip(path.join(distDir, 'metasearch.zip'));

console.log('Extension package created: dist/metasearch.zip');