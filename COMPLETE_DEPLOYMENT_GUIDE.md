# 🚀 Complete Deployment Guide - ContentScribe Blog

## Overview

This guide will help you deploy your ContentScribe Blog to production. The deployment consists of:

1. **Backend** → Render or Railway (Node.js API)
2. **Frontend** → Netlify or Vercel (React App)
3. **Database** → MongoDB Atlas (Cloud Database)
4. **Images** → Cloudinary (Already configured)

**Total Cost: $0/month** (All free tiers) 🎉

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] Cloudinary account (already configured)
- [ ] GitHub repository (optional but recommended)
- [ ] Render/Railway account (for backend)
- [ ] Netlify/Vercel account (for frontend)

---

## 🗄️ Step 1: Set Up MongoDB Atlas (5 minutes)

### 1.1 Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Verify your email

### 1.2 Create Cluster
1. Click "Build a Database"
2. Choose **FREE** (M0) tier
3. Select a cloud provider and region (closest to you)
4. Click "Create"

### 1.3 Create Database User
1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `contentscribe` (or your choice)
5. Password: Create a strong password (save it!)
6. Database User Privileges: "Atlas admin" (or "Read and write to any database")
7. Click "Add User"

### 1.4 Get Connection String
1. Go to "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy the connection string:
   ```
   mongodb+srv://contentscribe:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Important:** Replace `<password>` with your actual password
6. **Add database name:** Change to:
   ```
   mongodb+srv://contentscribe:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/content_scribe?retryWrites=true&w=majority
   ```

### 1.5 Whitelist IP Addresses
1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (adds 0.0.0.0/0)
4. Click "Confirm"

**✅ MongoDB Atlas is ready!** Save your connection string.

---

## 🖥️ Step 2: Deploy Backend (10 minutes)

### Option A: Deploy to Render (Recommended)

#### 2.1 Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email

#### 2.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository:
   - If repo is private, authorize Render
   - Select your repository: `content-scribe-blog-main`
   - Or use "Public Git repository" and paste your repo URL
3. Click "Connect"

#### 2.3 Configure Service
Fill in the form:
```
Name: contentscribe-api
Region: Choose closest to you (Oregon, Frankfurt, etc.)
Branch: main (or your default branch)
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: node index.js
Instance Type: Free
```

#### 2.4 Add Environment Variables
Click "Advanced" → "Add Environment Variable" and add:

```
MONGO_URI=mongodb+srv://contentscribe:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/content_scribe?retryWrites=true&w=majority
```

```
JWT_SECRET=your_super_secret_jwt_key_change_this_to_random_string_12345
```

```
PORT=4000
```

```
NODE_ENV=production
```

```
CLOUDINARY_CLOUD_NAME=dq5y3l61j
```

```
CLOUDINARY_API_KEY=583464728958175
```

```
CLOUDINARY_API_SECRET=UJTsmgStNNOAYbQPVZn_g3EJHUU
```

**Important:** Replace `YOUR_PASSWORD` and `cluster0.xxxxx.mongodb.net` with your actual MongoDB Atlas values!

#### 2.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Watch the logs - should see "API listening on http://localhost:4000"
4. Copy your backend URL: `https://contentscribe-api.onrender.com` (or similar)

#### 2.6 Test Backend
```bash
curl https://your-backend-url.onrender.com/api/health
# Should return: {"ok":true}
```

**✅ Backend is deployed!** Save your backend URL.

---

### Option B: Deploy to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Click on the service → "Settings"
6. Set Root Directory: `server`
7. Add environment variables (same as Render above)
8. Deploy!

---

## 🌐 Step 3: Update Frontend for Production

### 3.1 Create API Helper

The frontend currently uses relative paths (`/api/...`). We need to make it work with the deployed backend.

Create `src/lib/api.ts`:

```typescript
// Get API URL from environment or use default
const getApiUrl = () => {
  // In production, use environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In development, use proxy (relative path)
  if (import.meta.env.DEV) {
    return '';
  }
  // Fallback for production without env var
  return 'https://contentscribe-api.onrender.com';
};

export const API_URL = getApiUrl();

// Helper function for API calls
export const apiFetch = async (path: string, options?: RequestInit) => {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  return fetch(url, options);
};
```

### 3.2 Update API Calls (Optional - Current code should work)

The current code uses relative paths which work in development. For production, we need to update the fetch calls OR use a proxy.

**Option 1: Update vite.config.ts** (Easier - recommended)

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
      process.env.VITE_API_URL || ''
    ),
  },
  // ... rest of config
}));
```

**Option 2: Update CORS in Backend** (Already done, but verify)

Make sure `server/index.js` has CORS configured:

```javascript
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://your-frontend-url.netlify.app',
    'https://your-frontend-url.vercel.app'
  ],
  credentials: true
}));
```

---

## 🎨 Step 4: Deploy Frontend (5 minutes)

### Option A: Deploy to Netlify (Recommended)

#### 4.1 Build Frontend Locally (Test First)
```bash
cd "/Users/pradnishchintada/Documents/AI projects/content-scribe-blog-main"
npm run build
```

This creates a `dist` folder with your production build.

#### 4.2 Deploy via Drag & Drop (Fastest)
1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder into the browser
3. Wait 10 seconds
4. Your site is live! 🎉
5. Copy your site URL (e.g., `https://random-name-123.netlify.app`)

