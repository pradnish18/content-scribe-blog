import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/content_scribe';

// Connect to MongoDB
await mongoose.connect(MONGO_URI);
console.log('✅ Connected to MongoDB\n');

// Define schemas
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

// Display Users
console.log('📊 USERS:');
console.log('='.repeat(50));
const users = await User.find({}).lean();
if (users.length === 0) {
  console.log('No users found.\n');
} else {
  users.forEach((user, index) => {
    console.log(`\nUser ${index + 1}:`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Favorites: ${user.favorites.length} posts`);
    console.log(`  Favorites list: ${user.favorites.join(', ') || 'None'}`);
    console.log(`  ID: ${user._id}`);
  });
}

// Display Posts
console.log('\n\n📝 POSTS:');
console.log('='.repeat(50));
const posts = await Post.find({}).sort({ createdAt: -1 }).lean();
if (posts.length === 0) {
  console.log('No posts found.\n');
} else {
  console.log(`\nTotal Posts: ${posts.length}\n`);
  posts.forEach((post, index) => {
    console.log(`\nPost ${index + 1}:`);
    console.log(`  Title: ${post.title}`);
    console.log(`  Slug: ${post.slug}`);
    console.log(`  Status: ${post.status}`);
    console.log(`  Content length: ${post.content?.length || 0} characters`);
    console.log(`  Excerpt: ${post.excerpt?.substring(0, 100) || 'None'}...`);
    console.log(`  Featured Image: ${post.featuredImage || 'None'}`);
    console.log(`  Created: ${post.createdDate || post.createdAt}`);
    console.log(`  Published: ${post.publishedDate || 'Not published'}`);
    console.log(`  ID: ${post._id}`);
  });
}

// Statistics
console.log('\n\n📈 STATISTICS:');
console.log('='.repeat(50));
const stats = {
  totalUsers: await User.countDocuments(),
  totalPosts: await Post.countDocuments(),
  publishedPosts: await Post.countDocuments({ status: 'published' }),
  draftPosts: await Post.countDocuments({ status: 'draft' }),
};
console.log(`Total Users: ${stats.totalUsers}`);
console.log(`Total Posts: ${stats.totalPosts}`);
console.log(`  - Published: ${stats.publishedPosts}`);
console.log(`  - Drafts: ${stats.draftPosts}`);

await mongoose.disconnect();
console.log('\n✅ Disconnected from MongoDB');

