# Quick Database Setup Guide

## The Problem

You're getting `zsh: file name too long: mongosh` because `mongosh` is not in your PATH or doesn't exist in your MongoDB installation.

## Solution: Use Full Path or Setup Script

### Option 1: Use the Setup Script (Easiest)

```bash
# Make script executable
chmod +x setup-database.sh

# Run the setup script
./setup-database.sh
```

This script will:
- ✅ Create the data directory
- ✅ Check if MongoDB is running
- ✅ Start MongoDB if needed
- ✅ Show you the connection details

### Option 2: Start MongoDB Manually

```bash
# 1. Create data directory (if not exists)
mkdir -p ~/data/db

# 2. Start MongoDB using full path
/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod \
  --dbpath ~/data/db \
  --fork \
  --logpath ~/data/db/mongod.log \
  --logappend

# 3. Verify it's running
ps aux | grep mongod | grep -v grep
```

### Option 3: Add MongoDB to PATH

Add this to your `~/.zshrc`:

```bash
export PATH="/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin:$PATH"
```

Then reload:
```bash
source ~/.zshrc
```

Now you can use `mongod` and `mongosh` directly.

---

## Verify Database is Working

### Test 1: Check MongoDB is Running

```bash
ps aux | grep mongod | grep -v grep
```

Should show a MongoDB process.

### Test 2: Test Backend Connection

```bash
# Start backend
cd server
npm run dev
```

In another terminal:
```bash
curl http://localhost:4000/api/health
```

Should return: `{"ok":true}`

### Test 3: Create a Test User

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

---

## Using MongoDB Shell (mongosh)

If you need to use `mongosh` but it's not in PATH:

### Option A: Install mongosh separately

```bash
# Install via Homebrew
brew install mongosh

# Or download from: https://www.mongodb.com/try/download/shell
```

### Option B: Use full path (if mongosh exists)

```bash
# Find mongosh
find /Users/pradnishchintada/mongodb-macos-aarch64-8.0.8 -name "mongosh" -type f

# Use full path
/path/to/mongosh mongodb://127.0.0.1:27017/content_scribe
```

### Option C: Connect via Node.js (no mongosh needed)

You don't actually need `mongosh` - the backend connects automatically! Just make sure MongoDB is running.

---

## Complete Setup Checklist

- [ ] Data directory created: `~/data/db`
- [ ] MongoDB started (check with `ps aux | grep mongod`)
- [ ] Backend can connect (test with `curl http://localhost:4000/api/health`)
- [ ] Frontend is running (http://localhost:8080)

---

## Troubleshooting

### MongoDB won't start

```bash
# Check if port is in use
lsof -i :27017

# Check logs
cat ~/data/db/mongod.log

# Try starting in foreground to see errors
/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod --dbpath ~/data/db
```

### Backend can't connect

1. Verify MongoDB is running: `ps aux | grep mongod`
2. Check `server/.env` has correct `MONGO_URI`
3. Default connection: `mongodb://127.0.0.1:27017/content_scribe`

### Still having issues?

Use MongoDB Atlas (cloud) instead - no local setup needed:
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `server/.env` with Atlas connection string

---

## Quick Commands Reference

```bash
# Start MongoDB
./setup-database.sh

# Or manually:
/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod --dbpath ~/data/db --fork --logpath ~/data/db/mongod.log

# Stop MongoDB
pkill mongod

# Check if running
ps aux | grep mongod | grep -v grep

# View logs
tail -f ~/data/db/mongod.log
```

---

_You don't need `mongosh` to run the application - just MongoDB server (mongod)!_

