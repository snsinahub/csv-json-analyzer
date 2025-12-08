# 🎯 Quick Reference Card - Portable OAuth

## 📦 Installation
```bash
git clone https://github.com/snsinahub-org/csv-analyzer.git
cd csv-analyzer
npm install
npm run setup-oauth  # Interactive setup
npm run dev          # Start app
```

## 🔧 Setup Commands
| Command | Description |
|---------|-------------|
| `npm run setup-oauth` | Interactive OAuth setup |
| `npm run check-config` | Check configuration status |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |

## 🌍 Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_ID` | ✅ Yes | GitHub OAuth Client ID |
| `GITHUB_SECRET` | ✅ Yes | GitHub OAuth Client Secret |
| `NEXTAUTH_SECRET` | ✅ Yes | NextAuth secret (32+ chars) |
| `NEXTAUTH_URL` | ⚠️ Prod | Your app URL |
| `AUTH_ENCRYPTION_KEY` | ❌ Optional | Encryption key for config file |
| `ADMIN_SETUP_TOKEN` | ❌ Optional | Admin token for setup API |

## 🔐 Generate Secrets
```bash
# NextAuth Secret
openssl rand -base64 32

# Admin Token (optional)
openssl rand -hex 32
```

## 📋 GitHub OAuth App Setup
1. Visit: https://github.com/settings/developers
2. Click "New OAuth App"
3. Set:
   - **Name:** CSV Analyzer
   - **Homepage:** http://localhost:3000
   - **Callback:** http://localhost:3000/api/auth/callback/github
4. Copy Client ID and Client Secret
5. Run `npm run setup-oauth` and paste credentials

## 🚀 Quick Deploy

### Vercel
```bash
vercel env add GITHUB_ID
vercel env add GITHUB_SECRET
vercel env add NEXTAUTH_SECRET
vercel --prod
```

### Docker
```bash
docker-compose up -d
```

### Heroku
```bash
heroku config:set GITHUB_ID=xxx
heroku config:set GITHUB_SECRET=xxx
heroku config:set NEXTAUTH_SECRET=xxx
git push heroku main
```

## 🔍 API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/config/status` | GET | Configuration status |
| `/api/config/setup` | GET | Setup instructions |
| `/api/config/setup` | POST | Configure credentials |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |

## 🛠️ Troubleshooting
| Issue | Solution |
|-------|----------|
| "OAuth Not Configured" | Run `npm run setup-oauth` |
| "Callback URL Mismatch" | Check GitHub OAuth app settings |
| "Failed to Decrypt" | Set `AUTH_ENCRYPTION_KEY` or delete `.auth-config.enc` |
| "Unauthorized" | Add `x-admin-token` header in production |

## 📚 Documentation
- **Quick Start:** [OAUTH_QUICKSTART.md](./OAUTH_QUICKSTART.md)
- **Full Guide:** [PORTABLE_OAUTH_SETUP.md](./PORTABLE_OAUTH_SETUP.md)
- **Migration:** [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Summary:** [COMPLETE_SUMMARY.md](./COMPLETE_SUMMARY.md)

## ✅ Configuration Sources (Priority)
1. Runtime Environment Variables (highest)
2. Encrypted File (.auth-config.enc)
3. .env Files (lowest)

## 🔐 Security Features
- ✅ PKCE OAuth flow
- ✅ AES-256 encryption
- ✅ Admin API protection
- ✅ No client-side secrets

## 💡 Pro Tips
- Local dev: Use `.env.local`
- Production: Use platform env vars
- Docker: Use `docker-compose.yml`
- Multiple envs: Separate OAuth apps
- Check status: `npm run check-config`

---
**Need help?** See [PORTABLE_OAUTH_SETUP.md](./PORTABLE_OAUTH_SETUP.md) § Troubleshooting
