# HisabPro (HisabLedger)

A professional, mobile-first multi-party inventory and financial ledger web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**. Optimized for zero-config deployment on **Vercel**.

Designed for small business owners and traders managing dynamic suppliers/partners and multi-product household inventory (Surf, Harpic, Tezab, Phenyl, Dishwash, Soap, etc.) with **Strict Partner Data Isolation**.

---

## 🔑 Login Credentials for Instant Testing

You can sign in to test both **Master Admin** and **Partner Data Isolation** modes using the clean unified login form with the accounts below:

### 1. 🛡️ Master Admin Credentials (Full Control)
- **Email:** `admin@hisabpro.com`
- **Password:** `admin123`
- *Access:* Sees all partners, company-wide master statistics, stock valuation, and full ledger control.

### 2. ⚡ Supplier Partner Account (Data Isolated)
- **Email:** `almadina@partner.com`
- **Password:** `partner123`
- *Access:* **Al-Madina Chemicals Portal** — strictly sees only their own running balance (*PKR 45,000 Dena Hai*), deals, and passbook timeline.

### 3. ⚡ Customer Partner Account (Data Isolated)
- **Email:** `bismillah@partner.com`
- **Password:** `partner123`
- *Access:* **Bismillah Super Mart Portal** — strictly sees only their own running balance (*PKR 28,400 Lena Hai*), deals, and passbook timeline.

---

## ✨ Core Features

1. **Partner Account Creation & Data Isolation**:
   - Partner Self-Registration & Admin Creation.
   - **Strict Privacy**: Partner accounts only see their own ledgers, transactions, and deals. Company-wide stats and other partners' ledgers are strictly hidden.
   - **Master Admin Visibility**: Master Admin retains 100% full visibility across all partners and master summaries.

2. **Multi-Party & Supplier Ledger Engine**:
   - Add, manage, and switch between dynamic suppliers and partners.
   - Independent ledgers, profile details, credit limits, and running balances (*Kitna Dena Hai / Kitna Lena Hai / Settled*).
   - One-click WhatsApp balance statement sharing.

3. **Advanced Multi-Product Inventory Catalog**:
   - Pre-seeded with household items: *Surf Excel Powder 1kg*, *Harpic Toilet Cleaner 500ml*, *Tezab Acid 1L*, *Concentrated Phenyl 1L*, *Dishwash Bar Cartons*, *Bleach Cleaner*, *Washing Soap Packs*.
   - Custom units (`kg`, `liter`, `piece`, `carton`, `box`, `pack`) with cost prices and wholesale rates.
   - Low-stock warning alerts and automatic stock quantity movement on deals.

4. **Complex "Len-Den" Accounting System**:
   - Multi-item transaction deals: record multiple products in a single purchase/sale with quantity, rates, line subtotals, extra transport cost, discount, upfront cash paid, and remaining balance.
   - Separate cash/bank payment settlement entries.
   - Real-time Plus/Minus party balance calculations.

5. **PDF Reports & Data Backup**:
   - PDF Passbook / Statement exporter for individual party ledgers.
   - PDF Inventory Stock Valuation report.
   - Offline JSON backup download and restore.

---

## 🛠️ Getting Started (Local Development)

1. Navigate to the repository directory:
   ```bash
   cd hisab-ledger
   ```

2. Configure environment variables in `.env`:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/hisabpro?schema=public"
   ```

3. Push schema to database and generate Prisma Client:
   ```bash
   npx prisma db push && npx prisma generate
   ```

4. Seed the clean sample multi-party dataset:
   ```bash
   npm run db:seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment on Vercel with PostgreSQL

HisabPro is pre-configured for automated Vercel deployment:

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Configure PostgreSQL and production fixes"
   git push origin main
   ```

2. Import the project into **Vercel**.
3. In Project Settings > **Environment Variables**, set:
   - `DATABASE_URL`: Your PostgreSQL connection string (from Neon, Supabase, Vercel Postgres, or Railway).
4. The build script automatically synchronizes the database schema during deployment:
   ```bash
   prisma generate && prisma db push && next build
   ```
5. Click **Deploy**! Once live, click **"Seed Data"** in the top navbar or trigger `/api/seed` to initialize the database with clean starting ledger records.
