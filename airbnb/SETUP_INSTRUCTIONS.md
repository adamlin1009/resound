# Resound Setup Instructions

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# MongoDB Database URL
# Get this from MongoDB Atlas or your local MongoDB instance
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
DATABASE_URL=mongodb+srv://mengshuzhang1:rXhU8Rp6STOJgXnS@cluster0-free.huxj8fj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-free

# NextAuth Configuration
# Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET=

# GitHub OAuth (optional - for GitHub login)
GITHUB_ID=
GITHUB_SECRET=

# Google OAuth (optional - for Google login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudinary Configuration (for image uploads)
# Get these from your Cloudinary dashboard
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

## Database Setup

1. **MongoDB Atlas (Recommended)**:
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user with read/write permissions
   - Get your connection string and add it to `DATABASE_URL`

2. **Local MongoDB**:
   - Install MongoDB locally
   - Use connection string: `mongodb://localhost:27017/resound`

3. **Initialize Prisma**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Optional: OAuth Setup

For social login functionality:

1. **GitHub OAuth**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set callback URL to: `http://localhost:3000/api/auth/callback/github`

2. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## Image Upload Setup

For Cloudinary (image uploads):
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name from the dashboard
3. Create an unsigned upload preset in Settings > Upload 