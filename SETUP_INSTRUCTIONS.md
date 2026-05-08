# Resound Setup Instructions

## Deployed Portfolio Demo

The archived portfolio demo is available at [https://resound-nu.vercel.app/](https://resound-nu.vercel.app/).

The hosted demo uses curated data and simulated side effects so visitors can safely explore browsing, booking, messaging, uploads, and rental management flows.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# MongoDB Database URL
# Get this from MongoDB Atlas or your local MongoDB instance
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
DATABASE_URL=

# NextAuth Configuration
# Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET=

# GitHub OAuth (optional - for GitHub login)
GITHUB_ID=
GITHUB_SECRET=

# Google OAuth (optional - for Google login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Uploadthing Configuration (for image uploads)
# Get these from your Uploadthing dashboard
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
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

2. For the archived portfolio demo, run with demo mode enabled:
   ```bash
   NEXT_PUBLIC_RESOUND_DEMO=true npm run dev
   ```

   This uses curated demo data and simulates payments, messages, uploads, and rental actions without external services or database writes.

3. For the real marketplace path, configure the services above and run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

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

For Uploadthing (image uploads):
1. Sign up at [Uploadthing](https://uploadthing.com/)
2. Create a new app in the dashboard
3. Get your app ID and secret from the API Keys section 
