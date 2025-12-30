# Deployment Guide

## Railway Deployment

### Quick Deploy

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Railway project**:
   ```bash
   railway init
   ```
   - Choose "Create new project"
   - Name it "ai-first-canvas"

4. **Set environment variables**:
   ```bash
   railway variables set ANTHROPIC_API_KEY=your_api_key_here
   railway variables set NODE_ENV=production
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

6. **Get your deployment URL**:
   ```bash
   railway domain
   ```

7. **Update the base URL** (use the domain from step 6):
   ```bash
   railway variables set NEXT_PUBLIC_BASE_URL=https://your-app.railway.app
   ```

### Optional: Email Configuration

To enable real email sending (instead of console logs), add SMTP settings:

```bash
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_PORT=465
railway variables set SMTP_USER=your-email@gmail.com
railway variables set SMTP_PASS=your-app-password
railway variables set SMTP_FROM=noreply@yourapp.com
```

### Database Persistence

Railway automatically persists the SQLite database. If you need to:

- **View logs**: `railway logs`
- **Shell access**: `railway run bash`
- **Redeploy**: `railway up`

## Alternative: Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_BASE_URL`
   - Optional SMTP settings

Note: For Vercel, you may need to use a hosted database instead of SQLite. Consider using Turso (SQLite-compatible) or PostgreSQL.

## Testing the Deployment

1. Visit your deployed URL
2. Enter your email and select "Professor"
3. Check logs for the magic link (in dev mode) or your email (in prod)
4. Create a test course
5. Add student emails
6. Test the AI chat interface

## Troubleshooting

- **Database issues**: Check Railway logs with `railway logs`
- **API errors**: Verify ANTHROPIC_API_KEY is set correctly
- **Magic links not working**: Check NEXT_PUBLIC_BASE_URL matches your domain
- **Build failures**: Ensure all dependencies are in package.json

## Monitoring

- **Railway Dashboard**: https://railway.app/dashboard
- **Logs**: `railway logs --follow`
- **Metrics**: View in Railway dashboard (CPU, memory, bandwidth)
