# 🚀 Deployment Guide

This guide will help you deploy the Student Grade Management System to Vercel (frontend) and Render (backend).

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Render Account**: Sign up at [render.com](https://render.com)
4. **MongoDB Atlas**: Database already configured

## 🔧 Backend Deployment on Render

### Step 1: Prepare Backend
1. Ensure your backend code is in the `backend/` directory
2. The `render.yaml` file is already configured
3. Your `package.json` has the correct start script

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository and choose "Deploy from GitHub"
5. Configure the service:
   - **Name**: `student-grades-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

### Step 3: Set Environment Variables
In Render dashboard, go to Environment tab and add:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://amanreddy77:Psreddy77.@cluster0.2jwxrei.mongodb.net/student-grades?retryWrites=true&w=majority&appName=Cluster0
PORT=10000
```

### Step 4: Deploy
Click "Create Web Service" and wait for deployment to complete.

## 🎨 Frontend Deployment on Vercel

### Step 1: Prepare Frontend
1. Ensure your frontend code is in the `frontend/` directory
2. The `vercel.json` file is already configured
3. Your `package.json` has the correct build script

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 3: Set Environment Variables
In Vercel dashboard, go to Settings → Environment Variables and add:
```
REACT_APP_API_URL=https://your-render-backend-url.onrender.com
```
Replace `your-render-backend-url` with your actual Render backend URL.

### Step 4: Deploy
Click "Deploy" and wait for deployment to complete.

## 🔗 Connecting Frontend and Backend

1. **Get Backend URL**: After Render deployment, copy your backend URL (e.g., `https://student-grades-backend.onrender.com`)
2. **Update Frontend**: In Vercel, update the `REACT_APP_API_URL` environment variable with your backend URL
3. **Redeploy Frontend**: Trigger a new deployment in Vercel

## 🧪 Testing Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.onrender.com/api/health`
2. **Frontend**: Visit your Vercel URL
3. **Upload Test**: Try uploading a sample Excel/CSV file
4. **Pagination**: Test the pagination functionality

## 📝 Sample Data

Use the provided sample files:
- `sample_students.xlsx` - Excel format
- `sample_students.csv` - CSV format

## 🐛 Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure backend CORS is configured for your frontend domain
2. **Environment Variables**: Double-check all environment variables are set correctly
3. **Build Failures**: Check build logs in Vercel/Render dashboards
4. **Database Connection**: Verify MongoDB Atlas connection string

### Support:
- Check deployment logs in respective dashboards
- Ensure all dependencies are in package.json
- Verify environment variables are correctly set

## 🎉 Success!

Once deployed, you'll have:
- ✅ Frontend: `https://your-app.vercel.app`
- ✅ Backend: `https://your-backend.onrender.com`
- ✅ Database: MongoDB Atlas
- ✅ Pagination: 50 students per page
- ✅ Full CRUD operations
