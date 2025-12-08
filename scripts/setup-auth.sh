#!/bin/bash

echo ""
echo "=========================================="
echo "  GitHub OAuth Setup Helper"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found!"
    echo ""
    echo "Creating .env.local from example..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
    echo ""
fi

# Check for placeholder values
if grep -q "your-github-client-id-here" .env.local || grep -q "please-generate-a-secret" .env.local; then
    echo "⚠️  WARNING: .env.local contains placeholder values!"
    echo ""
    echo "You MUST replace these with real values:"
    echo ""
    echo "1️⃣  Create GitHub OAuth App:"
    echo "   → Go to: https://github.com/settings/developers"
    echo "   → Click: 'New OAuth App'"
    echo "   → Fill in:"
    echo "      Application name: CSV Analyzer"
    echo "      Homepage URL: http://localhost:3000"
    echo "      Callback URL: http://localhost:3000/api/auth/callback/github"
    echo ""
    echo "   ⚠️  CRITICAL: The callback URL MUST be exactly:"
    echo "      http://localhost:3000/api/auth/callback/github"
    echo ""
    echo "   → Copy your Client ID"
    echo "   → Generate and copy Client Secret"
    echo ""
    echo "2️⃣  Generate NEXTAUTH_SECRET:"
    echo "   → Run: openssl rand -base64 32"
    echo ""
    
    # Offer to generate secret now
    echo "Would you like me to generate NEXTAUTH_SECRET now? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        SECRET=$(openssl rand -base64 32)
        echo ""
        echo "Generated secret:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "$SECRET"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Copy this and paste it into .env.local for NEXTAUTH_SECRET"
        echo ""
    fi
    
    echo "3️⃣  Edit .env.local:"
    echo "   → Replace GITHUB_ID with your Client ID"
    echo "   → Replace GITHUB_SECRET with your Client Secret"
    echo "   → Replace NEXTAUTH_SECRET with generated secret"
    echo ""
    echo "4️⃣  After updating .env.local:"
    echo "   → Restart dev server: npm run dev"
    echo "   → Run verification: npm run check-auth"
    echo ""
    exit 1
fi

echo "✅ .env.local appears to be configured"
echo ""
echo "Running full diagnostic..."
echo ""
node scripts/check-auth-setup.js
