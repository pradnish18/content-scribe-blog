# 🚀 Deploy Now - Simple Step-by-Step Guide

## ⚡ Quick Deploy (15 minutes total)

Follow these steps in order:

---

## Step 1: MongoDB Atlas (5 min)

1. **Sign up:** https://www.mongodb.com/cloud/atlas/register
2. **Create cluster:** Choose FREE tier (M0)
3. **Create database user:**
   - Database Access → Add User
   - Username: `admin` (or your choice)
   - Password: Create strong password (save it!)
4. **Get connection string:**
   - Database → Connect → "Connect your application"
   - Copy the string
   - Replace `<password>` with your password
   - Add database name: `...mongodb.net/content_scribe?retryWrites=true&w=majority`
5. **Whitelist IPs:**
   - Network Access → Add IP → "Allow Access from Anywhere"

**✅ Save your connection string!**

---

## Step 2: Deploy Backend to Render (5 min)

1. **Sign up:** https://render.com (use GitHub)
2. **New Web Service:**
   - Connect your GitHub repo (or use public Git URL)
   - Name: `contentscribe-api`
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `node index.js`
3. **Environment Variables:**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/content_scribe?retryWrites=true&w=majority
   JWT_SECRET=change_this_to_random_string_12345
   PORT=4000
   NODE_ENV=production
   CLOUDINARY_CLOUD_NAME=dq5y3l61j
   CLOUDINARY_API_KEY=583464728958175
   CLOUDINARY_API_SECRET=UJTsmgStNNOAYbQPVZn_g3EJHUU
   ```
4. **Deploy!** Wait 5-10 minutes
5. **Copy your backend URL:** `https://contentscribe-api.onrender.com`

**✅ Test:** `curl https://your-backend-url.onrender.com/api/health`

---

## Step 3: Update Netlify Config (1 min)

Edit `netlify.toml` and replace `your-backend-url.onrender.com` with your actual Render URL:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://contentscribe-api.onrender.com/api/:splat"
  status = 200
  force = true
```

---

## Step 4: Deploy Frontend to Netlify (4 min)

### Option A: Drag & Drop (Easiest)

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   - Go to: https://app.netlify.com/drop
   - Drag the `dist` folder
   - Wait 10 seconds
   - **Done!** ✅

3. **Add environment variable:**
   - Site Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com`
   - Redeploy (drag `dist` again)

### Option B: GitHub (Auto-deploy)

1. **Push to GitHub** (if not already)
2. **Netlify:**
   - Add new site → Import from GitHub
   - Select repo
   - Build: `npm run build`
   - Publish: `dist`
   - Add env var: `VITE_API_URL` = `https://your-backend-url.onrender.com`
   - Deploy!

---

## Step 5: Update Backend CORS

Edit `server/index.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://your-site.netlify.app'
  ],
  credentials: true
}));
```

Then redeploy backend on Render.

---

## ✅ Test Your Deployment

1. Visit your Netlify URL
2. View posts
3. Login at `/admin` (username: `admin`, password: `secure123`)
4. Create a post
5. Upload an image
6. **Everything should work!** 🎉

---

## 🎯 Your URLs

- **Frontend:** `https://your-site.netlify.app`
- **Backend:** `https://contentscribe-api.onrender.com`
- **Admin:** `https://your-site.netlify.app/admin`

---

## 📝 Quick Checklist

- [ ] MongoDB Atlas created and connected
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Netlify
- [ ] `netlify.toml` updated with backend URL
- [ ] Environment variable `VITE_API_URL` set
- [ ] CORS updated in backend
- [ ] Tested all features

---

## 🐛 Common Issues

**"Cannot connect to server"**
→ Check `VITE_API_URL` and `netlify.toml` redirect

**"CORS error"**
→ Update CORS in `server/index.js` with your Netlify URL

**"Database error"**
→ Verify MongoDB connection string and IP whitelist

---

## 💡 Pro Tips

1. **Keep backend awake:** Use UptimeRobot to ping `/api/health` every 5 min
2. **Custom domain:** Add in Netlify settings (SSL auto-enabled)
3. **Auto-deploy:** Push to GitHub → Auto-deploys on Netlify

---

**That's it! Your blog is live! 🚀**

For detailed guide, see `COMPLETE_DEPLOYMENT_GUIDE.md`

