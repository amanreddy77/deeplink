#!/bin/bash

echo "🚀 Student Grade Management System - Deployment Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Preparing for deployment..."

# Build frontend for production
echo "🔨 Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo "✅ Frontend build completed"

# Check if backend dependencies are installed
echo "🔍 Checking backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi
cd ..

echo "✅ Backend dependencies ready"

echo ""
echo "🎯 Next Steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy backend to Render:"
echo "   - Go to https://render.com"
echo "   - Create new Web Service"
echo "   - Connect GitHub repository"
echo "   - Set root directory to 'backend'"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "3. Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import GitHub repository"
echo "   - Set root directory to 'frontend'"
echo "   - Add REACT_APP_API_URL environment variable"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo "🎉 Happy deploying!"
