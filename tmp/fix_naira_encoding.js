const fs = require('fs');
const path = require('path');

// Use hardcoded path to avoid CWD issues
const srcDir = 'c:/Users/FECUND INTEGRATED/Desktop/paybills/frontend/src';
const corrupted = '\u00E2\u201A\u00A6'; // This matches the 'â‚¦' sequence
const correct = '\u20A6'; // Standard Naira symbol ₦

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(corrupted)) {
                console.log(`Fixing: ${fullPath}`);
                const updatedContent = content.split(corrupted).join(correct);
                fs.writeFileSync(fullPath, updatedContent, 'utf8');
            }
        }
    }
}

console.log('Starting encoding repair...');
processDirectory(srcDir);
console.log('Repair complete.');
