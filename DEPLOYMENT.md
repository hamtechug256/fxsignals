# FXSignals by HAMCODZ - Deployment Guide

## Overview

This is a Progressive Web App (PWA) for delivering forex trading signals. Users can:
- Install the app on their phone/home screen
- Receive push notifications for new signals
- View signal history and performance
- Subscribe to premium plans

## Prerequisites

- GitHub account (free)
- Vercel account (free tier works)
- Basic command line knowledge

---

## Step 1: Prepare Your Code

### 1.1 Create a GitHub Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - FXSignals PWA"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/fxsignals.git
git push -u origin main
```

### 1.2 Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - SQLite for development, can use Vercel Postgres for production
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your domain (e.g., https://fxsignals.vercel.app)

---

## Step 2: Deploy to Vercel (FREE)

### 2.1 Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your `fxsignals` repository
4. Vercel will auto-detect Next.js settings

### 2.2 Configure Environment Variables

In Vercel dashboard:
1. Go to Settings > Environment Variables
2. Add all variables from `.env.example`:

```
DATABASE_URL=file:./db/production.db
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### 2.3 Deploy

Click "Deploy" and wait for the build to complete.

---

## Step 3: Set Up GitHub Actions (Automated Signals)

### 3.1 Add Repository Secrets

Go to your GitHub repository > Settings > Secrets and variables > Actions

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `ADMIN_API_KEY` | A secure random string (e.g., `your-secret-api-key-123`) |
| `PLATFORM_URL` | Your Vercel URL (e.g., `https://fxsignals.vercel.app`) |

### 3.2 Enable Workflows

The `.github/workflows/signals.yml` will automatically:
- Run every hour to generate new signals
- Sync signals to your deployed platform
- Send push notifications to subscribers

---

## Step 4: Set Up Push Notifications (Optional but Recommended)

### Option A: Web Push (Built-in, Free)

1. Generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

2. Add to Vercel environment variables:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

### Option B: OneSignal (Free tier, easier setup)

1. Create account at [onesignal.com](https://onesignal.com)
2. Create a Web Push app
3. Add to Vercel environment variables:

```
NEXT_PUBLIC_ONESIGNAL_APP_ID=your-app-id
ONESIGNAL_API_KEY=your-api-key
```

---

## Step 5: Admin Access

Default admin credentials (change in production!):

```
Email: admin@fxsignals.com
Password: admin123
```

**IMPORTANT**: Change the admin password after first login!

To create a new admin:
1. Register a normal account
2. In Vercel, use the storage tab to edit the User table
3. Change `role` to `ADMIN`

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain in Vercel

1. Go to Settings > Domains
2. Add your domain (e.g., `fxsignals.yourdomain.com`)
3. Update DNS records as instructed

### 6.2 Update Environment Variables

Update `NEXTAUTH_URL` to your custom domain.

---

## Production Checklist

- [ ] Change default admin password
- [ ] Set up custom domain
- [ ] Configure push notifications
- [ ] Test PWA installation on mobile
- [ ] Set up GitHub Actions secrets
- [ ] Test signal generation workflow
- [ ] Add real trading data API (optional)

---

## Troubleshooting

### Build Errors

If you get build errors:
1. Check Node.js version (use 18+)
2. Run `bun install` locally to verify dependencies
3. Check Vercel build logs

### Database Issues

For production database:
1. Use Vercel Postgres (free tier)
2. Update `DATABASE_URL` in Vercel environment
3. Run migrations: `npx prisma migrate deploy`

### Push Notifications Not Working

1. Check browser console for errors
2. Verify VAPID keys are set
3. Test on HTTPS (required for service workers)
4. Check notification permission in browser

---

## Support

- GitHub: [github.com/hamtechug256](https://github.com/hamtechug256)
- Portfolio: [hamcodz.duckdns.org](https://hamcodz.duckdns.org)

---

## License

MIT License - Feel free to use and modify for your own projects!
