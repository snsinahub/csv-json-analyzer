# Quick Start: GitHub Authentication

## 🚀 5-Minute Setup

### Step 1: Create GitHub OAuth App
Visit: https://github.com/settings/developers
- Click "New OAuth App"
- Name: `CSV Analyzer` (or your choice)
- Homepage: `http://localhost:3000`
- **Callback URL (IMPORTANT)**: `http://localhost:3000/api/auth/callback/github`
- Click "Register application"
- **Copy your Client ID**
- Click "Generate a new client secret" and **copy it immediately** (you won't see it again)

### Step 2: Configure Environment
```bash
# Generate a secure secret
openssl rand -base64 32

# Edit .env.local with your actual values:
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<paste-the-generated-secret>
GITHUB_ID=<paste-your-client-id>
GITHUB_SECRET=<paste-your-client-secret>
```

**CRITICAL**: Replace ALL placeholder values with your actual credentials!

### Step 3: Run
```bash
npm run dev
```

Visit http://localhost:3000 and click "Sign in with GitHub"! 🎉

## ✅ How to Verify It's Working

1. You should see "Sign in with GitHub" button in the navigation bar
2. Click it → redirected to GitHub authorization page
3. Click "Authorize" → redirected back to the same page you were on
4. Your profile picture and name appear in the navigation bar
5. Click your profile to see dropdown with sign out option

## 🚨 Common Issues

**"Sign in doesn't work" / "Redirects to error page"**
- Check that GITHUB_ID and GITHUB_SECRET are your **actual** values, not placeholders
- Verify the callback URL in GitHub OAuth app is exactly: `http://localhost:3000/api/auth/callback/github`
- Make sure NEXTAUTH_SECRET is set to a real generated value

**"Stays on loading spinner"**
- Restart the dev server: `npm run dev`
- Clear browser cookies for localhost:3000
- Check browser console for errors

**"Returns to homepage instead of current page"**
- This is now fixed! The app remembers which page you were on and returns you there after login

---

**Note**: Authentication is optional. The app works without it!

For detailed instructions, see [GITHUB_AUTH_SETUP.md](./GITHUB_AUTH_SETUP.md)
