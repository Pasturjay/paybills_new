# Paybills - Digital Lifestyle Platform

Paybills is a comprehensive digital services and lifestyle management platform designed to simplify everyday transactions for users in Nigeria and beyond. With an intuitive interface, robust backend architecture, and a focus on speed and security, Paybills offers an all-in-one hub for essential utility payments, digital products, and subscriptions.

## 🚀 Key Features & Services

### 1. Airtime & Data Recharge
- Instant top-ups for all major telecommunication networks.
- Seamless data bundle subscriptions directly from the user's wallet.
- Support for automated routing and instant delivery.

### 2. Bill Payments (Electricity & Cable TV)
- **Electricity:** Automated token generation and post-paid bill settlement for all major DisCos (Ikeja, Eko, Abuja, Ibadan, Kano, Jos, Kaduna, Enugu, PH, Benin, Yola).
- **Cable TV:** Instant subscription renewals for DSTV, GOTV, Startimes, and Showmax.
- Features real-time meter and IUC number validation before purchase.

### 3. Education PINs
- Instant delivery of Exam Result Checkers and Registration PINs.
- Supported examination bodies include: WAEC, NECO, JAMB, NABTEB, and NBAIS.

### 4. Secure Wallet System & Transactions
- Centralized user wallet for easy funding and seamless, one-click checkouts.
- Mandatory secure PIN verification for all out-going transactions.
- Webhook integration with payment gateways (e.g., Paystack) for automated wallet funding.

### 5. Robust Admin & Management Console
- Dedicated dashboard for administrators to monitor transactions, user activity, and platform metrics.
- Service and product management controls.

---

## 💻 Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express/TypeScript, Prisma ORM
- **Database:** PostgreSQL (via Prisma)
- **Authentication:** JWT, Custom API Auth, PIN verification logic
- **Deployment:** Vercel (Optimized for static prerendering, edge execution, and SSR)

---

## 🛠️ Use Cases

- **Everyday Consumers:** Looking for a fast, reliable, and single portal to pay electricity bills, top-up data/airtime, or renew their TV subscription without toggling between multiple bank apps.
- **Students & Parents:** Need immediate access to examination tokens (WAEC, NECO) without visiting physical vendors or experiencing delays.
- **Digital Resellers:** Merchants who want to fund their wallets in bulk and process multiple utility requests for their own customer base efficiently.

---

## ⚙️ Getting Started (Local Development)

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pasturjay/paybills_new.git
   cd paybills
   ```

2. **Install dependencies for both frontend and backend:**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Set up Environment Variables:**
   Create `.env` files in both the `frontend` and `backend` directories using the provided `*.env` templates.
   - Configure your `DATABASE_URL` in the backend.
   - Set up your API keys (Paystack, etc.) and JWT secrets.

4. **Initialize the Database:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the Development Servers:**
   ```bash
   # Start backend
   cd backend
   npm run dev

   # Start frontend (in a new terminal)
   cd frontend
   npm run dev
   ```

6. **Access the Application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 Compliance & Standards

Paybills is built with a strong focus on compliance, particularly aligned with Nigerian regulatory frameworks:
- **NDPA 2023 & NDPR Compliant Privacy Policy** ensuring the safe handling of user PII.
- **CBN AML/CFT & KYC ready** terms and conditions.
- Strict and transparent **Refund Policies** covering transaction failures and SLA timelines.

---

## 🚀 Deployment

The platform is optimized for seamless deployment on Vercel. 
- Ensure all environment variables are properly mapped in your Vercel project settings.
- The build command (`npm run build`) automatically generates optimized static pages, compiles the Next.js routes, and enforces strict type checking.

---

## 📜 License
© 2026 Paybills. All Rights Reserved.
