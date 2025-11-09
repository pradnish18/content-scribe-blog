# Database Setup Guide - ContentScribe Blog

## Overview

This project uses **MongoDB** as the database. You have two options:

1. **Local MongoDB** (recommended for development)
2. **MongoDB Atlas** (cloud-based, good for production)

---

## Option 1: Local MongoDB Setup (Recommended for Development)

### Step 1: Create Data Directory

MongoDB needs a directory to store its data files.

```bash
# Create the data directory
mkdir -p ~/data/db

# Set proper permissions (if needed)
chmod 755 ~/data/db
```

### Step 2: Start MongoDB

You have MongoDB installed at: `/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod`

**Option A: Run in foreground (see errors easily)**

```bash
/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod --dbpath ~/data/db
```

**Option B: Run in background (daemon mode)**

```bash
/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod --dbpath ~/data/db --fork --logpath ~/data/db/mongod.log
```

**Option C: Add to PATH and use mongod directly**

```bash
# Add to your ~/.zshrc or ~/.bash_profile
export PATH="/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin:$PATH"

# Then reload
source ~/.zshrc  # or source ~/.bash_profile

# Now you can use:
mongod --dbpath ~/data/db
```

### Step 3: Verify MongoDB is Running

```bash
# Check if MongoDB process is running
ps aux | grep mongod | grep -v grep

# Test connection
mongosh mongodb://127.0.0.1:27017/content_scribe
# Or if mongosh is in PATH:
mongosh
```

### Step 4: Configure Backend

The backend will automatically use the default connection string if no `.env` file exists:

- Default: `mongodb://127.0.0.1:27017/content_scribe`

**Or create/update `server/.env`:**

```env
MONGO_URI=mongodb://127.0.0.1:27017/content_scribe
JWT_SECRET=your_super_secret_jwt_key_change_me
PORT=4000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 5: Test Backend Connection

```bash
# Start backend
cd server
npm run dev

# In another terminal, test health endpoint
curl http://localhost:4000/api/health
# Should return: {"ok":true}
```

---

## Option 2: MongoDB Atlas Setup (Cloud Database)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (free tier M0 is fine)

### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 3: Update Environment Variables

Edit `server/.env`:

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

1. In Atlas dashboard, go to "Network Access"
2. Add your IP address (or `0.0.0.0/0` for development - not recommended for production)

### Step 5: Test Connection

```bash
cd server
npm run dev
```

---

## Option 3: Using Homebrew MongoDB (Alternative)

If you prefer using Homebrew:

```bash
# Install MongoDB via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Stop MongoDB service (when needed)
brew services stop mongodb-community

# Check status
brew services list
```

---

## Verify Database Setup

### Test 1: Check MongoDB Connection

```bash
# Using mongosh (MongoDB Shell)
mongosh mongodb://127.0.0.1:27017/content_scribe

# Once connected, try:
show dbs
use content_scribe
show collections
exit
```

### Test 2: Check Backend Connection

```bash
# Start backend
cd server
npm run dev

# In another terminal:
curl http://localhost:4000/api/health
# Expected: {"ok":true}
```

### Test 3: Create Test User

```bash
# Using the backend API
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Expected: {"token":"...","username":"testuser","favorites":[]}
```

---

## Troubleshooting

### Issue: MongoDB won't start

**Solution:**

```bash
# Check if port 27017 is already in use
lsof -i :27017

# Kill existing process if needed
kill -9 <PID>

# Try starting again
mongod --dbpath ~/data/db
```

### Issue: Permission denied on data directory

**Solution:**

```bash
# Fix permissions
chmod 755 ~/data/db
# Or use sudo (not recommended)
sudo chown -R $(whoami) ~/data/db
```

### Issue: Backend can't connect to MongoDB

**Solutions:**

1. Verify MongoDB is running: `ps aux | grep mongod`
2. Check connection string in `server/.env`
3. Test connection manually: `mongosh mongodb://127.0.0.1:27017/content_scribe`
4. Check MongoDB logs: `cat ~/data/db/mongod.log`

### Issue: "EADDRINUSE" - Port already in use

**Solution:**

```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

### Issue: MongoDB Atlas connection fails

**Solutions:**

1. Check your IP is whitelisted in Atlas Network Access
2. Verify username/password in connection string
3. Check cluster is running (not paused)
4. Ensure connection string includes database name: `.../content_scribe?retryWrites=true&w=majority`

---

## Database Structure

The application uses two main collections:

### Users Collection

```javascript
{
  username: String (unique, required),
  passwordHash: String (required),
  favorites: [String] (array of post slugs)
}
```

### Posts Collection

```javascript
{
  title: String (required),
  slug: String (unique, required),
  content: String,
  excerpt: String,
  featuredImage: String,
  status: 'published' | 'draft',
  createdDate: Date,
  publishedDate: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Quick Start Commands

### Start Everything (Local MongoDB)

```bash
# Terminal 1: Start MongoDB
mongod --dbpath ~/data/db

# Terminal 2: Start Backend
cd server
npm run dev

# Terminal 3: Start Frontend
npm run dev
```

### Check Everything is Running

```bash
# Check MongoDB
ps aux | grep mongod | grep -v grep

# Check Backend
curl http://localhost:4000/api/health

# Check Frontend
curl http://localhost:8080 | head -5
```

---

## Next Steps

1. ✅ Choose your database option (Local or Atlas)
2. ✅ Set up MongoDB (follow steps above)
3. ✅ Configure `server/.env` file
4. ✅ Start backend: `cd server && npm run dev`
5. ✅ Start frontend: `npm run dev`
6. ✅ Test the application at http://localhost:8080

---

_Last updated: December 2024_
