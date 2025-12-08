# 🔐 Portable GitHub OAuth - Quick Start

## ⚡ 60-Second Setup

### Option 1: Interactive Setup (Recommended)
```bash
npm run setup-oauth
```

### Option 2: Manual Setup
1. Create GitHub OAuth App: https://github.com/settings/developers
2. Callback URL: `http://localhost:3000/api/auth/callback/github`
3. Set environment variables:
```bash
export GITHUB_ID=your_client_id
export GITHUB_SECRET=your_client_secret
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
npm run dev
```

## 🌍 Production Deployment

### Vercel
```bash
vercel env add GITHUB_ID
vercel env add GITHUB_SECRET
vercel env add NEXTAUTH_SECRET
vercel --prod
```

### Docker
```bash
docker run -p 3000:3000 \
  -e GITHUB_ID=your_id \
  -e GITHUB_SECRET=your_secret \
  -e NEXTAUTH_SECRET=your_secret \
  csv-analyzer
```

### Other Platforms
Set these environment variables on your platform:
- `GITHUB_ID`
- `GITHUB_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your app URL)

## 🔍 Check Configuration
```bash
npm run check-config
```

## 📚 Full Documentation
See [PORTABLE_OAUTH_SETUP.md](./PORTABLE_OAUTH_SETUP.md) for complete guide.

## ✨ Key Features
- ✅ No .env files required
- ✅ Works everywhere (Vercel, AWS, Docker, K8s)
- ✅ Encrypted local storage
- ✅ PKCE security enabled
- ✅ Runtime configuration

---

**Having issues?** Check the [Troubleshooting Guide](./PORTABLE_OAUTH_SETUP.md#-troubleshooting)
