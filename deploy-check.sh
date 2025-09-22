#!/bin/bash

# Deployment preparation script for Naomi's Barbershop
# Run this before pushing to GitHub for deployment

echo "🚀 Preparing Naomi's Barbershop for deployment..."

# Build backend to ensure everything compiles
echo "📦 Building backend..."
cd backend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful!"
else
    echo "❌ Backend build failed! Please fix the errors before deploying."
    exit 1
fi

# Build frontend to ensure everything compiles
echo "📦 Building frontend..."
cd ..
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    echo ""
    echo "🎉 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Follow the DEPLOYMENT.md guide"
    echo "3. Deploy backend to Render first"
    echo "4. Then deploy frontend to Vercel with the backend URL"
else
    echo "❌ Frontend build failed! Please fix the errors before deploying."
    exit 1
fi