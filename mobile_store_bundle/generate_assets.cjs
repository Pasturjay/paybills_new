const fs = require('fs');
const { execSync } = require('child_process');

// 1. Write the SVGs
const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#003366" />
    <g transform="translate(192, 280) scale(4)">
        <path d="M30 15 C 30 15, 30 10, 45 10 H 125 C 145 10, 150 20, 150 35 V 55 C 150 65, 145 70, 135 70 H 70 V 55 H 115 V 35 H 65 C 50 35, 50 45, 50 55 V 110 H 30 Z" fill="#ffffff" />
        <path d="M55 80 H 135 C 145 80, 150 85, 150 95 V 115 H 55 Z" fill="#ffffff" />
        <rect x="115" y="35" width="20" height="8" rx="4" fill="#003366" />
    </g>
</svg>`;

const splashSvg = `<svg width="1284" height="2778" viewBox="0 0 1284 2778" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1284" height="2778" fill="#ffffff" />
    <g transform="translate(342, 1100) scale(3.5)">
        <path d="M30 15 C 30 15, 30 10, 45 10 H 125 C 145 10, 150 20, 150 35 V 55 C 150 65, 145 70, 135 70 H 70 V 55 H 115 V 35 H 65 C 50 35, 50 45, 50 55 V 110 H 30 Z" fill="#003366" />
        <path d="M55 80 H 135 C 145 80, 150 85, 150 95 V 115 H 55 Z" fill="#003366" />
        <rect x="115" y="35" width="20" height="8" rx="4" fill="#ffffff" />
    </g>
    <text x="642" y="1580" font-family="sans-serif" font-weight="900" font-size="120" fill="#003366" text-anchor="middle" letter-spacing="-5">PayBills</text>
</svg>`;

const playStoreSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="256" cy="256" r="256" fill="#003366" />
    <g transform="translate(116, 160) scale(1.75)">
        <path d="M30 15 C 30 15, 30 10, 45 10 H 125 C 145 10, 150 20, 150 35 V 55 C 150 65, 145 70, 135 70 H 70 V 55 H 115 V 35 H 65 C 50 35, 50 45, 50 55 V 110 H 30 Z" fill="#ffffff" />
        <path d="M55 80 H 135 C 145 80, 150 85, 150 95 V 115 H 55 Z" fill="#ffffff" />
        <rect x="115" y="35" width="20" height="8" rx="4" fill="#003366" />
    </g>
</svg>`;

const appStoreSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="115" fill="#003366" />
    <g transform="translate(116, 160) scale(1.75)">
        <path d="M30 15 C 30 15, 30 10, 45 10 H 125 C 145 10, 150 20, 150 35 V 55 C 150 65, 145 70, 135 70 H 70 V 55 H 115 V 35 H 65 C 50 35, 50 45, 50 55 V 110 H 30 Z" fill="#ffffff" />
        <path d="M55 80 H 135 C 145 80, 150 85, 150 95 V 115 H 55 Z" fill="#ffffff" />
        <rect x="115" y="35" width="20" height="8" rx="4" fill="#003366" />
    </g>
</svg>`;

fs.mkdirSync('assets/icons', { recursive: true });
fs.mkdirSync('assets/splash', { recursive: true });
fs.mkdirSync('assets/selection', { recursive: true });

fs.writeFileSync('assets/icons/app_icon.svg', iconSvg);
fs.writeFileSync('assets/splash/splash_screen.svg', splashSvg);
fs.writeFileSync('assets/selection/google_play_store.svg', playStoreSvg);
fs.writeFileSync('assets/selection/apple_app_store.svg', appStoreSvg);

console.log("SVGs written. Attempting to convert to PNG...");

try {
    // Generate PNGs
    execSync('npx -y svgexport assets/icons/app_icon.svg assets/icons/app_icon_1024.png 1024:1024');
    execSync('npx -y svgexport assets/splash/splash_screen.svg assets/splash/splash_screen.png 1284:2778');
    execSync('npx -y svgexport assets/selection/google_play_store.svg assets/selection/google_play_store.png 512:512');
    execSync('npx -y svgexport assets/selection/apple_app_store.svg assets/selection/apple_app_store.png 512:512');
    console.log("Successfully generated all mobile asset PNGs!");
} catch (e) {
    console.error("Conversion failed:", e.message);
    if (e.stdout) console.log(e.stdout.toString());
    if (e.stderr) console.error(e.stderr.toString());
}
