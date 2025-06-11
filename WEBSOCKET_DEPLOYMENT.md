# WebSocket Deployment Guide

This guide explains how to deploy the WebSocket server to Railway while keeping the main Next.js app on Vercel.

## Why Separate Deployment?

Vercel's serverless architecture doesn't support persistent WebSocket connections. By deploying the WebSocket server separately on Railway, we get:
- Full WebSocket support with Socket.io
- Real-time messaging functionality
- Persistent connections for live updates
- Scalable infrastructure

## Prerequisites

1. Railway account (https://railway.app)
2. Railway CLI installed
3. Vercel deployment for main app

## Deployment Steps

### 1. Install Railway CLI

```bash
# macOS
brew install railway

# npm
npm install -g @railway/cli
```

### 2. Deploy to Railway

```bash
# Login to Railway
railway login

# Initialize new project (first time only)
railway init

# Deploy the server
railway up
```

### 3. Configure Environment Variables in Railway

Go to your Railway project dashboard and set these variables:

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
CORS_ORIGIN=https://your-vercel-app.vercel.app,https://your-custom-domain.com
DATABASE_URL=mongodb+srv://...  # Same as your Vercel app
NEXTAUTH_SECRET=...             # Same as your Vercel app
```

### 4. Update Vercel Environment Variables

In your Vercel project settings, add:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-project-name.up.railway.app
```

### 5. Redeploy Vercel App

Trigger a new deployment on Vercel to pick up the new environment variable.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  Vercel         │ <-----> │  Railway         │
│  (Next.js App)  │ Socket  │  (WebSocket)     │
│                 │         │                  │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         └──────────┬────────────────┘
                    │
              ┌─────▼─────┐
              │           │
              │  MongoDB  │
              │           │
              └───────────┘
```

## Testing the Connection

### Local Development with Production Socket

```bash
NEXT_PUBLIC_SOCKET_URL=https://your-project.up.railway.app npm run dev
```

### Health Check

```bash
# Should return Socket.io client JavaScript
curl https://your-project.up.railway.app/socket.io/socket.io.js
```

### Monitor Logs

```bash
# View real-time logs
railway logs
```

## Troubleshooting

### Connection Refused
- Check CORS_ORIGIN includes your Vercel URL
- Verify Railway app is running: `railway status`
- Check Railway logs: `railway logs`

### Authentication Errors
- Ensure NEXTAUTH_SECRET matches between Railway and Vercel
- Verify token is being passed from client

### CORS Issues
- CORS_ORIGIN should be comma-separated list
- Include both Vercel preview URLs and production domain
- Don't include trailing slashes

## Monitoring & Maintenance

### Railway Dashboard
- Monitor metrics at https://railway.app/dashboard
- Set up health checks and alerts
- Configure auto-restart on crashes

### Scaling
Railway automatically handles:
- SSL certificates
- Load balancing
- Auto-scaling based on traffic

### Updates
To deploy updates:
```bash
railway up
```

## Cost Considerations

- Railway offers $5/month free tier
- WebSocket server is lightweight, typically uses minimal resources
- Monitor usage in Railway dashboard

## Security Notes

- All connections use WSS (WebSocket Secure)
- Authentication handled via NextAuth tokens
- CORS restricted to your domains only
- Environment variables kept secure in Railway

## Alternative Deployment Options

If Railway doesn't meet your needs:
1. **Render** - Similar to Railway with free tier
2. **Fly.io** - Global edge deployment
3. **DigitalOcean App Platform** - Simple PaaS
4. **AWS EC2** - Full control but more complex

For questions or issues, check the Railway docs at https://docs.railway.app