#### 4.3 Add Environment Variable
1. Go to your site dashboard on Netlify
2. Click "Site settings" → "Environment variables"
3. Click "Add a variable"
4. Key: `VITE_API_URL`
5. Value: `https://your-backend-url.onrender.com` (from Step 2)
6. Click "Save"
7. Go to "Deploys" → "Trigger deploy" → "Clear cache and deploy site"

#### 4.4 Deploy via GitHub (Better for Updates)
1. Push your code to GitHub (if not already)
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub and authorize
5. Select your repository
6. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click "Show advanced" → "New variable"
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com`
8. Click "Deploy site"

**✅ Frontend is deployed!**

---

### Option B: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com`
7. Deploy!

---

## 🔧 Step 5: Update Backend CORS

Update `server/index.js` to allow your frontend domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://your-site.netlify.app',
    'https://your-site.vercel.app'
  ],
  credentials: true
}));
```

Then redeploy the backend.

---

## ✅ Step 6: Test Everything

### 6.1 Test Backend
```bash
curl https://your-backend-url.onrender.com/api/health
# Should return: {"ok":true}
```

### 6.2 Test Frontend
1. Visit your Netlify/Vercel URL
2. Check if posts load
3. Try to sign up/login
4. Login as admin at `/admin`
5. Create a test post
6. Upload an image
7. Verify everything works!

---

## 🎯 Quick Deploy Commands

### Build Frontend
```bash
cd "/Users/pradnishchintada/Documents/AI projects/content-scribe-blog-main"
npm run build
```

### Deploy to Netlify (CLI)
```bash
npm install -g netlify-cli
netlify login
netlify deploy --dir=dist --prod
```

---

## 📝 Environment Variables Summary

### Backend (Render/Railway)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/content_scribe?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_12345
PORT=4000
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=dq5y3l61j
CLOUDINARY_API_KEY=583464728958175
CLOUDINARY_API_SECRET=UJTsmgStNNOAYbQPVZn_g3EJHUU
```

### Frontend (Netlify/Vercel)
```
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- ✅ Check `VITE_API_URL` is set correctly in frontend
- ✅ Verify backend is running (check `/api/health`)
- ✅ Check CORS settings in backend

### "Database connection failed"
- ✅ Verify MongoDB Atlas connection string
- ✅ Check IP whitelist (should include 0.0.0.0/0)
- ✅ Ensure password is URL-encoded if it has special characters
- ✅ Check backend logs for specific error

### "CORS error"
- ✅ Update CORS in `server/index.js` with your frontend URL
- ✅ Redeploy backend after CORS changes

### "Image upload fails"
- ✅ Verify Cloudinary credentials in backend env vars
- ✅ Check file size limits (5MB max)
- ✅ Ensure admin token is being sent

### Backend sleeps (Render free tier)
- ✅ First request after sleep takes ~30 seconds
- ✅ Use UptimeRobot to ping `/api/health` every 5 minutes
- ✅ Or upgrade to paid plan for always-on

---

## 💰 Free Tier Limits

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **MongoDB Atlas** | ✅ Free | 512MB storage |
| **Cloudinary** | ✅ Free | 25GB storage, 25GB bandwidth |
| **Render** | ✅ Free | 750 hours/month, sleeps after 15min |
| **Netlify** | ✅ Free | 100GB bandwidth, 300 build minutes |
| **Vercel** | ✅ Free | 100GB bandwidth, unlimited builds |

**Total: $0/month** 🎉

---

## 🚀 Post-Deployment

### Create Admin User
Once deployed, create an admin user:

```bash
curl -X POST https://your-backend-url.onrender.com/api/dev/seed-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secure123"}'
```

Or login with existing admin credentials.

### Custom Domain (Optional)
1. Go to Netlify/Vercel settings
2. Add your custom domain
3. Update DNS records
4. SSL is automatic (HTTPS)

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas set up and connected
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] CORS configured for frontend domain
- [ ] Can view posts on frontend
- [ ] Can login as admin
- [ ] Can create posts
- [ ] Can upload images
- [ ] Can add favorites (as user)
- [ ] All routes working

---

## 🎉 You're Live!

Your ContentScribe Blog is now deployed and accessible worldwide!

**Share your URL and start blogging!** 🚀

---

## 📞 Need Help?

Common issues:
1. **Backend not responding** → Check Render/Railway logs
2. **Database errors** → Verify MongoDB Atlas connection
3. **CORS errors** → Update CORS with frontend URL
4. **Build fails** → Check Node version (use 18+)

---

_Last updated: December 2024_

