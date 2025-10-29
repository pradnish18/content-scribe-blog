import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/content_scribe';

// Connect to MongoDB
await mongoose.connect(MONGO_URI);

console.log('✅ Connected to MongoDB\n');

// Define schemas
const userSchema = new mongoose.Schema({
  username: String,
  passwordHash: String,
  favorites: [String],
});

const postSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    content: String,
    excerpt: String,
    featuredImage: String,
    status: String,
    createdDate: Date,
    publishedDate: Date,
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

// Check collections
console.log('📊 DATABASE STATISTICS\n');

const userCount = await User.countDocuments();
const postCount = await Post.countDocuments();
const publishedCount = await Post.countDocuments({ status: 'published' });
const draftCount = await Post.countDocuments({ status: 'draft' });

console.log(`Users: ${userCount}`);
console.log(`Total Posts: ${postCount}`);
console.log(`  - Published: ${publishedCount}`);
console.log(`  - Drafts: ${draftCount}\n`);

// List all users
console.log('👥 USERS:\n');
const users = await User.find().select('username favorites').lean();
if (users.length === 0) {
  console.log('  No users found\n');
} else {
  users.forEach((user, index) => {
    console.log(`${index + 1}. Username: ${user.username}`);
    console.log(`   Favorites: ${user.favorites?.length || 0} posts`);
    console.log('');
  });
}

// List all posts
console.log('📝 POSTS:\n');
const posts = await Post.find().sort({ createdAt: -1 }).lean();
if (posts.length === 0) {
  console.log('  No posts found\n');
} else {
  posts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Status: ${post.status}`);
    console.log(`   Created: ${new Date(post.createdDate || post.createdAt).toLocaleString()}`);
    if (post.publishedDate) {
      console.log(`   Published: ${new Date(post.publishedDate).toLocaleString()}`);
    }
    console.log(`   Excerpt: ${post.excerpt?.substring(0, 60)}...`);
    console.log('');
  });
}

// Close connection
await mongoose.connection.close();
console.log('✅ Connection closed');
