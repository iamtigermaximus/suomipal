import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// POST /api/signup — Create a user with email, optionally link conversation
// ---------------------------------------------------------------------------
// Body: { email: string, conversationId?: string }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const { email, conversationId } = await request.json();

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes('@')) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { email: normalizedEmail },
      });
    }

    // Link conversation if provided
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (conversation && !conversation.userId) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { userId: user.id },
        });
      }
    }

    return Response.json({
      userId: user.id,
      email: user.email,
      isExisting: !!user,
    });
  } catch (error) {
    console.error('POST /api/signup error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
