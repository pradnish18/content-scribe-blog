# Database Setup - Complete Solution

## Current Status

✅ **Frontend:** Running on http://localhost:8080  
⚠️ **Backend:** Needs MongoDB to be running  
⚠️ **MongoDB:** Having startup issues

---

## The `mongosh` Error Explained

The error `zsh: file name too long: mongosh` happens because:
1. `mongosh` is not in your PATH
2. Your MongoDB installation might not include `mongosh` (older versions)

**Good news:** You don't need `mongosh` to run the application! The backend connects directly.

---

## Solution: Start MongoDB Server

### Step 1: Check What's Wrong

```bash
# Check MongoDB logs
cat ~/data/db/mongod.log | tail -20
```

### Step 2: Try Starting in Foreground (to see errors)

```bash
/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod --dbpath ~/data/db
```

This will show you the actual error. Common issues:
- Port 27017 already in use
- Permission issues on data directory
- Corrupted lock file

### Step 3: Fix Common Issues

#### Issue: Port Already in Use
```bash
# Find what's using port 27017
lsof -i :27017

# Kill it if needed
kill -9 <PID>
```

#### Issue: Lock File
```bash
# Remove lock file
rm ~/data/db/mongod.lock
```

#### Issue: Permissions
```bash
# Fix permissions
chmod 755 ~/data/db
chown -R $(whoami) ~/data/db
```

---

## Alternative: Use MongoDB Atlas (Easiest!)

If local MongoDB keeps having issues, use cloud MongoDB (free):

### Step 1: Create Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a cluster (M0 free tier is fine)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string

### Step 3: Update Backend Config

Edit `server/.env` (create if doesn't exist):

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/content_scribe?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_me
PORT=4000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important:** Replace `username` and `password` with your Atlas credentials!

### Step 4: Configure Network Access
1. In Atlas dashboard → "Network Access"
2. Add IP address: `0.0.0.0/0` (for development) or your specific IP

### Step 5: Start Backend
```bash
cd server
npm run dev
```

No local MongoDB needed! 🎉

---

## Quick Fix: Use Homebrew MongoDB

If you have Homebrew, this is often easier:

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Check status
brew services list

# Stop when needed
brew services stop mongodb-community
```

---

## Verify Everything Works

### 1. Check MongoDB
```bash
ps aux | grep mongod | grep -v grep
```

### 2. Test Backend
```bash
cd server
npm run dev
```

In another terminal:
```bash
curl http://localhost:4000/api/health
# Should return: {"ok":true}
```

### 3. Test Frontend
Open http://localhost:8080 in browser

---

## Recommended Approach

**For Development:** Use MongoDB Atlas (cloud) - no local setup headaches!

**For Production:** Use MongoDB Atlas or properly configured local MongoDB

---

## Files Created

1. ✅ `setup-database.sh` - Automated setup script
2. ✅ `QUICK_DATABASE_SETUP.md` - Quick reference guide
3. ✅ `DATABASE_SETUP.md` - Comprehensive guide
4. ✅ `DATABASE_SETUP_SOLUTION.md` - This file (troubleshooting)

---

## Next Steps

1. **Choose your approach:**
   - Option A: Fix local MongoDB (check logs, fix issues)
   - Option B: Use MongoDB Atlas (recommended - easiest)
   - Option C: Install via Homebrew

2. **Start backend:**
   ```bash
   cd server
   npm run dev
   ```

3. **Verify:**
   ```bash
   curl http://localhost:4000/api/health
   ```

4. **Start frontend** (if not already):
   ```bash
   npm run dev
   ```

---

_Remember: You don't need `mongosh` - just the MongoDB server (mongod) running!_

