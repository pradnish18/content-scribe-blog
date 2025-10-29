# 📝 ContentScribe Blog

A modern, full-stack blog application with separate user and admin authentication, favorites functionality, and cloud-based image storage.

![ContentScribe](https://img.shields.io/badge/React-18.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### User Features
- 📖 Browse and read blog posts
- ❤️ Add posts to favorites
- 🔐 User authentication (sign up/sign in)
- 📱 Responsive design
- 🔍 Search functionality
- 💾 Favorites page

### Admin Features
- ✍️ Create and edit blog posts
- 🖼️ Upload images to Cloudinary
- 📝 Rich text editor with formatting tools
- 🎨 Insert images in content
- 📊 Admin dashboard
- 🔒 Separate admin authentication

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Shadcn/ui** - UI components
- **React Router** - Routing

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Multer** - File uploads

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- Cloudinary account (free tier)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/pradnish18/content-scribe-blog.git
cd content-scribe-blog
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
```

4. **Set up environment variables**

Create `server/.env` file:
```env
MONGO_URI=mongodb://127.0.0.1:27017/content_scribe
JWT_SECRET=your_super_secret_jwt_key
PORT=4000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. **Start MongoDB**
```bash
mongod
```

6. **Start the backend server**
```bash
cd server
npm run dev
```

7. **Start the frontend (in a new terminal)**
```bash
npm run dev
```

8. **Open your browser**
```
http://localhost:8080
```

## 📖 Usage

### As a User
1. Visit the homepage
2. Click "Sign in" to create an account
3. Browse posts and click the heart icon to add favorites
4. View your favorites at `/favorites`

### As an Admin
1. Go to `/admin`
2. Login with admin credentials
3. Create new posts at `/admin/post/new`
4. Upload images using the image button in the editor
5. Publish or save as draft

## 📁 Project Structure

```
content-scribe-blog/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities
├── server/                # Backend source
│   ├── index.js           # Express server
│   ├── cloudinary-config.js
│   └── package.json
├── public/                # Static assets
└── README.md
```

## 🔐 Authentication

### User Authentication
- Token stored as `userToken` in localStorage
- Can add favorites and access protected pages
- Cannot create or edit posts

### Admin Authentication
- Token stored as `adminToken` in localStorage
- Full access to dashboard and post management
- Separate login endpoint (`/admin`)

## 🌐 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy
1. Deploy backend to Render/Railway
2. Set up MongoDB Atlas
3. Deploy frontend to Netlify/Vercel
4. Update environment variables

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for step-by-step guide.

## 📝 Documentation

- [User & Admin Flow](./USER_ADMIN_FLOW.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Quick Deploy](./QUICK_DEPLOY.md)
- [Image Upload Fix](./IMAGE_UPLOAD_FIX.md)
- [Cloudinary Setup](./CLOUDINARY_SETUP.md)

## 🐛 Troubleshooting

See [FIXES_APPLIED.md](./FIXES_APPLIED.md) for common issues and solutions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Pradnish Chintada**
- GitHub: [@pradnish18](https://github.com/pradnish18)

## 🙏 Acknowledgments

- Built with React and Node.js
- UI components from Shadcn/ui
- Icons from Lucide React
- Image storage by Cloudinary

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8bd18b2e-ab32-40e6-9e88-24938ace5d97) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
