# ⚠️ IMPORTANT: GitHub OAuth Setup Required

## Your `.env.local` has placeholder values!

For GitHub OAuth login to work, you MUST:

### 1. Create GitHub OAuth App (2 minutes)

**Click here to start:** https://github.com/settings/developers

Then:
1. Click **"New OAuth App"**
2. Fill in:
   - **Application name**: `CSV Analyzer`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
     
     ⚠️ **MUST BE EXACT**: `http://localhost:3000/api/auth/callback/github`

3. Click **"Register application"**

### 2. Get Your Credentials

On the OAuth app page:
1. Copy the **Client ID** (visible immediately)
2. Click **"Generate a new client secret"**
3. **COPY THE SECRET NOW** - you won't see it again!

### 3. Update `.env.local`

Open `.env.local` and replace:
```env
GITHUB_ID=PASTE_YOUR_CLIENT_ID_HERE     ← Replace with your actual Client ID
GITHUB_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE  ← Replace with your actual Client Secret
```

### 4. Start the App

```bash
npm run dev
```

### 5. Test It!

1. Go to http://localhost:3000
2. Click **"Sign in with GitHub"**
3. You'll be redirected to GitHub
4. Click **"Authorize"**
5. You'll be redirected back to CSV Analyzer - **LOGGED IN!** ✅

---

## Why GitHub OAuth?

- ✅ Real GitHub authentication
- ✅ Automatic profile picture
- ✅ Real name and email
- ✅ Secure and trusted
- ✅ No password management needed

## Quick Helper

Run this to check your setup:
```bash
npm run check-auth
```

Or use the interactive helper:
```bash
./start.sh
```

---

**The app WILL NOT work until you complete these steps!**
