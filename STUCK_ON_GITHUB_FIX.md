# 🚨 TROUBLESHOOTING: Stuck on GitHub Page

## Your Exact Issue
"I click sign in, go to GitHub, authorize the app, but stay on GitHub page. When I come back to CSV Analyzer, I'm not logged in."

## Root Causes

This happens when **one of these is wrong**:

### 1. ❌ GitHub OAuth App Callback URL is Wrong

**The Problem**: GitHub doesn't know where to send you back after authorization.

**The Fix**:
1. Go to: https://github.com/settings/developers
2. Click on your "CSV Analyzer" OAuth app
3. Check "Authorization callback URL"
4. It MUST be **exactly**: `http://localhost:3000/api/auth/callback/github`
5. Not `http://localhost:3000`
6. Not `http://localhost:3000/api/auth/callback`
7. Not `http://localhost:3000/callback`
8. **Exactly**: `http://localhost:3000/api/auth/callback/github`

### 2. ❌ Environment Variables are Placeholders

**The Problem**: Your `.env.local` still has fake values.

**Check your `.env.local` file**:
```bash
cat .env.local
```

If you see this, it's **WRONG**:
```
GITHUB_ID=your-github-client-id-here
GITHUB_SECRET=your-github-client-secret-here
```

**The Fix**:
1. Go to: https://github.com/settings/developers
2. Open your "CSV Analyzer" app
3. Copy the **Client ID**
4. Generate a new **Client Secret** (click the button)
5. Replace the values in `.env.local`:
   ```
   GITHUB_ID=Iv1.a1b2c3d4e5f6g7h8    ← Your actual ID
   GITHUB_SECRET=ghp_abc123xyz...     ← Your actual secret
   ```

### 3. ❌ NEXTAUTH_SECRET is Missing/Placeholder

**The Problem**: NextAuth can't encrypt sessions.

**The Fix**:
```bash
# Generate a real secret
openssl rand -base64 32

# Copy the output and paste it in .env.local:
NEXTAUTH_SECRET=tK8xVz3jP9mN2qR5wX7vL1bC4fD6hG8kJ0s
```

### 4. ❌ Dev Server Wasn't Restarted

**The Problem**: Changes to `.env.local` don't take effect until restart.

**The Fix**:
```bash
# Stop the server (Ctrl+C or Cmd+C)
# Then start again:
npm run dev
```

## 🛠️ Step-by-Step Fix

### STEP 1: Verify GitHub OAuth App

```bash
# Open this URL:
https://github.com/settings/developers
```

Click on your app and verify:
- ✅ Homepage URL: `http://localhost:3000`
- ✅ Callback URL: `http://localhost:3000/api/auth/callback/github`

**If the callback URL is wrong, UPDATE IT NOW.**

### STEP 2: Get Real Credentials

On the same GitHub OAuth app page:
1. Copy the **Client ID** (looks like: `Iv1.abc123...`)
2. Click "Generate a new client secret"
3. **COPY IT IMMEDIATELY** - you won't see it again!

### STEP 3: Update .env.local

```bash
# Open the file
nano .env.local
# or
code .env.local
```

Replace with **your actual values**:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<run: openssl rand -base64 32 and paste here>
GITHUB_ID=<paste your Client ID>
GITHUB_SECRET=<paste your Client Secret>
```

Save and close.

### STEP 4: Verify Configuration

```bash
npm run check-auth
```

You should see:
```
✅ .env.local file exists
✅ NEXTAUTH_URL: http://localhost:3000
✅ NEXTAUTH_SECRET: tK8xVz3j...
✅ GITHUB_ID: Iv1.a1b2...
✅ GITHUB_SECRET: ghp_abc123...

✨ Configuration looks good!
```

If you see ❌ errors, fix them!

### STEP 5: Restart Dev Server

```bash
# Kill current server (Ctrl+C)
npm run dev
```

### STEP 6: Test Authentication

1. Open: http://localhost:3000
2. Click "Sign in with GitHub"
3. You should see GitHub authorization page
4. Click "Authorize"
5. **You should be redirected back to localhost:3000**
6. Your profile should appear in the navigation

## 🔍 Still Not Working?

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Click "Sign in with GitHub"
4. Look for errors

**Common Errors**:

```
Error: Invalid client
→ Wrong GITHUB_ID or GITHUB_SECRET
```

```
Error: redirect_uri_mismatch
→ Callback URL in GitHub OAuth app is wrong
```

```
Error: Missing NEXTAUTH_SECRET
→ .env.local not configured properly
```

### Check Terminal Output

When you click "Sign in", you should see in your terminal:
```
✅ Sign in callback - User: your@email.com
🔑 JWT callback - New sign in
👤 Session callback
🔄 Redirect callback: { url: '/analyze', baseUrl: 'http://localhost:3000' }
```

If you see errors, read them carefully.

### Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Click "Sign in with GitHub"
4. Watch the requests

You should see:
1. Request to `/api/auth/signin/github`
2. Redirect to `github.com/login/oauth/authorize`
3. After authorize, redirect to `/api/auth/callback/github`
4. Finally redirect back to your page

**If it stops at step 2 or 3**: Callback URL is wrong in GitHub OAuth app.

## 🎯 Quick Test

Run this helper script:
```bash
./scripts/setup-auth.sh
```

It will:
- Check if `.env.local` exists
- Detect placeholder values
- Generate NEXTAUTH_SECRET for you
- Give you step-by-step instructions

## 📋 Checklist

- [ ] GitHub OAuth app exists at https://github.com/settings/developers
- [ ] Callback URL is **exactly**: `http://localhost:3000/api/auth/callback/github`
- [ ] `.env.local` has **real** GITHUB_ID (not placeholder)
- [ ] `.env.local` has **real** GITHUB_SECRET (not placeholder)
- [ ] `.env.local` has **real** NEXTAUTH_SECRET (generated with openssl)
- [ ] Dev server was **restarted** after editing `.env.local`
- [ ] `npm run check-auth` shows ✅ for all variables
- [ ] Browser console shows no errors
- [ ] Terminal shows no errors

## 💡 Pro Tip

If you keep having issues:

1. **Delete your OAuth app** on GitHub
2. **Create a brand new one** with exact settings
3. **Copy the credentials immediately**
4. **Update `.env.local`**
5. **Restart server**
6. **Try again**

Sometimes starting fresh is fastest!

## 🆘 Still Stuck?

Share this information:
```bash
# Run these commands and share the output:
npm run check-auth
cat .env.local | grep -v SECRET | grep -v GITHUB_SECRET
```

This will show your config (without exposing secrets).
