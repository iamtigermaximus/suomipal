import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/debug — Test connectivity to Neon DB and check env vars
export async function GET(request: NextRequest) {
  const results: Record<string, string> = {};

  // 1. Check environment variables
  results['DATABASE_URL_exists'] = process.env.DATABASE_URL ? 'yes' : 'NO';
  results['DEEPSEEK_API_KEY_exists'] = process.env.DEEPSEEK_API_KEY ? 'yes' : 'NO';
  results['NEXT_PUBLIC_APP_URL'] = process.env.NEXT_PUBLIC_APP_URL || 'NOT SET';

  // Mask the secrets for safe display
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    results['DATABASE_URL_prefix'] = dbUrl.substring(0, 30) + '...';
    results['DATABASE_URL_length'] = String(dbUrl.length);
  }
  if (process.env.DEEPSEEK_API_KEY) {
    const key = process.env.DEEPSEEK_API_KEY;
    results['DEEPSEEK_API_KEY_prefix'] = key.substring(0, 8) + '...';
    results['DEEPSEEK_API_KEY_length'] = String(key.length);
  }

  // 2. Test database connectivity
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as result`;
    const elapsed = Date.now() - start;
    results['db_connect'] = `OK (${elapsed}ms)`;
  } catch (error) {
    results['db_connect'] = `FAILED: ${error instanceof Error ? error.message : String(error)}`;
  }

  // 3. Test DeepSeek API connectivity
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (apiKey) {
      const start = Date.now();
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      const elapsed = Date.now() - start;
      results['deepseek_connect'] = `Status ${response.status} (${elapsed}ms)`;
    } else {
      results['deepseek_connect'] = 'SKIPPED (no API key)';
    }
  } catch (error) {
    results['deepseek_connect'] = `FAILED: ${error instanceof Error ? error.message : String(error)}`;
  }

  return Response.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    results,
  });
}
