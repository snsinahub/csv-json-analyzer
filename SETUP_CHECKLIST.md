# GitHub OAuth Setup Checklist

Use this checklist to set up GitHub authentication for your CSV Analyzer application.

## ✅ Prerequisites
- [ ] Node.js installed
- [ ] CSV Analyzer dependencies installed (`npm install`)
- [ ] GitHub account created

## ✅ GitHub OAuth App Setup

### Create OAuth App
- [ ] Visit https://github.com/settings/developers
- [ ] Click "OAuth Apps" → "New OAuth App"
- [ ] Fill in application details:
  - [ ] Application name: `CSV Analyzer`
  - [ ] Homepage URL: `http://localhost:3000`
  - [ ] Callback URL: `http://localhost:3000/api/auth/callback/github`
- [ ] Click "Register application"
- [ ] Copy Client ID
- [ ] Generate and copy Client Secret

## ✅ Environment Configuration

### Generate Secret
- [ ] Run: `openssl rand -base64 32`
- [ ] Copy the generated secret

### Configure .env.local
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Update `NEXTAUTH_URL` (should be `http://localhost:3000`)
- [ ] Paste generated secret into `NEXTAUTH_SECRET`
- [ ] Paste GitHub Client ID into `GITHUB_ID`
- [ ] Paste GitHub Client Secret into `GITHUB_SECRET`
- [ ] Save the file

## ✅ Testing

### Start Application
- [ ] Run: `npm run dev`
- [ ] Open: http://localhost:3000
- [ ] Verify app loads without errors

### Test Authentication
- [ ] See "Sign in with GitHub" button in navigation
- [ ] Click "Sign in with GitHub"
- [ ] Authorize the application on GitHub
- [ ] Redirected back to app
- [ ] See your profile picture and name in navigation
- [ ] Click profile dropdown
- [ ] See your name, email, and username
- [ ] Click "Sign Out"
- [ ] Signed out successfully

### Test Without Auth (Optional)
- [ ] Rename `.env.local` to `.env.local.backup`
- [ ] Restart dev server
- [ ] Verify app works without auth
- [ ] Rename back to `.env.local` if you want auth

## ✅ Verification

- [ ] No console errors in browser
- [ ] No terminal errors in dev server
- [ ] Profile picture displays correctly
- [ ] Sign in/out flow works smoothly
- [ ] All app features still work (Analyze, Generate, etc.)

## 🎉 You're Done!

Your CSV Analyzer now has GitHub authentication enabled!

## 📚 Documentation Files

- `GITHUB_AUTH_SETUP.md` - Detailed setup guide with troubleshooting
- `QUICK_START_AUTH.md` - Quick 5-minute setup reference
- `AUTH_IMPLEMENTATION.md` - Technical implementation details
- `README.md` - Updated with authentication section

## 🔒 Security Reminders

- ✅ `.env.local` is in `.gitignore`
- ✅ Never commit secrets to git
- ✅ Use different OAuth apps for dev/production
- ✅ Keep Client Secret private

## 🚀 Next Steps (Optional)

- [ ] Deploy to production (Vercel, Netlify, etc.)
- [ ] Create production GitHub OAuth app
- [ ] Add production environment variables
- [ ] Test authentication in production

---

**Need help?** Check `GITHUB_AUTH_SETUP.md` for troubleshooting tips.
