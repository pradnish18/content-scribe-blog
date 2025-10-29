import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import cloudinary from './cloudinary-config.js';

dotenv.config();

const app = express();

// Security: HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Security: Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Security: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/', limiter);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/content_scribe';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const PORT = process.env.PORT || 4000;

await mongoose.connect(MONGO_URI);

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  favorites: { type: [String], default: [] },
});

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    content: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    featuredImage: { type: String, default: '' },
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    createdDate: { type: Date, default: Date.now },
    publishedDate: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Verify token hasn't expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return res.status(401).json({ error: 'Token expired' });
    }
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Seed admin in dev if not exists
app.post('/api/dev/seed-admin', async (req, res) => {
  const { username = 'admin', password = 'secure123' } = req.body || {};
  const existing = await User.findOne({ username });
  if (existing) return res.json({ ok: true });
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username, passwordHash, favorites: [] });
  res.json({ ok: true });
});

// Auth
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  // Input validation
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  if (username.length < 3 || username.length > 50) return res.status(400).json({ error: 'Username must be 3-50 characters' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  // Sanitize username (alphanumeric only)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  const existing = await User.findOne({ username });
  if (existing) return res.status(409).json({ error: 'Username already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash, favorites: [] });
  const token = jwt.sign({ sub: user._id, username }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, username, favorites: user.favorites });
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  // Input validation
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user._id, username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username, favorites: user.favorites });
});

// Posts list with pagination, search, status filter
app.get('/api/posts', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.min(50, parseInt(req.query.pageSize) || 10);
  const q = (req.query.q || '').toString().trim();
  const status = (req.query.status || 'published').toString();

  const filter = {};
  if (status !== 'all') filter.status = status;
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { excerpt: { $regex: q, $options: 'i' } },
    { content: { $regex: q, $options: 'i' } },
  ];

  const [items, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Post.countDocuments(filter),
  ]);

  res.json({ items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
});

// Single post by slug (only published for public)
app.get('/api/posts/slug/:slug', async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, status: 'published' }).lean();
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

// Admin CRUD
app.post('/api/admin/posts', auth, async (req, res) => {
  const body = req.body || {};
  const now = new Date();
  if (!body.title || !body.slug) return res.status(400).json({ error: 'title and slug required' });
  try {
    const created = await Post.create({
      title: body.title,
      slug: body.slug.trim().toLowerCase(),
      content: body.content || '',
      excerpt: body.excerpt || '',
      featuredImage: body.featuredImage || '',
      status: body.status || 'draft',
      createdDate: now,
      publishedDate: body.status === 'published' ? now : null,
    });
    res.status(201).json(created);
  } catch (e) {
    if (e && e.code === 11000) return res.status(409).json({ error: 'Slug already exists' });
    console.error('Post creation error:', e);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.put('/api/admin/posts/:id', auth, async (req, res) => {
  const body = req.body || {};
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const doc = await Post.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  doc.title = body.title ?? doc.title;
  doc.slug = (body.slug ?? doc.slug).trim().toLowerCase();
  doc.content = body.content ?? doc.content;
  doc.excerpt = body.excerpt ?? doc.excerpt;
  doc.featuredImage = body.featuredImage ?? doc.featuredImage;
  if (body.status && ['published', 'draft'].includes(body.status)) {
    const wasDraft = doc.status === 'draft';
    doc.status = body.status;
    if (wasDraft && body.status === 'published') doc.publishedDate = new Date();
  }
  try {
    await doc.save();
    res.json(doc);
  } catch (e) {
    if (e && e.code === 11000) return res.status(409).json({ error: 'Slug already exists' });
    console.error('Post update error:', e);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

app.get('/api/admin/posts/:id', auth, async (req, res) => {
  const doc = await Post.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

app.delete('/api/admin/posts/:id', auth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
  const result = await Post.findByIdAndDelete(id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// Image upload endpoint
app.post('/api/upload/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'blog-images',
          transformation: [
            { width: 1200, height: 630, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({ 
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Favorites API
app.get('/api/user/me', auth, async (req, res) => {
  const user = await User.findById(req.user.sub).lean();
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ username: user.username, favorites: user.favorites || [] });
});

app.get('/api/user/favorites', auth, async (req, res) => {
  const user = await User.findById(req.user.sub).lean();
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ favorites: user.favorites || [] });
});

app.post('/api/user/favorites/:slug', auth, async (req, res) => {
  const { slug } = req.params;
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ error: 'Not found' });
  user.favorites = user.favorites || [];
  const idx = user.favorites.indexOf(slug);
  if (idx >= 0) user.favorites.splice(idx, 1); else user.favorites.push(slug);
  await user.save();
  res.json({ favorites: user.favorites });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});


