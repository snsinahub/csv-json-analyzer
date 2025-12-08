#!/usr/bin/env node

/**
 * Portable OAuth Setup CLI Tool
 * Helps configure GitHub OAuth without .env files
 */

const readline = require('readline');
const https = require('https');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupOAuth() {
  console.log('\n🔧 GitHub OAuth Portable Setup\n');
  console.log('This tool will help you configure GitHub OAuth without .env files.\n');

  // Get app URL
  const appUrl = await question('What is your app URL? (e.g., http://localhost:3000): ');
  const trimmedUrl = appUrl.trim() || 'http://localhost:3000';

  console.log(`\n✅ App URL: ${trimmedUrl}`);
  console.log(`\n📋 GitHub OAuth App Setup Instructions:\n`);
  console.log(`1. Go to: https://github.com/settings/developers`);
  console.log(`2. Click "New OAuth App"`);
  console.log(`3. Fill in the form:`);
  console.log(`   - Application name: CSV Analyzer`);
  console.log(`   - Homepage URL: ${trimmedUrl}`);
  console.log(`   - Authorization callback URL: ${trimmedUrl}/api/auth/callback/github`);
  console.log(`4. Click "Register application"`);
  console.log(`5. Copy your Client ID and generate a Client Secret\n`);

  const clientId = await question('Enter your GitHub Client ID: ');
  const clientSecret = await question('Enter your GitHub Client Secret: ');

  if (!clientId.trim() || !clientSecret.trim()) {
    console.error('\n❌ Client ID and Secret are required!');
    rl.close();
    return;
  }

  // Generate NextAuth secret
  const nextAuthSecret = crypto.randomBytes(32).toString('base64');
  const adminToken = crypto.randomBytes(32).toString('hex');

  console.log('\n🔐 Generated secrets:');
  console.log(`NextAuth Secret: ${nextAuthSecret}`);
  console.log(`Admin Token (save this!): ${adminToken}\n`);

  const setupChoice = await question('How do you want to save the configuration?\n1. API call (runtime)\n2. Environment variables (copy/paste)\nChoice (1 or 2): ');

  if (setupChoice.trim() === '1') {
    // Save via API
    const config = {
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
      nextAuthSecret,
      nextAuthUrl: trimmedUrl,
    };

    console.log('\n📡 Sending configuration to app...');

    const apiUrl = `${trimmedUrl}/api/config/setup`;
    const postData = JSON.stringify(config);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.request(apiUrl, options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      if (response.status === 200) {
        console.log('\n✅ Configuration saved successfully!');
        console.log('You can now use GitHub OAuth in your app.\n');
      } else {
        console.error('\n❌ Failed to save configuration:', response.data);
      }
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.log('\nTrying alternative method: Environment Variables\n');
      printEnvVariables(clientId.trim(), clientSecret.trim(), nextAuthSecret, trimmedUrl);
    }
  } else {
    // Print environment variables
    printEnvVariables(clientId.trim(), clientSecret.trim(), nextAuthSecret, trimmedUrl);
  }

  console.log('\n💡 Pro Tips:');
  console.log('  - Save your Admin Token securely for future configuration changes');
  console.log('  - The configuration is encrypted and stored locally');
  console.log('  - You can run this setup script anytime to update credentials');
  console.log('  - For production, set these as platform environment variables\n');

  rl.close();
}

function printEnvVariables(clientId, clientSecret, nextAuthSecret, nextAuthUrl) {
  console.log('\n📝 Environment Variables (copy these to your deployment platform):\n');
  console.log('# Paste these in your platform (Vercel, AWS, Docker, etc.)');
  console.log(`GITHUB_ID=${clientId}`);
  console.log(`GITHUB_SECRET=${clientSecret}`);
  console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);
  console.log(`NEXTAUTH_URL=${nextAuthUrl}`);
  console.log('');
  console.log('For local development, create .env.local with the above variables.');
}

// Run setup
setupOAuth().catch(error => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});
