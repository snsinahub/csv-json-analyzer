#!/usr/bin/env node

/**
 * GitHub OAuth Setup Diagnostic Tool
 * Run this to verify your authentication configuration
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 CSV Analyzer - GitHub OAuth Diagnostics\n');
console.log('='.repeat(50));

const envPath = path.join(__dirname, '..', '.env.local');
const errors = [];
const warnings = [];
const success = [];

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  errors.push('❌ .env.local file not found');
  console.log('\n❌ CRITICAL: .env.local file does not exist');
  console.log('\n💡 To fix:');
  console.log('   cp .env.local.example .env.local');
  console.log('   Then edit .env.local with your GitHub OAuth credentials\n');
  process.exit(1);
}

success.push('✅ .env.local file exists');

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Check required variables
const required = ['NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'GITHUB_ID', 'GITHUB_SECRET'];
const placeholders = [
  'your-client-id', 
  'your-github-client-id',
  'your-client-id-here',
  'your-github-client-id-here',
  'your-client-secret',
  'your-github-client-secret',
  'your-github-client-secret-here',
  'replace-with-your-secret',
  'your-secret-key-here',
  'please-generate-a-secret-with-openssl-rand-base64-32'
];

console.log('\n📋 Environment Variables Check:\n');

required.forEach(varName => {
  if (!envVars[varName]) {
    errors.push(`❌ ${varName} is missing`);
    console.log(`   ❌ ${varName}: NOT SET`);
  } else if (placeholders.some(p => envVars[varName].toLowerCase().includes(p.toLowerCase()))) {
    errors.push(`❌ ${varName} contains placeholder value`);
    console.log(`   ❌ ${varName}: PLACEHOLDER (needs real value)`);
  } else {
    success.push(`✅ ${varName} is configured`);
    const displayValue = varName.includes('SECRET') 
      ? `${envVars[varName].substring(0, 8)}...` 
      : envVars[varName];
    console.log(`   ✅ ${varName}: ${displayValue}`);
  }
});

// Check NEXTAUTH_URL format
if (envVars.NEXTAUTH_URL && !envVars.NEXTAUTH_URL.startsWith('http')) {
  errors.push('❌ NEXTAUTH_URL must start with http:// or https://');
}

// Check for localhost in production
if (envVars.NEXTAUTH_URL && envVars.NEXTAUTH_URL.includes('localhost')) {
  warnings.push('⚠️  NEXTAUTH_URL uses localhost (fine for development)');
}

// Check NEXTAUTH_SECRET length
if (envVars.NEXTAUTH_SECRET && envVars.NEXTAUTH_SECRET.length < 32) {
  warnings.push('⚠️  NEXTAUTH_SECRET is shorter than recommended (32+ chars)');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:\n');

if (success.length > 0) {
  console.log('✅ Success:');
  success.forEach(msg => console.log(`   ${msg}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(msg => console.log(`   ${msg}`));
}

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach(msg => console.log(`   ${msg}`));
  console.log('\n💡 To fix these errors:\n');
  console.log('1. Go to https://github.com/settings/developers');
  console.log('2. Create a new OAuth App:');
  console.log('   - Application name: CSV Analyzer');
  console.log('   - Homepage URL: http://localhost:3000');
  console.log('   - Callback URL: http://localhost:3000/api/auth/callback/github');
  console.log('3. Copy the Client ID and generate a Client Secret');
  console.log('4. Generate NEXTAUTH_SECRET: openssl rand -base64 32');
  console.log('5. Edit .env.local with your actual values');
  console.log('6. Restart the dev server: npm run dev\n');
  process.exit(1);
} else {
  console.log('\n✨ Configuration looks good!');
  console.log('\n🚀 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Open: http://localhost:3000');
  console.log('   3. Click "Sign in with GitHub"');
  console.log('   4. Authorize the app');
  console.log('   5. You should be redirected back and see your profile!\n');
  process.exit(0);
}
