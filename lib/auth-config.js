/**
 * Runtime OAuth Configuration Loader
 * 
 * Loads GitHub OAuth credentials from multiple sources in priority order:
 * 1. Runtime environment variables (platform-injected)
 * 2. Encrypted configuration file (for portable deployments)
 * 3. .env files (fallback for local development)
 * 
 * This enables portable deployments without .env file dependencies.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CONFIG_FILE = path.join(process.cwd(), '.auth-config.enc');
const ENCRYPTION_KEY = process.env.AUTH_ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Decrypt configuration data
 */
function decrypt(encryptedData) {
  try {
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (error) {
    console.error('Failed to decrypt configuration:', error.message);
    return null;
  }
}

/**
 * Load configuration from encrypted file
 */
function loadFromConfigFile() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const encrypted = fs.readFileSync(CONFIG_FILE, 'utf8');
      return decrypt(encrypted);
    }
  } catch (error) {
    console.error('Failed to load config file:', error.message);
  }
  return null;
}

/**
 * Get OAuth configuration with fallback chain
 */
export function getOAuthConfig() {
  // Priority 1: Runtime environment variables (Vercel, AWS, Docker, etc.)
  const runtimeConfig = {
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
  };

  // Check if all runtime env vars are available
  if (runtimeConfig.clientId && runtimeConfig.clientSecret && runtimeConfig.nextAuthSecret) {
    return {
      ...runtimeConfig,
      source: 'runtime-env',
    };
  }

  // Priority 2: Encrypted configuration file (portable deployment)
  const fileConfig = loadFromConfigFile();
  if (fileConfig && fileConfig.clientId && fileConfig.clientSecret) {
    return {
      clientId: fileConfig.clientId,
      clientSecret: fileConfig.clientSecret,
      nextAuthUrl: fileConfig.nextAuthUrl || process.env.NEXTAUTH_URL,
      nextAuthSecret: fileConfig.nextAuthSecret || process.env.NEXTAUTH_SECRET,
      source: 'encrypted-file',
    };
  }

  // Priority 3: Environment variables from .env files (local development fallback)
  if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
    return {
      ...runtimeConfig,
      source: 'env-file',
    };
  }

  // No configuration available
  console.warn('⚠️  No OAuth configuration found. Please configure credentials.');
  return {
    clientId: null,
    clientSecret: null,
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    nextAuthSecret: process.env.NEXTAUTH_SECRET || 'development-secret-change-me',
    source: 'missing',
  };
}

/**
 * Validate OAuth configuration
 */
export function validateOAuthConfig(config) {
  const errors = [];

  if (!config.clientId) {
    errors.push('GitHub Client ID is missing');
  }
  
  if (!config.clientSecret) {
    errors.push('GitHub Client Secret is missing');
  }
  
  if (!config.nextAuthSecret || config.nextAuthSecret === 'development-secret-change-me') {
    errors.push('NextAuth Secret is missing or using default value');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: config.source === 'missing' ? ['No OAuth credentials configured'] : [],
  };
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus() {
  const config = getOAuthConfig();
  const validation = validateOAuthConfig(config);
  
  return {
    configured: validation.valid,
    source: config.source,
    hasClientId: !!config.clientId,
    hasClientSecret: !!config.clientSecret,
    hasNextAuthSecret: !!config.nextAuthSecret,
    nextAuthUrl: config.nextAuthUrl,
    errors: validation.errors,
    warnings: validation.warnings,
  };
}
