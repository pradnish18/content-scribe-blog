# ⚡ Quick Deploy Guide

## 🎯 Fastest Way to Deploy (5 Minutes)

### Step 1: Deploy Backend to Render (2 minutes)

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Click:** "New +" → "Web Service"
4. **Connect** this repository
5. **Configure:**
   - Name: `contentscribe-api`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node index.js`
6. **Add Environment Variables:**
   ```
   MONGO_URI=mongodb+srv://YOUR_MONGODB_URI
   JWT_SECRET=your_secret_key_12345
   NODE_ENV=production
   CLOUDINARY_CLOUD_NAME=dq5y3l61j
   CLOUDINARY_API_KEY=583464728958175
   CLOUDINARY_API_SECRET=UJTsmgStNNOAYbQPVZn_g3EJHUU
   ```
7. **Click:** "Create Web Service"
8. **Copy** your backend URL (e.g., `https://contentscribe-api.onrender.com`)

---

### Step 2: Get MongoDB Atlas (1 minute)

1. **Go to:** https://www.mongodb.com/cloud/atlas
2. **Sign up** for free
3. **Create cluster** (M0 Free tier)
4. **Get connection string:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
5. **Whitelist all IPs:**
   - Network Access → Add IP → 0.0.0.0/0

---

### Step 3: Update Backend URL (30 seconds)

Edit `.env.production` in the root folder:
```bash
VITE_API_URL=https://your-backend-url.onrender.com
```
(Replace with your actual Render URL from Step 1)

---

### Step 4: Deploy Frontend to Netlify (2 minutes)

**Option A: Drag & Drop (Easiest)**
1. Run: `npm run build`
2. Go to: https://app.netlify.com/drop
3. Drag the `dist` folder
4. Done! ✅

**Option B: GitHub (Automatic)**
1. **Go to:** https://app.netlify.com
2. **Click:** "Add new site" → "Import an existing project"
3. **Connect** GitHub repository
4. **Configure:**
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Add environment variable:**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com`
6. **Deploy!**

---

## ✅ That's It!

Your blog is now live at:
- **Frontend:** `https://your-site.netlify.app`
- **Backend:** `https://your-api.onrender.com`

---

## 🧪 Test Your Deployment

1. Visit your Netlify URL
2. View posts (should load from backend)
3. Login at `/admin`
4. Create a test post
5. Upload an image
6. Verify everything works!

---

## ⚠️ Important Notes

### Free Tier Limitations:
- **Render:** Backend sleeps after 15 minutes of inactivity (wakes up in ~30 seconds on first request)
- **MongoDB Atlas:** 512MB storage limit
- **Netlify:** 100GB bandwidth/month

### First Request Might Be Slow:
- Render free tier "spins down" after inactivity
- First request after sleep takes ~30 seconds
- Subsequent requests are fast

### To Keep Backend Always Awake (Optional):
Use a service like **UptimeRobot** to ping your backend every 5 minutes:
- https://uptimerobot.com (free)
- Add monitor: `https://your-api.onrender.com/api/health`

---

## 🐛 Common Issues

### "Cannot connect to server"
**Fix:** Update `VITE_API_URL` in `.env.production` and redeploy frontend

### "Database connection failed"
**Fix:** 
1. Check MongoDB Atlas connection string
2. Whitelist all IPs (0.0.0.0/0)
3. Verify password in connection string

### "CORS error"
**Fix:** Update `server/index.js` CORS settings:
```javascript
app.use(cors({
  origin: ['https://your-site.netlify.app'],
  credentials: true
}));
```

---

## 💡 Pro Tips

1. **Custom Domain:** Add your own domain in Netlify settings
2. **SSL:** Automatically enabled by Netlify (HTTPS)
3. **Environment Variables:** Never commit `.env` files to Git
4. **Monitoring:** Use Render dashboard to view logs
5. **Updates:** Push to GitHub → Auto-deploys on Netlify

---

## 🎉 You're Live!

Share your blog URL and start creating content!

**Need the full guide?** See `DEPLOYMENT_GUIDE.md`
