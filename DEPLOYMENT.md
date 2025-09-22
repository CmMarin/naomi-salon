# Deployment Guide for Naomi's Barbershop

This guide will help you deploy your barbershop booking application to production using Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- Your code pushed to a GitHub repository

## Step 1: Deploy Backend to Render

1. **Push your code to GitHub** (if not already done)

2. **Go to [render.com](https://render.com)** and sign in

3. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `naomi-salon` repository (or whatever you named it)
   - Configure the service:
     - **Name**: `naomi-barbershop-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Region**: `Frankfurt` (or closest to your location)
     - **Branch**: `main`
     - **Build Command**: `npm run render-build`
     - **Start Command**: `npm start`

4. **Set Environment Variables** in Render:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=a7f8d9e6b4c2a1f5e3d7b9c8a6f4e2d8b7c5a9f6e4d2b8c7a5f9e6d4b2a8c7f5e3d9b6c4a2f8d5e7b9c6a4f2e8d7b5c9a6f4e2d8b7c5a9f6e4d2
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   SESSION_SECRET=f3e8d2b7c4a9f6e1d5b8c3a7f4e9d6b2c8a5f1e7d4b9c6a3f8e5d2b7c4a9f6e1
   BCRYPT_ROUNDS=12
   TOKEN_EXPIRY=24h
   SESSION_TIMEOUT=30m
   BOOKING_COOLDOWN_MINUTES=5
   MAX_LOGIN_ATTEMPTS=5
   LOGIN_COOLDOWN_MINUTES=15
   EMAIL_ENABLED=true
   EMAIL_SERVICE=gmail
   EMAIL_USER=marin.clima930@gmail.com
   EMAIL_PASSWORD=vzzg sobc trra jnvg
   EMAIL_FROM=Naomi's Barbershop <marin.clima930@gmail.com>
   SALON_NAME=Naomi's Barbershop
   SALON_PHONE=+373 68 123 456
   SALON_ADDRESS=Strada Centrală 123, Chișinău, Moldova
   DB_ENCRYPTION_KEY=k8x2m9n5p1q7r3t4u6v8w0y2z4a7b9c1d3e5f7g9h1j3k5l7m9n1p3q5r7s9t1u3v5
   ALLOWED_ORIGINS=http://localhost:3000,https://naomi-salon.vercel.app
   ```

   **IMPORTANT**: Update `ALLOWED_ORIGINS` with your actual Vercel domain once you deploy the frontend.

5. **Deploy**: Click "Create Web Service"

6. **Note the backend URL**: After deployment, you'll get a URL like `https://naomi-barbershop-backend.onrender.com`

## Step 2: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in

2. **Import your project:**
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure the deployment:**
   - **Project Name**: `naomi-salon` (or your preferred name)
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. **Add Environment Variables** in Vercel:
   - Go to your project settings → "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_API_URL = https://your-backend-url.onrender.com/api
     ```
   - Replace `your-backend-url` with your actual Render backend URL

5. **Deploy**: Click "Deploy"

## Step 3: Update CORS Configuration

After both deployments are live:

1. **Get your Vercel domain** (e.g., `https://naomi-salon.vercel.app`)

2. **Update CORS in Render**:
   - Go to your Render backend service
   - Navigate to "Environment" tab
   - Update `ALLOWED_ORIGINS` to include your Vercel domain:
     ```
     ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-domain.vercel.app
     ```
   - Save and trigger a redeploy

## Step 4: Test Everything

1. **Test the backend API**:
   - Visit `https://your-backend.onrender.com/api/health`
   - Should return: `{"status": "ok", "message": "Naomi Salon API is running"}`

2. **Test the frontend**:
   - Visit your Vercel domain
   - Try making a booking
   - Test the admin panel
   - Verify emails are being sent

## Custom Domain (Optional)

If you want to use a custom domain:

1. **For Vercel (frontend)**:
   - Go to project settings → "Domains"
   - Add your domain and follow the DNS instructions

2. **For Render (backend)**:
   - Go to service settings → "Custom Domains"
   - Add your API subdomain (e.g., `api.yourdomain.com`)

## Troubleshooting

- **CORS errors**: Make sure your Vercel domain is in `ALLOWED_ORIGINS`
- **Database issues**: Check Render logs for database migration errors
- **Email not working**: Verify email credentials in Render environment variables
- **404 errors**: Ensure API calls use the correct production URL

## Environment Variables Summary

**Render (Backend)**:
- All variables from your local `.env` file
- Set `NODE_ENV=production`
- Set `PORT=10000`
- Update `ALLOWED_ORIGINS` with your Vercel domain

**Vercel (Frontend)**:
- `NEXT_PUBLIC_API_URL`: Your Render backend URL + `/api`

## Notes

- Free tier limitations:
  - Render: Services sleep after 15 minutes of inactivity
  - Vercel: 100GB bandwidth per month
- Both platforms offer automatic deployments on git push
- Database persists on Render free tier
- SSL certificates are automatic on both platforms
