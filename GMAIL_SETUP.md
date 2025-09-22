# Quick Gmail Setup for Email Notifications

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account](https://myaccount.google.com/)
2. Click **Security** on the left
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable it

### Step 2: Generate App Password
1. Still in **Security** → **2-Step Verification**
2. Scroll down to **App passwords**
3. Click **Select app** → Choose **Mail**
4. Click **Select device** → Choose **Other (Custom name)**
5. Type "Naomi Salon" 
6. Click **GENERATE**
7. **Copy the 16-character password** (like: abcd efgh ijkl mnop)

### Step 3: Update Configuration
Edit `backend/.env` file:

```env
EMAIL_ENABLED=true
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Naomi's Barbershop <your-actual-email@gmail.com>
```

### Step 4: Restart Server
The server will automatically restart and emails will work!

## ✅ Test It
1. Create a booking with your email address
2. Check if you receive the confirmation email
3. Check spam folder if not in inbox

## 📧 Current Status
- **EMAIL_ENABLED=false** - Emails are disabled (safe for testing)
- **Bookings work normally** - Email failure won't break bookings
- **Professional templates ready** - Beautiful emails when enabled

## 🔧 Alternative: Use Without Email
If you don't want email notifications:
- Keep `EMAIL_ENABLED=false` in `.env`
- App works perfectly without email
- All booking functionality remains the same

## 💡 Pro Tip
For production, consider using:
- **Business Gmail** account
- **SendGrid** or **Mailgun** services  
- **Custom domain email** (salon@yourdomain.com)