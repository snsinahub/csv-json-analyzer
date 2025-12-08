/**
 * OAuth Setup API
 * Allows runtime configuration of OAuth credentials
 * SECURITY: This endpoint should be protected in production!
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CONFIG_FILE = path.join(process.cwd(), '.auth-config.enc');

/**
 * Encrypt configuration data
 */
function encrypt(data) {
  const ENCRYPTION_KEY = process.env.AUTH_ENCRYPTION_KEY || 'default-key-change-in-production';
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * POST /api/config/setup
 * Set OAuth configuration at runtime
 * 
 * Body:
 * {
 *   "clientId": "github_client_id",
 *   "clientSecret": "github_client_secret",
 *   "nextAuthSecret": "nextauth_secret",
 *   "nextAuthUrl": "http://localhost:3000"
 * }
 */
export async function POST(request) {
  try {
    // SECURITY: In production, add authentication check here!
    // Only allow this endpoint in development or with admin authentication
    const isDevelopment = process.env.NODE_ENV === 'development';
    const adminToken = request.headers.get('x-admin-token');
    
    if (!isDevelopment && adminToken !== process.env.ADMIN_SETUP_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized. This endpoint requires admin access.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clientId, clientSecret, nextAuthSecret, nextAuthUrl } = body;

    // Validate required fields
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId and clientSecret' },
        { status: 400 }
      );
    }

    // Create configuration object
    const config = {
      clientId,
      clientSecret,
      nextAuthSecret: nextAuthSecret || crypto.randomBytes(32).toString('base64'),
      nextAuthUrl: nextAuthUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000',
      updatedAt: new Date().toISOString(),
    };

    // Encrypt and save configuration
    const encrypted = encrypt(config);
    fs.writeFileSync(CONFIG_FILE, encrypted, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'OAuth configuration saved successfully',
      nextAuthUrl: config.nextAuthUrl,
      callbackUrl: `${config.nextAuthUrl}/api/auth/callback/github`,
    });
  } catch (error) {
    console.error('Setup API error:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/config/setup
 * Get setup instructions
 */
export async function GET() {
  return NextResponse.json({
    message: 'OAuth Setup API',
    instructions: {
      step1: 'Create a GitHub OAuth App at https://github.com/settings/developers',
      step2: 'Set the callback URL to: [YOUR_APP_URL]/api/auth/callback/github',
      step3: 'POST your credentials to this endpoint with clientId and clientSecret',
      step4: 'Include x-admin-token header if in production mode',
    },
    example: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'your-admin-token-if-production',
      },
      body: {
        clientId: 'your_github_client_id',
        clientSecret: 'your_github_client_secret',
        nextAuthSecret: 'optional_custom_secret',
        nextAuthUrl: 'https://your-domain.com',
      },
    },
  });
}
