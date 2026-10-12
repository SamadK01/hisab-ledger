# Deploying HisabPro (HisabLedger) on Vercel

HisabPro is pre-configured for seamless, zero-friction deployment on **Vercel** with automatic database fallback and cloud database compatibility.

---

## Option 1: Instant Deployment (Zero-Config / Automatic Fallback)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy HisabPro Multi-Party Ledger"
   git push origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **"Import Repository"**.
3. Click **Deploy**.
4. **Done!** HisabPro is built with a hybrid sync engine that auto-hydrates demo dataset and persists ledger transactions in serverless environments.

---

## Option 2: Production Cloud Database Setup (Prisma + Neon / Vercel Postgres / Turso)

If you wish to use a persistent cloud Postgres database on Vercel:

1. In your Vercel Project Settings -> **Environment Variables**, add:
   ```env
   DATABASE_URL="postgres://user:password@ep-xyz.neon.tech/neondb?sslmode=require"
   ```
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run `npx prisma db push` or redeploy on Vercel.

---

## 🚀 Built-in Features
- **Multi-Party Management**: Independent ledgers for dynamic scaling (Supplier A, Supplier B, Customer C...).
- **Multi-Product Inventory**: Manage Surf, Harpic, Tezab, Phenyl, Soap, Dishwash with custom units (`kg`, `liter`, `piece`, `carton`, `pack`) and variable rates.
- **Complex Len-Den Engine**: Auto calculates running balance (Dena hai / Lena hai), discount, extra transport charges, and upfront cash paid.
- **Passbook & Reports**: PDF Passbook generator, stock valuation report, JSON Backup & Restore.
- **Mobile-First Responsive UX**: Fast, app-like touch interface for smartphones and desktops.
