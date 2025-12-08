# Migration Guide: .env to Portable OAuth

## 📊 Overview

This guide helps you migrate from the previous .env-based OAuth setup to the new portable configuration system.

**Good news:** Your existing setup still works! The new system is 100% backward compatible.

## 🔄 What Changed?

### Before (Still Works)
```bash
# .env.local
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

### After (Recommended)
```bash
# Option 1: Same as before (no change needed)
# Option 2: Use encrypted file (more portable)
# Option 3: Use runtime env vars (platform-agnostic)
```

## ✅ No Action Required

If your current setup works, you don't need to change anything! The app will:
1. Continue reading from `.env.local` as before
2. Work exactly the same way
3. Show "Configuration Source: env-file" in logs

## 🚀 Upgrade Path (Optional)

### Why Upgrade?

- ✅ **Portability** - Deploy anywhere without .env files
- ✅ **Security** - Encrypted credential storage
- ✅ **Flexibility** - Runtime configuration updates
- ✅ **Simplicity** - One setup script for all environments

### How to Upgrade

#### Option 1: Keep Using .env (No Change)
Your existing `.env.local` file continues to work. Nothing to do!

#### Option 2: Migrate to Encrypted File
```bash
# Run the setup script
npm run setup-oauth

# Choose "API call" when prompted
# This will create an encrypted .auth-config.enc file

# Optional: Delete .env.local if you want
# (The encrypted file takes priority)
```

#### Option 3: Use Platform Environment Variables
```bash
# For Vercel
vercel env add GITHUB_ID
vercel env add GITHUB_SECRET
vercel env add NEXTAUTH_SECRET

# For Docker
# Add to docker-compose.yml environment section

# For Heroku
heroku config:set GITHUB_ID=your_id
heroku config:set GITHUB_SECRET=your_secret
heroku config:set NEXTAUTH_SECRET=your_secret

# For AWS/Kubernetes
# Add to your deployment config
```

## 🔍 Verify Your Setup

After migration (or to check current setup):

```bash
# Check configuration status
npm run check-config

# Or via API
curl http://localhost:3000/api/config/status
```

Expected response:
```json
{
  "configured": true,
  "source": "runtime-env",  // or "encrypted-file" or "env-file"
  "hasClientId": true,
  "hasClientSecret": true,
  "hasNextAuthSecret": true,
  "nextAuthUrl": "http://localhost:3000"
}
```

## 🆕 New Features Available

### 1. Runtime Configuration API
Update credentials without restarting the app:
```bash
curl -X POST http://localhost:3000/api/config/setup \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "new_client_id",
    "clientSecret": "new_client_secret"
  }'
```

### 2. Configuration Banner
The app now shows a warning banner if OAuth is not configured:
- Helpful for new deployments
- Auto-dismisses when configured
- Provides setup instructions

### 3. PKCE Security
OAuth flow now includes PKCE (Proof Key for Code Exchange):
- Enhanced security against interception attacks
- Transparent to users
- No configuration changes needed

### 4. Multiple Configuration Sources
Priority order:
1. Runtime environment variables (highest)
2. Encrypted configuration file
3. .env files (lowest)

### 5. Interactive Setup Script
```bash
npm run setup-oauth
```
Guides you through the entire setup process.

## 📋 Comparison

| Feature | Old System | New System |
|---------|-----------|------------|
| .env files | Required | Optional |
| Portability | Low | High |
| Security | OAuth | OAuth + PKCE |
| Setup | Manual | Interactive script |
| Runtime config | ❌ No | ✅ Yes |
| Encrypted storage | ❌ No | ✅ Yes |
| Docker support | ⚠️ Mount .env | ✅ Env vars |
| Vercel support | ⚠️ Manual | ✅ Automatic |
| Config validation | ⚠️ Basic | ✅ Comprehensive |
| Status checking | ❌ No | ✅ Yes |
| Error messages | ⚠️ Generic | ✅ Detailed |

## 🛠️ Troubleshooting

### My .env.local stopped working
**Solution:** Check the file is in the root directory and properly formatted.

```bash
# Verify file exists
ls -la .env.local

# Check format
cat .env.local
```

### I see "source: missing" in status
**Solution:** No configuration found. Run:
```bash
npm run setup-oauth
```

### Configuration not updating
**Solution:** Restart the dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Which configuration source is being used?
**Solution:** Check the logs on server startup:
```
🔧 OAuth Configuration Source: runtime-env
```

Or check the API:
```bash
npm run check-config
```

## 🎯 Recommended Setup by Environment

### Local Development
**Keep using .env.local** - It's the easiest for local work.
```bash
# No change needed if you already have .env.local
```

### Docker Deployment
**Use environment variables** in docker-compose.yml:
```yaml
environment:
  - GITHUB_ID=${GITHUB_ID}
  - GITHUB_SECRET=${GITHUB_SECRET}
  - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
```

### Vercel/Netlify
**Use platform environment variables**:
```bash
vercel env add GITHUB_ID
vercel env add GITHUB_SECRET
vercel env add NEXTAUTH_SECRET
```

### Kubernetes/AWS
**Use Secrets**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: oauth-credentials
stringData:
  GITHUB_ID: "your_id"
  GITHUB_SECRET: "your_secret"
```

## 📚 Additional Resources

- [Portable OAuth Setup Guide](./PORTABLE_OAUTH_SETUP.md)
- [Quick Start](./OAUTH_QUICKSTART.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Main README](./README.md)

## ❓ FAQ

**Q: Do I need to change anything?**  
A: No, if your current setup works, you're all set!

**Q: Will my .env.local file be deleted?**  
A: No, it's still used as a fallback. You can keep it.

**Q: Can I use both .env and encrypted file?**  
A: Yes! The encrypted file takes priority if both exist.

**Q: Is this more secure?**  
A: Yes, PKCE is now enabled, and encrypted storage is available.

**Q: What if I want to go back to the old way?**  
A: Just delete `.auth-config.enc` and use `.env.local` only.

**Q: Do I need to update my GitHub OAuth app?**  
A: No, callback URL and settings remain the same.

## 🎉 Summary

- ✅ **Backward Compatible** - Existing setups work unchanged
- ✅ **Optional Upgrade** - Migrate when ready
- ✅ **Enhanced Security** - PKCE now enabled for everyone
- ✅ **Better Portability** - Deploy anywhere easier
- ✅ **Improved DX** - Better errors and setup tools

**Need help?** Run `npm run setup-oauth` and follow the prompts!
