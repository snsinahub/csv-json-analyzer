# GitHub OAuth - Complete Setup Guide

## 🎯 What You Need to Do

You need to **replace placeholder values** in `.env.local` with **real credentials** from GitHub.

## 📝 Step-by-Step Instructions

### STEP 1: Get GitHub OAuth Credentials (5 minutes)

1. **Open GitHub Developer Settings**
   - Go to: https://github.com/settings/developers
   - Or: GitHub → Settings → Developer settings → OAuth Apps

2. **Create New OAuth App**
   - Click: **"New OAuth App"** button
   
3. **Fill in the Form:**
   ```
   Application name:     CSV Analyzer
   Homepage URL:         http://localhost:3000
   Application description:  (leave blank or add description)
   Authorization callback URL:  http://localhost:3000/api/auth/callback/github
   ```
   
   ⚠️ **CRITICAL**: The callback URL must be **exactly**:
   `http://localhost:3000/api/auth/callback/github`

4. **Click "Register application"**

5. **Copy Your Credentials**
   - You'll see a page with your app details
   - **Client ID**: Copy this (you'll see it anytime)
   - **Client secrets**: Click "Generate a new client secret"
   - **IMPORTANT**: Copy the secret NOW - you won't see it again!

### STEP 2: Generate NextAuth Secret (1 minute)

Open your terminal and run:
```bash
openssl rand -base64 32
```

Copy the output - you'll need it in the next step.

### STEP 3: Update .env.local (2 minutes)

1. **Open the file**: `.env.local` in your CSV Analyzer project

2. **Replace the values** (don't use the example values below, use YOUR actual values!):

   ```env
   # Before (❌ WRONG - these are placeholders):
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=please-generate-a-secret-with-openssl-rand-base64-32
   GITHUB_ID=your-github-client-id-here
   GITHUB_SECRET=your-github-client-secret-here

   # After (✅ CORRECT - with your actual values):
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=tK8xVz3jP9mN2qR5wX7vL1bC4fD6hG8kJ0s
   GITHUB_ID=Iv1.a1b2c3d4e5f6g7h8
   GITHUB_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
   ```

3. **Save the file**

### STEP 4: Verify Setup (30 seconds)

Run the diagnostic tool:
```bash
npm run check-auth
```

You should see:
```
✅ .env.local file exists
✅ NEXTAUTH_URL: http://localhost:3000
✅ NEXTAUTH_SECRET: tK8xVz3j...
✅ GITHUB_ID: Iv1.a1b2...
✅ GITHUB_SECRET: a1b2c3d4...

✨ Configuration looks good!
```

If you see ❌ errors, fix them before continuing.

### STEP 5: Start the App (1 minute)

```bash
npm run dev
```

### STEP 6: Test Authentication (2 minutes)

1. **Open browser**: http://localhost:3000

2. **Navigate to any page**: Try /data-generator or /analyze

3. **Click "Sign in with GitHub"** button in the navigation bar

4. **GitHub Authorization Page**:
   - You'll be redirected to GitHub
   - Click **"Authorize"**

5. **Success!**:
   - You're redirected back to the **same page** you were on
   - Your profile picture and name appear in the navigation bar
   - Click your profile to see the dropdown

## ✅ How to Verify It's Working

### Test 1: Sign In from Different Pages
- Go to `/analyze` → Click "Sign in" → Should return to `/analyze`
- Go to `/data-generator` → Click "Sign in" → Should return to `/data-generator`
- Go to `/table-view` → Click "Sign in" → Should return to `/table-view`

### Test 2: Profile Display
- After signing in, you should see:
  - Your GitHub profile picture (small circle)
  - Your name or email
  - Dropdown menu when clicked

### Test 3: Sign Out
- Click your profile → Click "Sign Out"
- Should redirect to homepage
- "Sign in with GitHub" button appears again

## 🚨 Common Mistakes

### ❌ Mistake 1: Using Placeholder Values
```env
GITHUB_ID=your-github-client-id-here  ← This is WRONG!
```
**Fix**: Replace with actual Client ID from GitHub OAuth app

### ❌ Mistake 2: Wrong Callback URL
```
Callback URL: http://localhost:3000  ← Missing /api/auth/callback/github
```
**Fix**: Use exactly `http://localhost:3000/api/auth/callback/github`

### ❌ Mistake 3: Not Restarting Server
After editing `.env.local`, you MUST restart the dev server:
```bash
# Press Ctrl+C to stop, then:
npm run dev
```

### ❌ Mistake 4: Forgot to Generate Secret
```env
NEXTAUTH_SECRET=your-secret-key-here  ← Placeholder!
```
**Fix**: Run `openssl rand -base64 32` and paste the output

## 🔍 Still Not Working?

### Run Diagnostic
```bash
npm run check-auth
```

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Common errors:
   - "Invalid client" = Wrong GITHUB_ID or GITHUB_SECRET
   - "Redirect URI mismatch" = Wrong callback URL in GitHub OAuth app

### Clear Browser Cache
1. Open DevTools (F12)
2. Application tab → Clear storage
3. Or use Incognito/Private window

### Verify GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click on your "CSV Analyzer" app
3. Verify:
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`

## 📚 Need More Help?

- **Quick Start**: See `QUICK_START_AUTH.md`
- **Detailed Guide**: See `GITHUB_AUTH_SETUP.md`
- **Technical Details**: See `AUTH_IMPLEMENTATION.md`
- **Recent Fix**: See `AUTH_FIX_SUMMARY.md`

## 🎉 Success Looks Like This

```
1. Click "Sign in with GitHub" from /analyze page
2. Redirected to GitHub authorization
3. Click "Authorize"
4. Redirected back to /analyze page (same page!)
5. Profile picture appears in navigation
6. Click profile → See dropdown with email and username
7. Click "Sign Out" → Return to homepage
8. "Sign in with GitHub" button appears again
```

**That's it! Your authentication is working!** 🚀
