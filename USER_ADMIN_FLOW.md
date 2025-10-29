# 🎯 User & Admin Flow Documentation

## Overview

ContentScribe now has **two separate authentication systems**:
1. **User Authentication** - For regular users who want to save favorites and access protected content
2. **Admin Authentication** - For administrators who manage blog posts

---

## 🌐 Public Access (No Login Required)

### What Users Can Do Without Login:
- ✅ Browse homepage and view all blog posts
- ✅ Read individual blog posts
- ✅ Search for articles
- ❌ Cannot add posts to favorites
- ❌ Cannot access About page
- ❌ Cannot access Favorites page

### Routes:
- `/` - Homepage
- `/post/:slug` - Individual post page

---

## 👤 User Flow (Regular Users)

### 1. Sign Up / Sign In

**How to Access:**
- Click "Sign in" button in the navbar
- Auth modal appears as a popup
- Switch between Sign In / Sign Up modes

**What Happens:**
- User creates account with username & password
- Receives JWT token stored as `userToken`
- Can now access protected features

### 2. Protected Features (Requires User Login)

#### Add to Favorites
- Click heart icon on any post card or post page
- If not logged in → Auth modal appears
- If logged in → Post added to favorites (synced to server)

#### View Favorites Page
- Access via "My Favorites" button in navbar (only visible when logged in)
- Route: `/favorites`
- Shows all posts user has favorited
- Can remove favorites by clicking heart icon

#### About Page
- Click "About" in navbar
- If not logged in → Auth modal appears
- If logged in → Navigate to About page
- Route: `/about`

### 3. Sign Out
- Click "Sign out" button in navbar
- Clears `userToken`, `username`, and `favorites` from localStorage
- Page reloads, user returns to public view

---

## 🔐 Admin Flow (Content Managers)

### 1. Admin Login

**Separate Admin Endpoints:**
- `/admin` - Primary admin login
- `/auth` - Alternative admin login
- `/panel` - Legacy admin login

**Credentials:**
- Use admin username and password
- Different from user accounts
- Stores `adminAuth` and `adminToken`

### 2. Admin Dashboard

**Route:** `/admin/dashboard`

**Features:**
- View all posts (published & drafts)
- See post statistics
- Create new posts
- Edit existing posts
- Delete posts
- Upload images to Cloudinary
- Publish/unpublish posts

### 3. Post Management

**Create New Post:**
- Route: `/admin/post/new`
- Fill in title, slug, content, excerpt
- Upload featured image (Cloudinary)
- Save as draft or publish

**Edit Post:**
- Route: `/admin/post/:id/edit`
- Modify existing post
- Change status (draft ↔ published)

### 4. Image Upload

**Cloudinary Integration:**
- Max file size: 5MB
- Supported formats: JPG, PNG, GIF, WebP
- Auto-optimization enabled
- Images stored in cloud, not database

---

## 🔄 Key Differences: User vs Admin

| Feature | User | Admin |
|---------|------|-------|
| **Login Endpoint** | `/login` (modal) | `/admin` |
| **Token Storage** | `userToken` | `adminToken` + `adminAuth` |
| **Can View Posts** | ✅ Yes | ✅ Yes |
| **Can Add Favorites** | ✅ Yes | ✅ Yes |
| **Can Create Posts** | ❌ No | ✅ Yes |
| **Can Edit Posts** | ❌ No | ✅ Yes |
| **Can Delete Posts** | ❌ No | ✅ Yes |
| **Can Upload Images** | ❌ No | ✅ Yes |
| **Access Dashboard** | ❌ No | ✅ Yes |

---

## 📱 User Interface Elements

### Navbar (Not Logged In)
```
[Logo] [Search] [About] [Sign in]
```

### Navbar (User Logged In)
```
[Logo] [Search] [About] [❤️ My Favorites] [Sign out]
```

### Navbar (Admin - Not Shown)
- Admin button removed from public homepage
- Admins must use direct URL: `/admin`

---

## 🎨 Auth Modal Features

### Design:
- Popup overlay with backdrop blur
- Smooth fade-in and scale animations
- Close button (X) in top-right
- Switch between Sign In / Sign Up modes

### Triggers:
- Click "Sign in" button
- Click heart icon (favorites) without login
- Click "About" without login
- Try to access `/favorites` without login
- Try to access `/about` without login

### After Successful Auth:
- Modal closes automatically
- Toast notification: "Welcome! You're now signed in."
- Page reloads to update UI
- User can now access protected features

---

## 🗂️ Routes Summary

### Public Routes (No Auth)
| Route | Description |
|-------|-------------|
| `/` | Homepage with blog posts |
| `/post/:slug` | Individual post view |
| `/login` | User auth modal (redirects to /) |
| `/signup` | User auth modal (redirects to /) |

### User-Protected Routes (Requires `userToken`)
| Route | Description |
|-------|-------------|
| `/about` | About page |
| `/favorites` | User's favorite posts |

### Admin-Protected Routes (Requires `adminAuth`)
| Route | Description |
|-------|-------------|
| `/admin` | Admin login page |
| `/auth` | Admin login page (alias) |
| `/panel` | Admin login page (legacy) |
| `/admin/dashboard` | Admin dashboard |
| `/admin/post/new` | Create new post |
| `/admin/post/:id/edit` | Edit existing post |

---

## 🔧 Technical Implementation

### User Authentication
```javascript
// Sign in
POST /api/auth/login
Body: { username, password }
Response: { token, username, favorites }

// Stored in localStorage:
- userToken: JWT token
- username: User's username
- favorites: Array of post slugs
```

### Admin Authentication
```javascript
// Sign in
POST /api/auth/login
Body: { username, password }
Response: { token, username }

// Stored in localStorage:
- adminToken: JWT token
- adminAuth: 'true'
```

### Favorites API
```javascript
// Toggle favorite
POST /api/user/favorites/:slug
Headers: { Authorization: Bearer <userToken> }
Response: { favorites: [...] }

// Get favorites
GET /api/user/favorites
Headers: { Authorization: Bearer <userToken> }
Response: { favorites: [...] }
```

---

## ✅ Testing Checklist

### User Flow:
- [ ] Browse homepage without login
- [ ] Click heart icon → Auth modal appears
- [ ] Sign up with new account
- [ ] Add post to favorites
- [ ] View "My Favorites" page
- [ ] Remove favorite
- [ ] Click "About" → Navigate successfully
- [ ] Sign out → Return to public view

### Admin Flow:
- [ ] Go to `/admin`
- [ ] Login with admin credentials
- [ ] View dashboard
- [ ] Create new post
- [ ] Upload image
- [ ] Publish post
- [ ] Edit post
- [ ] Delete post
- [ ] View site (return to public view)

---

## 🎯 Summary

**For Users:**
1. Browse freely without login
2. Sign in via popup modal when needed
3. Save favorites and access protected content
4. Sign out anytime

**For Admins:**
1. Use separate admin endpoint (`/admin`)
2. Full content management capabilities
3. Image upload with Cloudinary
4. No admin UI elements on public pages

**Security:**
- Separate authentication systems
- JWT tokens for both user and admin
- Protected routes with redirects
- Server-side validation on all endpoints

---

**All systems operational! 🚀**
