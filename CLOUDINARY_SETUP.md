# Cloudinary Image Upload Setup Guide

## 📸 What is Cloudinary?

Cloudinary is a cloud-based image and video management service that provides:
- Automatic image optimization
- CDN delivery for fast loading
- Image transformations (resize, crop, etc.)
- Free tier: 25GB storage + 25GB bandwidth/month

---

## 🚀 Setup Instructions

### Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get Your Credentials

1. After logging in, go to your **Dashboard**
2. You'll see your account details:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3: Configure Your Server

1. Navigate to the `server` folder:
   ```bash
   cd server
   ```

2. Create a `.env` file (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

3. Add your Cloudinary credentials to `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

### Step 4: Restart Your Server

```bash
npm run dev
```

---

## ✅ Testing the Upload

1. Log in to the admin dashboard
2. Create or edit a blog post
3. Click "Choose Image" in the Featured Image section
4. Select an image (max 5MB)
5. Wait for the upload to complete
6. The image URL will be automatically saved

---

## 📋 Features

- ✅ **Automatic Optimization**: Images are compressed and optimized
- ✅ **CDN Delivery**: Fast loading from global CDN
- ✅ **Secure Storage**: Images stored securely in the cloud
- ✅ **Size Limit**: Max 5MB per image
- ✅ **Format Support**: JPG, PNG, GIF, WebP, SVG
- ✅ **Auto Resize**: Images resized to 1200x630 max

---

## 🔒 Security

- Images are uploaded with authentication (admin only)
- API credentials are stored in `.env` (never commit to Git)
- Rate limiting prevents abuse

---

## 💰 Free Tier Limits

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Images**: Unlimited

For most blogs, this is more than enough!

---

## 🆘 Troubleshooting

### Upload fails with "Failed to upload image"
- Check your `.env` file has correct credentials
- Verify your Cloudinary account is active
- Check server logs for detailed error

### Images not displaying
- Verify the URL is correct in the database
- Check Cloudinary dashboard to see if image was uploaded
- Ensure image is in the `blog-images` folder

### "Only image files are allowed" error
- Make sure you're uploading JPG, PNG, GIF, or WebP files
- File must be under 5MB

---

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
