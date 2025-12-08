/**
 * Configuration API Routes
 * Provides endpoints for checking and setting up OAuth configuration
 */

import { NextResponse } from 'next/server';
import { getConfigStatus } from '@/lib/auth-config';

export async function GET(request) {
  const status = getConfigStatus();
  
  return NextResponse.json({
    configured: status.configured,
    source: status.source,
    hasClientId: status.hasClientId,
    hasClientSecret: status.hasClientSecret,
    hasNextAuthSecret: status.hasNextAuthSecret,
    nextAuthUrl: status.nextAuthUrl,
    errors: status.errors,
    warnings: status.warnings,
  });
}
