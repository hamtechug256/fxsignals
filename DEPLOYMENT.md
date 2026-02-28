# FXSignals PWA - Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
# or
bun install
```

### 2. Setup Database
```bash
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel (FREE)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fxsignals.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy"

### Step 3: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```
DATABASE_URL=file:./db/production.db
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
```

---

## Default Admin Credentials
```
Email: admin@fxsignals.com
Password: admin123
```

**CHANGE THIS AFTER FIRST LOGIN!**

---

## Features
- PWA (installable on phone)
- Push notifications
- User authentication
- Admin panel
- Signal management
- Subscription plans

---

## Support
- GitHub: github.com/hamtechug256
- Portfolio: hamcodz.duckdns.org
