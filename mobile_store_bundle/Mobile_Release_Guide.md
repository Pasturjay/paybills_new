# 📱 PayBills Mobile Release & Deployment Guide

This guide details how to convert your Next.js web application into a native mobile app for the **Google Play Store** and **Apple App Store** using **Capacitor**.

## 🚀 Step 1: Initialize Capacitor
Run the following commands in your `frontend` directory:

```bash
# 1. Install Capacitor Core & CLI
npm install @capacitor/core @capacitor/cli

# 2. Initialize Capacitor
npx cap init PayBills com.pasturjay.paybills --web-dir out

# 3. Add Android and iOS Platforms
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

## 🏗️ Step 2: Build for Production
Capacitor works with static builds. Update your `next.config.mjs` to use `output: 'export'`:

```javascript
// next.config.mjs
const nextConfig = {
  output: 'export', // Required for Capacitor
  // ... rest of your config
}
```

Then run the build:
```bash
npm run build
npx cap sync
```

## 🎨 Step 3: Configure Assets
We have prepared a `mobile_store_bundle/assets` folder for you.
Use the **Capacitor Assets** tool to auto-generate all required sizes:

```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --icon ./mobile_store_bundle/assets/icons/app_icon_1024.png --splash ./mobile_store_bundle/assets/splash/splash_screen.png
```

## 🤖 Step 4: Google Play Store (Android)
1.  **Open Android Studio**: `npx cap open android`
2.  **Configure Signing**: Go to `Build > Generate Signed Bundle / APK`.
3.  **Create Key Store**: If you don't have one, create a new `.jks` file.
4.  **Build Bundle**: Select `Android App Bundle (.aab)`.
5.  **Upload**: High to the [Google Play Console](https://play.google.com/console).

## 🍎 Step 5: Apple App Store (iOS)
1.  **Open Xcode**: `npx cap open ios`
2.  **Select Team**: In the 'Signing & Capabilities' tab, select your Apple Developer Team.
3.  **Archive**: Select `Generic iOS Device` and go to `Product > Archive`.
4.  **Distribute**: Click `Distribute App` and follow the prompts to upload to TestFlight/App Store.

## 📝 Compliance Checklist
- [ ] **Privacy Policy**: Host your privacy policy at a public URL.
- [ ] **Support Email**: Ensure `support@pasturjay.com` (or similar) is active.
- [ ] **Terms of Use**: Provide a link to your terms.
- [ ] **App Review Account**: Create a test user account for reviewers to bypass login.
- [ ] **Data Safety**: Disclose that you handle financial data in the Play Console.

## 📦 Store Metadata
Detailed descriptions and keywords are located in `./mobile_store_bundle/metadata/`.
