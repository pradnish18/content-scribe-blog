# How to View Database Data

## Quick Methods to Check Your Database

### Method 1: Using the View Script (Easiest) ✅

I've created a script that shows all your data in a nice format:

```bash
cd server
node view-db.js
```

This will show:
- All users with their favorites
- All posts with details
- Statistics (total users, posts, published vs drafts)

### Method 2: Using MongoDB Shell (mongosh)

#### Option A: If mongosh is in PATH
```bash
mongosh mongodb://127.0.0.1:27017/content_scribe
```

#### Option B: Using Full Path
```bash
# Find mongosh location
find /Users/pradnishchintada/mongodb-macos-aarch64-8.0.8 -name "mongosh" -type f

# Or use mongo (older versions)
/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongo mongodb://127.0.0.1:27017/content_scribe
```

#### Once Connected, Use These Commands:

```javascript
// Show all databases
show dbs

// Use content_scribe database
use content_scribe

// Show all collections
show collections

// View all users
db.users.find().pretty()

// View all posts
db.posts.find().pretty()

// Count documents
db.users.countDocuments()
db.posts.countDocuments()

// Find specific post
db.posts.findOne({ slug: "your-slug" })

// Find published posts only
db.posts.find({ status: "published" }).pretty()

// Find draft posts
db.posts.find({ status: "draft" }).pretty()

// Exit
exit
```

### Method 3: Using MongoDB Compass (GUI) 🎨

If you have MongoDB Compass installed:

1. **Open MongoDB Compass**
2. **Connect to:** `mongodb://127.0.0.1:27017`
3. **Select database:** `content_scribe`
4. **Browse collections:**
   - `users` - See all users
   - `posts` - See all posts

This gives you a visual interface to browse and edit data!

### Method 4: Using API Endpoints (Via Browser/curl)

#### View All Posts
```bash
# In browser or terminal
curl http://localhost:4000/api/posts

# With status filter
curl "http://localhost:4000/api/posts?status=published"
curl "http://localhost:4000/api/posts?status=draft"
curl "http://localhost:4000/api/posts?status=all"
```

#### View Single Post
```bash
curl http://localhost:4000/api/posts/slug/your-post-slug
```

#### View User Info (Requires Auth)
```bash
# First login to get token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secure123"}' | jq -r '.token')

# Then get user info
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/user/me
```

### Method 5: Using the Check-DB Script

The project already has a check script:

```bash
cd server
npm run check-db
```

Or directly:
```bash
cd server
node check-db.js
```

---

## Quick Commands Reference

### View All Data (Recommended)
```bash
cd server
node view-db.js
```

### View via API
```bash
# All posts
curl http://localhost:4000/api/posts | jq

# Published posts only
curl "http://localhost:4000/api/posts?status=published" | jq
```

### View via MongoDB Shell
```bash
mongosh mongodb://127.0.0.1:27017/content_scribe
# Then use: db.posts.find().pretty()
```

---

## Example Output from view-db.js

```
✅ Connected to MongoDB

📊 USERS:
==================================================

User 1:
  Username: admin
  Favorites: 0 posts
  Favorites list: None
  ID: 6910745e666f6a26c3f277c2


📝 POSTS:
==================================================

Total Posts: 2

Post 1:
  Title: My First Blog Post
  Slug: my-first-blog-post
  Status: published
  Content length: 1250 characters
  Excerpt: This is my first blog post about...
  Featured Image: https://res.cloudinary.com/...
  Created: 2024-12-09T10:30:00.000Z
  Published: 2024-12-09T10:35:00.000Z
  ID: 6910745f666f6a26c3f277c3

Post 2:
  Title: Draft Post
  Slug: draft-post
  Status: draft
  Content length: 500 characters
  Excerpt: This is a draft...
  Featured Image: None
  Created: 2024-12-09T11:00:00.000Z
  Published: Not published
  ID: 69107460666f6a26c3f277c4


📈 STATISTICS:
==================================================
Total Users: 1
Total Posts: 2
  - Published: 1
  - Drafts: 1

✅ Disconnected from MongoDB
```

---

## Troubleshooting

### "mongosh: command not found"
- Use the view-db.js script instead: `cd server && node view-db.js`
- Or install mongosh: `brew install mongosh`
- Or use MongoDB Compass GUI

### "Connection refused"
- Make sure MongoDB is running: `ps aux | grep mongod`
- Start MongoDB if needed: `./setup-database.sh`

### "Database not found"
- The database is created automatically when you first save data
- If empty, create a post via the admin panel first

---

## Recommended: Use view-db.js

The easiest way is to use the script I created:

```bash
cd server
node view-db.js
```

This shows everything in a readable format! 📊

---

_Last updated: December 2024_

