# 🚀 1-Page Store Submission Guide

Follow these 3 simple phases to get **PayBills** on the App Stores. Everything you need is in this folder.

---

## 🏗️ Phase 1: Native Preparation (One-Time)
Run these commands in your `frontend` terminal to wrap your website:

```bash
# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# 2. Setup Platforms
npx cap init PayBills com.pasturjay.paybills --web-dir out
npx cap add android
npx cap add ios
```

## 🎨 Phase 2: Assets & Icons
Auto-generate all icons/splash screens using the premium images we provided:

```bash
# Install the asset tool
npm install -g @capacitor/assets

# Run the generator
npx capacitor-assets generate --icon ./mobile_store_bundle/assets/icons/app_icon_1024.png --splash ./mobile_store_bundle/assets/splash/splash_screen.png
```

## 📤 Phase 3: Final Submission

### 🤖 For Android (Google Play)
1. **Open Android Studio**: `npx cap open android`.
2. **Build**: `Build > Generate Signed Bundle`.
3. **Upload**: Drop the `.aab` file into the [Google Play Console](https://play.google.com/console).
4. **Metadata**: Copy text from `metadata/android.md`.

### 🍎 For iOS (Apple App Store)
1. **Open Xcode**: `npx cap open ios`.
2. **Build**: Select `Generic iOS Device` and `Product > Archive`.
3. **Upload**: Click `Distribute App` to send to App Store Connect.
4. **Metadata**: Copy text from `metadata/ios.md`.

---

### 💡 Pro Tips for Fast Approval:
- **Privacy Policy**: You MUST have a URL for your privacy policy.
- **Support Email**: Use `support@pasturjay.com` or your preferred email.
- **Reviewer Account**: Create a dummy user (e.g., `testuser@example.com`) for the store reviewers to use while testing your app.
