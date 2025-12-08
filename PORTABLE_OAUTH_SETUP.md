# Portable GitHub OAuth Setup Guide

This CSV Analyzer application uses a **portable OAuth configuration** system that works across different environments without requiring .env files.

## 🎯 Key Features

- ✅ **No .env dependency** - Works with runtime environment variables
- ✅ **Encrypted storage** - Credentials stored securely in encrypted file
- ✅ **Multiple config sources** - Runtime env vars, encrypted file, or .env fallback
- ✅ **PKCE security** - Enhanced OAuth security with Proof Key for Code Exchange
- ✅ **Platform agnostic** - Works on Vercel, AWS, Docker, Kubernetes, etc.

## 🚀 Quick Setup (3 Methods)

### Method 1: Interactive Setup Script (Easiest)

```bash
npm run setup-oauth
```

This interactive script will:
1. Ask for your app URL
2. Guide you through creating a GitHub OAuth App
3. Configure credentials automatically
4. Generate all required secrets

### Method 2: Environment Variables (Recommended for Production)

Set these environment variables on your deployment platform:

```bash
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret_generate_with_openssl
NEXTAUTH_URL=https://your-domain.com
```

**Generate NextAuth Secret:**
```bash
openssl rand -base64 32
```

### Method 3: Runtime API Configuration

```bash
# Start your app
npm run dev

# Configure via API
curl -X POST http://localhost:3000/api/config/setup \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "your_github_client_id",
    "clientSecret": "your_github_client_secret",
    "nextAuthUrl": "http://localhost:3000"
  }'
```

## 📋 GitHub OAuth App Setup

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Fill in OAuth App Details**
   - Application name: `CSV Analyzer`
   - Homepage URL: `http://localhost:3000` (or your domain)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Click "Register application"

