import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { getOAuthConfig, validateOAuthConfig } from "@/lib/auth-config";

// Load configuration from runtime environment, encrypted file, or .env fallback
const config = getOAuthConfig();
const validation = validateOAuthConfig(config);

// Log configuration status (without exposing secrets)
console.log('🔧 OAuth Configuration Source:', config.source);
if (!validation.valid) {
  console.error('❌ OAuth Configuration Errors:', validation.errors);
}
if (validation.warnings.length > 0) {
  console.warn('⚠️  OAuth Configuration Warnings:', validation.warnings);
}

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: config.clientId || '',
      clientSecret: config.clientSecret || '',
      authorization: {
        params: {
          scope: 'read:user user:email',
          // PKCE support for enhanced security
          code_challenge_method: 'S256',
        }
      },
      // Enable PKCE (Proof Key for Code Exchange)
      checks: ['pkce', 'state'],
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback:', { url, baseUrl });
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      console.log('👤 Session callback');
      // Add user ID and GitHub username to session
      if (token) {
        session.user.id = token.sub;
        session.user.username = token.login;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        console.log('🔑 JWT callback - New sign in');
        token.login = profile.login;
        token.accessToken = account.access_token;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // Block sign-in if OAuth is not properly configured
      if (!validation.valid) {
        console.error('❌ Sign-in blocked: OAuth not configured');
        return false;
      }
      console.log('✅ Sign in callback - User:', user.email);
      return true;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: config.nextAuthSecret,
  // Runtime environment variable support
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

export { handler as GET, handler as POST };

