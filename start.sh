#!/bin/bash

echo ""
echo "================================================"
echo "  🚀 CSV Analyzer - GitHub OAuth Setup"
echo "================================================"
echo ""

# Check if credentials are set
if grep -q "PASTE_YOUR_CLIENT_ID_HERE" .env.local 2>/dev/null; then
    echo "⚠️  GitHub OAuth is NOT configured yet!"
    echo ""
    echo "📋 Quick Setup (2 minutes):"
    echo ""
    echo "1️⃣  I'll open GitHub OAuth Apps page for you..."
    echo "2️⃣  Click 'New OAuth App'"
    echo "3️⃣  Fill in:"
    echo "    • Application name: CSV Analyzer"
    echo "    • Homepage URL: http://localhost:3000"
    echo "    • Callback URL: http://localhost:3000/api/auth/callback/github"
    echo ""
    echo "4️⃣  After creating:"
    echo "    • Copy the Client ID"
    echo "    • Generate and copy Client Secret"
    echo ""
    echo "5️⃣  Update .env.local with your credentials"
    echo ""
    
    read -p "Ready to open GitHub? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Opening GitHub OAuth Apps..."
        open "https://github.com/settings/developers" 2>/dev/null || \
        xdg-open "https://github.com/settings/developers" 2>/dev/null || \
        echo "Please open: https://github.com/settings/developers"
        echo ""
        echo "After you create the OAuth app:"
        echo "1. Open .env.local in your editor"
        echo "2. Replace PASTE_YOUR_CLIENT_ID_HERE with your Client ID"
        echo "3. Replace PASTE_YOUR_CLIENT_SECRET_HERE with your Client Secret"
        echo "4. Save the file"
        echo "5. Run: npm run dev"
        echo ""
    fi
    exit 1
fi

echo "✅ GitHub OAuth is configured!"
echo ""
echo "Starting development server..."
echo ""
npm run dev
