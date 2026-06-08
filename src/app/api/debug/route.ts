import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/debug — Test connectivity to Neon DB and DeepSeek API
export async function GET(request: NextRequest) {
  // Block in production — this endpoint exposes internal state
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const results: Record<string, string> = {};

  // 1. Check environment variables (existence only — no prefixes)
  results['DATABASE_URL_exists'] = process.env.DATABASE_URL ? 'yes' : 'NO';
  results['DEEPSEEK_API_KEY_exists'] = process.env.DEEPSEEK_API_KEY ? 'yes' : 'NO';
  results['NEXT_PUBLIC_APP_URL'] = process.env.NEXT_PUBLIC_APP_URL || 'NOT SET';

  if (process.env.DATABASE_URL) {
    results['DATABASE_URL_length'] = String(process.env.DATABASE_URL.length);
  }
  if (process.env.DEEPSEEK_API_KEY) {
    results['DEEPSEEK_API_KEY_length'] = String(process.env.DEEPSEEK_API_KEY.length);
  }

  // 2. Test database connectivity
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as result`;
    const elapsed = Date.now() - start;
    results['db_connect'] = `OK (${elapsed}ms)`;
  } catch (error) {
    console.error('DB connectivity test failed:', error);
    results['db_connect'] = 'FAILED';
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
    console.error('DeepSeek connectivity test failed:', error);
    results['deepseek_connect'] = 'FAILED';
  }

  return Response.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    results,
  });
}
