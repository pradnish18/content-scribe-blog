# Fix Database Setup - Quick Solution

## The Problem

Your MongoDB data directory has permission issues and corrupted files. The error shows:
```
Unable to read the storage engine metadata file
Failed to read metadata from /Users/pradnishchintada/data/db/storage.bson
```

## ✅ EASIEST SOLUTION: Use MongoDB Atlas (Recommended)

**Skip all local MongoDB setup - use cloud database instead!**

### Step 1: Create Free MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free tier available)
3. Create a new cluster (choose M0 free tier)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 3: Update Backend Config

Create/edit `server/.env`:

```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/content_scribe?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_me_12345
PORT=4000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Replace:**
- `YOUR_USERNAME` with your Atlas username
- `YOUR_PASSWORD` with your Atlas password
- `cluster0.xxxxx.mongodb.net` with your actual cluster URL

### Step 4: Configure Network Access
1. In Atlas dashboard → "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development) or add your specific IP
4. Click "Confirm"

### Step 5: Start Backend
```bash
cd server
npm run dev
```

**That's it!** No local MongoDB needed. ✅

---

## Alternative: Fix Local MongoDB

If you prefer local MongoDB:

### Option A: Use Fresh Data Directory

```bash
# Create new data directory
mkdir -p ~/mongodb-data/db

# Start MongoDB with new directory
/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod --dbpath ~/mongodb-data/db

# Update server/.env
MONGO_URI=mongodb://127.0.0.1:27017/content_scribe
```

### Option B: Fix Permissions (Requires sudo)

```bash
# Remove old data directory
sudo rm -rf ~/data/db

# Create fresh directory
mkdir -p ~/data/db

# Fix ownership
sudo chown -R $(whoami) ~/data/db

# Start MongoDB
/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod --dbpath ~/data/db
```

### Option C: Use Homebrew MongoDB

```bash
# Install via Homebrew (cleaner)
brew tap mongodb/brew
brew install mongodb-community

# Start service
brew services start mongodb-community

# Check status
brew services list
```

---

## Verify Setup

### Test Backend Connection

```bash
# Start backend
cd server
npm run dev
```

In another terminal:
```bash
curl http://localhost:4000/api/health
# Should return: {"ok":true}
```

### Test Creating a User

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

---

## Recommended: MongoDB Atlas

**Why use Atlas?**
- ✅ No local setup needed
- ✅ Works immediately
- ✅ Free tier available
- ✅ No permission issues
- ✅ Accessible from anywhere
- ✅ Automatic backups

**Perfect for development and production!**

---

## Complete Setup Checklist

- [ ] Choose: MongoDB Atlas (recommended) OR Local MongoDB
- [ ] If Atlas: Create account, get connection string, update `server/.env`
- [ ] If Local: Fix permissions or use fresh directory
- [ ] Start backend: `cd server && npm run dev`
- [ ] Test: `curl http://localhost:4000/api/health`
- [ ] Start frontend: `npm run dev` (if not running)
- [ ] Open: http://localhost:8080

---

## Quick Commands

### Using MongoDB Atlas
```bash
# 1. Update server/.env with Atlas connection string
# 2. Start backend
cd server && npm run dev
```

### Using Local MongoDB (Fresh)
```bash
# 1. Create new directory
mkdir -p ~/mongodb-data/db

# 2. Start MongoDB
/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod --dbpath ~/mongodb-data/db

# 3. Update server/.env
echo "MONGO_URI=mongodb://127.0.0.1:27017/content_scribe" >> server/.env

# 4. Start backend
cd server && npm run dev
```

---

**Recommendation: Use MongoDB Atlas - it's the fastest and easiest solution!** 🚀

