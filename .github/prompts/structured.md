Goal:
Implement portable GitHub OAuth authentication for CSV Analyzer that works across different environments without relying on .env files

Context:
- Current implementation uses NextAuth.js with GitHub provider
- Credentials stored in .env.local (GITHUB_ID, GITHUB_SECRET, NEXTAUTH_SECRET)
- User wants a portable solution that works in development, production, and different deployment environments
- OAuth credentials should be configurable at runtime, not build time
- Must maintain security best practices

Requirements:
1. GitHub OAuth flow: Sign in with GitHub → Authorize → Redirect back logged in
2. Runtime configuration without .env dependency
3. Secure credential management (no hardcoded secrets in code)
4. Support for multiple environments (development, production, Docker, cloud platforms)
5. Session management with NextAuth.js
6. User profile display after authentication
7. Works with Next.js 16.0.7 App Router
8. PKCE (Proof Key for Code Exchange) for enhanced security
9. Environment variable fallback for compatibility
10. Configuration UI or setup script for easy deployment

Constraints:
- Must not expose secrets in client-side code
- Must work without .env files (portable across environments)
- Should support standard OAuth 2.0 callback URLs
- Cannot use NEXT_PUBLIC_ prefix for secrets (security risk)
- Must handle missing configuration gracefully
- Should work in serverless environments (Vercel, AWS Lambda, etc.)

Output Format:
- Updated NextAuth configuration with runtime environment support
- Configuration management system (API-based or build-time injection)
- Secure secrets storage mechanism
- Documentation for deployment in various environments
- Migration guide from current .env-based approach

Checks:
✓ GitHub OAuth credentials never exposed to browser
✓ Works in Docker containers without .env files
✓ Works on cloud platforms (Vercel, Netlify, AWS, etc.)
✓ Supports local development with minimal setup
✓ No secrets committed to git repository
✓ Session persistence across deployments
✓ CSRF protection with state parameter
✓ Proper error handling for missing credentials
✓ Compatible with Next.js runtime environment variables
✓ Documentation includes security best practices