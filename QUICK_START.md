# Quick Start Guide - ContentScribe Blog

## 🚀 Fast Setup (3 Steps)

### Step 1: Start MongoDB
```bash
# Option A: Use the startup script
./start-mongodb.sh

# Option B: Manual start
/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod --dbpath ~/data/db
```

**Keep this terminal open!** MongoDB needs to keep running.

### Step 2: Start Backend (New Terminal)
```bash
cd server
npm run dev
```

You should see: `API listening on http://localhost:4000`

### Step 3: Start Frontend (Another Terminal)
```bash
npm run dev
```

You should see: `Local: http://localhost:8080`

---

## ✅ Verify Everything Works

### Test Backend
```bash
curl http://localhost:4000/api/health
# Should return: {"ok":true}
```

### Test Frontend
Open in browser: **http://localhost:8080**

---

## 🎯 What to Do Next

1. **Create an Admin Account:**
   - Go to http://localhost:8080/admin
   - Login with: `admin` / `secure123` (or create new account)

2. **Create a User Account:**
   - Click "Sign in" on homepage
   - Create a new account

3. **Create Your First Post:**
   - Login as admin
   - Go to Dashboard
   - Click "Write New Post"

---

## 🛑 Stopping Everything

1. **Stop Frontend:** Press `Ctrl+C` in frontend terminal
2. **Stop Backend:** Press `Ctrl+C` in backend terminal  
3. **Stop MongoDB:** Press `Ctrl+C` in MongoDB terminal (or `killall mongod`)

---

## 📚 More Help

- **Database Setup:** See `DATABASE_SETUP.md`
- **Project Review:** See `PROJECT_REVIEW.md`
- **Troubleshooting:** See `DEBUG_STATUS.md`

---

## 🔧 Common Issues

### MongoDB won't start
- Check if port 27017 is free: `lsof -i :27017`
- Check data directory permissions: `ls -la ~/data/db`

### Backend can't connect
- Verify MongoDB is running: `ps aux | grep mongod`
- Check `server/.env` file exists

### Frontend shows errors
- Check backend is running: `curl http://localhost:4000/api/health`
- Check browser console for errors

---

*Happy coding! 🎉*

