# GitHub OAuth Setup Guide

This guide will help you set up GitHub OAuth authentication for the CSV Analyzer application.

## Why GitHub Authentication?

While the CSV Analyzer works perfectly without authentication, signing in with GitHub provides:
- Personalized user experience
- User profile display in the navigation bar
- Future features like saving preferences and schemas to your account

## Setup Steps

### 1. Create a GitHub OAuth Application

1. Go to your GitHub account settings:
   - Navigate to https://github.com/settings/developers
   - Or: Click your profile picture → Settings → Developer settings (bottom left)

2. Click on "OAuth Apps" in the left sidebar

3. Click "New OAuth App" button

4. Fill in the application details:
   - **Application name**: `CSV Analyzer` (or any name you prefer)
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: (optional) `CSV analysis and data generation tool`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
   
   **Important**: The callback URL must be exact, including the `/api/auth/callback/github` path

5. Click "Register application"

6. You'll see your new OAuth app page with:
   - **Client ID** - Copy this
   - **Client Secret** - Click "Generate a new client secret" and copy it
   
   **Security Note**: Keep your Client Secret private and never commit it to version control

### 2. Configure Environment Variables

1. In your project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Generate a secure secret for NextAuth:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output - you'll need it in the next step

3. Edit `.env.local` and replace the placeholder values:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=paste-the-secret-you-generated-above
   GITHUB_ID=paste-your-github-client-id
   GITHUB_SECRET=paste-your-github-client-secret
   ```

4. Save the file

**Important**: The `.env.local` file is already in `.gitignore` and will not be committed to git

### 3. Start the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to http://localhost:3000

3. You should see a "Sign in with GitHub" button in the navigation bar

### 4. Test the Authentication

1. Click "Sign in with GitHub"
2. GitHub will ask you to authorize the application
3. Click "Authorize" 
4. You'll be redirected back to the app, now signed in
5. You should see your GitHub profile picture and name in the navigation bar
6. Click on your profile to see the dropdown menu with sign out option

## Production Deployment

When deploying to production (e.g., Vercel, Netlify):

1. Create a new GitHub OAuth App for production with:
   - **Homepage URL**: `https://your-production-domain.com`
   - **Authorization callback URL**: `https://your-production-domain.com/api/auth/callback/github`

2. Add environment variables to your hosting platform:
   - `NEXTAUTH_URL=https://your-production-domain.com`
   - `NEXTAUTH_SECRET=your-production-secret`
   - `GITHUB_ID=your-production-client-id`
   - `GITHUB_SECRET=your-production-client-secret`

## Troubleshooting

### "Error: Missing environment variables"
- Check that `.env.local` exists and has all 4 required variables
- Restart the dev server after adding environment variables

### "OAuthCallback Error"
- Verify the callback URL in GitHub OAuth app matches exactly: `http://localhost:3000/api/auth/callback/github`
- Check that NEXTAUTH_URL in `.env.local` is `http://localhost:3000`

### "Invalid client secret"
- Regenerate the client secret in GitHub OAuth app settings
- Update GITHUB_SECRET in `.env.local`
- Restart the dev server

### Sign in button doesn't appear
- Check browser console for errors
- Ensure NextAuth.js is installed: `npm install next-auth`
- Clear browser cache and cookies

## Optional: Disable Authentication

If you want to run the app without authentication:

1. Simply don't create the `.env.local` file
2. The app will work normally, just without the sign-in option
3. All CSV analysis and generation features work without authentication

## Security Best Practices

1. ✅ Never commit `.env.local` to version control
2. ✅ Use different OAuth apps for development and production
3. ✅ Regenerate secrets if they're accidentally exposed
4. ✅ Use a strong random value for NEXTAUTH_SECRET
5. ✅ Keep your GitHub Client Secret private

## Need Help?

If you encounter issues:
- Check the [NextAuth.js documentation](https://next-auth.js.org/)
- Review [GitHub OAuth documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- Create an issue on the CSV Analyzer repository
