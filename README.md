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

### 3. Virtual VISA/Mastercards
- Create and manage virtual dollar cards for global online payments.
- Instant funding, freezing, and transaction monitoring directly from your dashboard.

### 4. Virtual Numbers (DID)
- Rent temporary or permanent phone numbers from 20+ countries.
- Receive secure SMS verification codes and OTPs via a terminal-inspired console.

### 5. Genuine Software Marketplace
- Instant delivery of trusted software licenses and keys.
- Categories include: OS (Windows), Productivity (Office), Security (Antivirus), and Creative (Adobe).

### 6. Betting & Gaming
- Instant wallet funding for major sports betting platforms.
- Top-up popular games including PUBG, Free Fire, and more.

### 7. Education PINs
- Instant delivery of Exam Result Checkers (WAEC, NECO) and Registration PINs (JAMB, NABTEB).

### 8. Wallet System & Peer-to-Peer Transfers
- Centralized user wallet with Paystack/Flutterwave integration.
- **Internal Transfers:** Send and receive funds instantly using User Tags.
- Mandatory secure PIN verification for all outgoing transactions.

### 9. Referral & Rewards
- Monetize your network with a robust referral system and real-time tracking.

---

## 💻 Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express/TypeScript, Prisma ORM
- **Database:** PostgreSQL (via Prisma)
- **Authentication:** Firebase Auth integration with JWT-based session management
- **Infrastructure:** Docker Support (`docker-compose.yml`), GitHub Actions (CI/CD)
- **Deployment:** Vercel (Optimized for edge execution and SSR)

---

## ⚙️ Getting Started (Local Development)

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- PostgreSQL database (or Docker)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pasturjay/paybills_new.git
   cd paybills
   ```

2. **Unified Setup (Recommended):**
   Install all dependencies for both frontend and backend from the root:
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create `.env` files in both the `frontend` and `backend` directories using the provided `*.env` templates.
   - Configure your `DATABASE_URL` in the backend.
   - Set up your Firebase service account and API keys.

4. **Initialize the Database:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the Development Servers:**
   From the project root, run both servers concurrently:
   ```bash
   npm run dev
   ```
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:5000](http://localhost:5000)

**Alternative: Docker Setup**
```bash
docker-compose up --build
```

---

## 📝 Compliance & Standards

Paybills is built with a strong focus on compliance, particularly aligned with Nigerian regulatory frameworks:
- **NDPA 2023 & NDPR Compliant Privacy Policy** ensuring the safe handling of user PII.
- **CBN AML/CFT & KYC ready** terms and conditions.
- Strict and transparent **Refund Policies** covering transaction failures and SLA timelines.

---

## 📜 License
© 2026 Paybills. All Rights Reserved. Operated by Fecund Integrated Technology Limited.

