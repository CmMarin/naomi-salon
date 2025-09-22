# 🚀 Vercel Deployment Guide for Naomi's Barbershop

## ✅ What's Ready

Your app is fully configured for **FREE Vercel deployment** with:
- ✅ **Frontend**: Next.js with responsive design
- ✅ **Backend**: Serverless functions (no separate server needed!)
- ✅ **Database**: SQLite with automatic initialization
- ✅ **Security**: JWT authentication, rate limiting, input validation
- ✅ **Email**: Professional confirmation emails
- ✅ **Styling**: Cursive "Naomi" branding with elegant design

## 🏃‍♂️ Quick Deploy (5 minutes!)

### Step 1: Create GitHub Repository
```bash
# In your terminal (inside the project folder):
git init
git add .
git commit -m "Initial commit: Complete booking system with Vercel deployment"
```

Then:
1. Go to [GitHub.com](https://github.com) → New Repository
2. Name it `naomi-salon` (or any name you like)
3. **Don't** initialize with README (we already have files)
4. Copy the git commands GitHub shows you

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up (free)
2. Connect your GitHub account
3. Click "New Project" → Import your `naomi-salon` repository
4. **Framework Preset**: Next.js (auto-detected)
5. **Root Directory**: Leave empty (use root)
6. Click **"Deploy"**

### Step 3: Add Environment Variables
After deployment, in Vercel dashboard:

1. Go to your project → Settings → Environment Variables
2. Add these variables:

```
DB_PATH = /tmp/bookings.db
JWT_SECRET = a7f8d9e6b4c2a1f5e3d7b9c8a6f4e2d8b7c5a9f6e4d2b8c7a5f9e6d4b2a8c7f5
ADMIN_USERNAME = admin
ADMIN_PASSWORD = admin123
SESSION_SECRET = f3e8d2b7c4a9f6e1d5b8c3a7f4e9d6b2c8a5f1e7d4b9c6a3f8e5d2b7c4a9f6e1
BCRYPT_ROUNDS = 12
NODE_ENV = production
EMAIL_ENABLED = true
EMAIL_SERVICE = gmail
EMAIL_USER = marin.clima930@gmail.com
EMAIL_PASSWORD = your-gmail-app-password
EMAIL_FROM = Naomi's Barbershop <marin.clima930@gmail.com>
SALON_NAME = Naomi's Barbershop
SALON_PHONE = +373 68 123 456
SALON_ADDRESS = Strada Centrală 123, Chișinău, Moldova
```

**⚠️ IMPORTANT**: Change `ADMIN_PASSWORD` to something secure!

### Step 4: Redeploy
After adding environment variables:
1. Go to Deployments tab
2. Click the 3 dots on latest deployment → Redeploy

## 🎉 Your App is Live!

You'll get a URL like: `https://naomi-salon.vercel.app`

- **Frontend**: Beautiful booking interface
- **Admin Panel**: `/admin` (username: admin, password: what you set)
- **API**: All endpoints work automatically
- **Email**: Booking confirmations sent automatically

## 🔄 Easy Updates

To update your app:
1. Make changes to your code
2. Push to GitHub: `git add . && git commit -m "Update message" && git push`
3. Vercel automatically deploys in ~30 seconds!

## 📱 Features Working

- ✅ **Multi-language** (Romanian/Russian)
- ✅ **Responsive design** (mobile-friendly)
- ✅ **Real-time booking** with conflict detection
- ✅ **Admin dashboard** with booking management
- ✅ **Email confirmations** with cursive branding
- ✅ **Security features** (rate limiting, validation)
- ✅ **Fast performance** with Vercel's global CDN

## 🛠️ Customization

After deployment, you can easily:
- Change colors in `src/app/globals.css`
- Update services in the admin panel
- Modify email templates in the code
- Add new features and redeploy

## 💡 Pro Tips

- **Custom domain**: Add your domain in Vercel settings (free!)
- **Analytics**: Vercel provides built-in analytics
- **Performance**: Automatically optimized for speed
- **SSL**: HTTPS enabled by default

## 🔒 Security

Your app includes:
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (prevents spam)
- Input validation
- Session management
- Anti-trolling protection

## 📧 Email Setup

The app uses Gmail for sending confirmations. Make sure to:
1. Enable 2-factor authentication on Gmail
2. Create an "App Password" for the booking system
3. Use the app password (not your regular password) in EMAIL_PASSWORD

---

**🎯 Result**: A professional, fast, secure booking system that's completely FREE to host and easy to update!