3. **Get Your Credentials**
   - Copy the **Client ID**
   - Click "Generate a new client secret"
   - Copy the **Client Secret** (you won't see it again!)

4. **Configure Your App**
   - Use one of the three methods above to set your credentials

## 🌍 Platform-Specific Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add GITHUB_ID
vercel env add GITHUB_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Deploy
vercel --prod
```

**Important:** Update your GitHub OAuth app callback URL to:
`https://your-app.vercel.app/api/auth/callback/github`

### Docker

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  csv-analyzer:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GITHUB_ID=${GITHUB_ID}
      - GITHUB_SECRET=${GITHUB_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
```

Run with:
```bash
# Set your env vars
export GITHUB_ID=your_id
export GITHUB_SECRET=your_secret
export NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Start container
docker-compose up
```

### AWS / Kubernetes

Set environment variables in your deployment configuration:

**Kubernetes Secret:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: oauth-credentials
type: Opaque
stringData:
  GITHUB_ID: "your_client_id"
  GITHUB_SECRET: "your_client_secret"
  NEXTAUTH_SECRET: "your_nextauth_secret"
  NEXTAUTH_URL: "https://your-domain.com"
```

**Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: csv-analyzer
spec:
  template:
    spec:
      containers:
      - name: app
        image: csv-analyzer:latest
        envFrom:
        - secretRef:
            name: oauth-credentials
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Set environment variables
netlify env:set GITHUB_ID your_client_id
netlify env:set GITHUB_SECRET your_client_secret
netlify env:set NEXTAUTH_SECRET your_secret
netlify env:set NEXTAUTH_URL https://your-site.netlify.app

# Deploy
netlify deploy --prod
```

### Heroku

```bash
# Set environment variables
heroku config:set GITHUB_ID=your_client_id
heroku config:set GITHUB_SECRET=your_client_secret
heroku config:set NEXTAUTH_SECRET=$(openssl rand -base64 32)
heroku config:set NEXTAUTH_URL=https://your-app.herokuapp.com

# Deploy
git push heroku main
```

## 🔐 Security Best Practices

### ✅ DO:
- Use strong, randomly generated secrets for `NEXTAUTH_SECRET`
- Store secrets in platform environment variables (not in code)
- Use HTTPS in production for `NEXTAUTH_URL`
- Rotate secrets periodically
- Limit OAuth scopes to minimum required (`read:user user:email`)
- Use different OAuth apps for development/staging/production

### ❌ DON'T:
- Commit .env files to git (already in .gitignore)
- Share your GitHub Client Secret publicly
- Use `NEXT_PUBLIC_` prefix for secrets (exposes to browser)
- Hardcode credentials in source code
- Use the same OAuth app for dev and production

## 🔍 Configuration Priority Order

The app loads OAuth credentials in this order:

1. **Runtime Environment Variables** (highest priority)
   - Set by platform (Vercel, AWS, Docker, etc.)
   - Read from `process.env` at runtime
   
2. **Encrypted Configuration File** (`.auth-config.enc`)
   - Created by setup script or API
   - Encrypted with AES-256
   
3. **.env Files** (local development fallback)
   - `.env.local`, `.env.development`, `.env`
   - Only for local development

## 📊 Checking Configuration Status

```bash
# Check current configuration
curl http://localhost:3000/api/config/status

# Response:
{
  "configured": true,
  "source": "runtime-env",
  "hasClientId": true,
  "hasClientSecret": true,
  "hasNextAuthSecret": true,
  "nextAuthUrl": "http://localhost:3000",
  "errors": [],
  "warnings": []
}
```

## 🐛 Troubleshooting

### "OAuth Not Configured" Warning

**Solution:**
- Run `npm run setup-oauth` to configure credentials
- Or set environment variables on your platform
- Check configuration status: `curl http://localhost:3000/api/config/status`

### "Callback URL Mismatch" Error

**Solution:**
- Ensure GitHub OAuth app callback URL matches exactly:
  `https://your-domain.com/api/auth/callback/github`
- No trailing slash
- Must use HTTPS in production

### "Failed to Decrypt Configuration" Error

**Solution:**
- Set `AUTH_ENCRYPTION_KEY` environment variable
- Or delete `.auth-config.enc` and reconfigure
- Ensure the encryption key is consistent across deployments

### "Unauthorized" When Using Setup API

**Solution:**
- In production, include admin token header:
  ```bash
  curl -X POST http://your-app.com/api/config/setup \
    -H "x-admin-token: your-admin-token" \
    -H "Content-Type: application/json" \
    -d '{"clientId": "...", "clientSecret": "..."}'
  ```
- Set `ADMIN_SETUP_TOKEN` environment variable for production

## 🔄 Updating Credentials

### Update via Environment Variables
Simply update the environment variables on your platform and restart the app.

### Update via Setup Script
```bash
npm run setup-oauth
```

### Update via API
```bash
curl -X POST http://localhost:3000/api/config/setup \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "new_client_id",
    "clientSecret": "new_client_secret"
  }'
```

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "setup-oauth": "node scripts/setup-oauth.js",
    "check-config": "curl http://localhost:3000/api/config/status"
  }
}
```

## 🎓 Additional Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [NextAuth.js Documentation](https://next-auth.js.org/providers/github)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [PKCE Security Standard](https://oauth.net/2/pkce/)

## 💡 Pro Tips

1. **Use Different OAuth Apps for Each Environment**
   - Development: `http://localhost:3000`
   - Staging: `https://staging.your-app.com`
   - Production: `https://your-app.com`

2. **Automate Secret Rotation**
   - Use platform secret management (AWS Secrets Manager, etc.)
   - Schedule periodic credential updates

3. **Monitor OAuth Usage**
   - Check GitHub OAuth app settings for usage stats
   - Set up alerts for authentication failures

4. **Backup Configuration**
   - Export environment variables before major changes
   - Keep encrypted backup of `.auth-config.enc`

## 🆘 Support

If you encounter issues:
1. Check the configuration status API
2. Review the deployment platform logs
3. Verify GitHub OAuth app settings
4. Ensure callback URL matches exactly

---

**Need help?** Open an issue on GitHub or consult the platform-specific documentation above.
