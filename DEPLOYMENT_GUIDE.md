# 🚀 ContentScribe Deployment Guide

## Architecture

This is a **full-stack application** with:
- **Frontend:** React + Vite (port 8080)
- **Backend:** Node.js + Express (port 4000)
- **Database:** MongoDB
- **Storage:** Cloudinary (images)

---

## 📋 Pre-Deployment Checklist

### ✅ Required Services:
1. **MongoDB Atlas** (free tier) - Cloud database
2. **Cloudinary** (free tier) - Image storage (already configured)
3. **Render/Railway** (free tier) - Backend hosting
4. **Netlify/Vercel** (free tier) - Frontend hosting

---

## 🗄️ Step 1: Set Up MongoDB Atlas

### 1. Create MongoDB Atlas Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for free account
- Create a new cluster (free M0 tier)

### 2. Get Connection String
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy connection string (looks like):
  ```
  mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/content_scribe?retryWrites=true&w=majority
  ```
- Replace `<password>` with your actual password

### 3. Whitelist IP Addresses
- Go to "Network Access"
- Click "Add IP Address"
- Choose "Allow Access from Anywhere" (0.0.0.0/0)

---

## 🖥️ Step 2: Deploy Backend (Render)

### Option A: Deploy to Render (Recommended)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Or use "Deploy from Git URL"

3. **Configure Service**
   ```
   Name: contentscribe-api
   Region: Choose closest to you
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: node index.js
   ```

4. **Add Environment Variables**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/content_scribe
   JWT_SECRET=your_super_secret_jwt_key_change_me_in_production_12345
   PORT=4000
   NODE_ENV=production
   CLOUDINARY_CLOUD_NAME=dq5y3l61j
   CLOUDINARY_API_KEY=583464728958175
   CLOUDINARY_API_SECRET=UJTsmgStNNOAYbQPVZn_g3EJHUU
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL (e.g., `https://contentscribe-api.onrender.com`)

### Option B: Deploy to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Configure**
   - Root directory: `server`
   - Add environment variables (same as above)
   - Deploy

---

## 🌐 Step 3: Deploy Frontend (Netlify)

### 1. Update API URL

Create a `.env.production` file in the root directory:

```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

Update `vite.config.ts` to use this in production:

```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: mode === 'development' ? {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    } : undefined,
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      mode === 'production' 
        ? process.env.VITE_API_URL 
        : 'http://localhost:4000'
    ),
  },
  // ... rest of config
}));
```

### 2. Deploy to Netlify

**Option A: Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**Option B: Netlify Dashboard**
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repository
4. Configure:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
6. Deploy!

---

## 🔧 Step 4: Update Frontend API Calls

Update all API calls to use the environment variable:

```typescript
// Instead of:
fetch('/api/posts')

// Use:
fetch(`${import.meta.env.VITE_API_URL}/api/posts`)
```

Or create an API helper:

```typescript
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  get: (path: string) => fetch(`${API_URL}${path}`),
  post: (path: string, data: any) => fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  // ... etc
};
```

---

## 🔐 Step 5: Security Checklist

### Backend (server/.env)
- ✅ Change JWT_SECRET to a strong random string
- ✅ Use MongoDB Atlas connection string (not localhost)
- ✅ Set NODE_ENV=production
- ✅ Enable CORS for your frontend domain only

### Frontend
- ✅ No API keys in frontend code
- ✅ All secrets in backend only
- ✅ Use environment variables for API URL

### Update CORS in server/index.js:
```javascript
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://your-frontend-url.netlify.app'
  ],
  credentials: true
}));
```

---

## 📝 Step 6: Test Deployment

### Backend Health Check:
```bash
curl https://your-backend-url.onrender.com/api/health
# Should return: {"ok":true}
```

### Frontend Check:
1. Visit your Netlify URL
2. Try to view posts
3. Login as admin
4. Create a post
5. Upload an image
6. Verify everything works

---

## 🎯 Quick Deploy Commands

### Backend (from server directory):
```bash
cd server
git init
git add .
git commit -m "Initial commit"
# Push to GitHub, then deploy via Render/Railway dashboard
```

### Frontend (from root directory):
```bash
npm run build
netlify deploy --prod
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Check backend URL is correct in `.env.production`
- Verify backend is running (visit `/api/health`)
- Check CORS settings

### "Database connection failed"
- Verify MongoDB Atlas connection string
- Check IP whitelist (allow 0.0.0.0/0)
- Ensure password doesn't have special characters (URL encode if needed)

### "Image upload fails"
- Verify Cloudinary credentials in backend environment variables
- Check file size limits
- Ensure authentication token is being sent

### "Build fails"
- Check all dependencies are in package.json
- Verify Node version (use 18+)
- Check build logs for specific errors

---

## 💰 Cost Breakdown (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **MongoDB Atlas** | ✅ Free | 512MB storage |
| **Cloudinary** | ✅ Free | 25GB storage, 25GB bandwidth |
| **Render** | ✅ Free | 750 hours/month, sleeps after 15min inactivity |
| **Netlify** | ✅ Free | 100GB bandwidth, 300 build minutes |

**Total Cost: $0/month** 🎉

---

## 🚀 Alternative: One-Click Deploy

### Deploy Backend to Railway:
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

### Deploy Frontend to Netlify:
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

---

## 📞 Need Help?

Common issues and solutions:
1. **Port already in use** - Change PORT in environment variables
2. **CORS errors** - Update allowed origins in backend
3. **Database timeout** - Check MongoDB Atlas IP whitelist
4. **Build fails** - Verify all dependencies are installed

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] MongoDB Atlas connected
- [ ] Cloudinary working
- [ ] Can view posts
- [ ] Can login as admin
- [ ] Can create posts
- [ ] Can upload images
- [ ] Can add favorites (as user)
- [ ] All routes working

---

**Your ContentScribe blog is now live! 🎉**

Share your URL and start blogging!
