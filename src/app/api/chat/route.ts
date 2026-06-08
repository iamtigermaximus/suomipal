import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { streamChat, type ChatMessage } from '@/lib/deepseek';

// ---------------------------------------------------------------------------
// POST /api/chat — Send a message and stream the AI response
// ---------------------------------------------------------------------------
// Body: { conversationId?: string, message: string, language?: string }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const { conversationId, message, language = 'en' } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Resolve conversation
    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) {
        return Response.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {},
      });
    }

    // 2. Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
        language,
      },
    });

    // 3. Load recent history for context (last 20 messages)
    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const messagesForApi: ChatMessage[] = history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // 4. Stream the AI response
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send the conversationId as the first event
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'meta', conversationId: conversation.id })}\n\n`),
        );

        await streamChat(
          messagesForApi,
          (chunk) => {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`),
            );
          },
          async () => {
            // Streaming done — save assistant message
            try {
              await prisma.message.create({
                data: {
                  conversationId: conversation.id,
                  role: 'assistant',
                  content: fullResponse,
                  language,
                },
              });

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'done', conversationId: conversation.id })}\n\n`),
              );
            } catch (dbError) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'error', message: 'Failed to save response' })}\n\n`,
                ),
              );
            }

            controller.close();
          },
          (error) => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`,
              ),
            );
            controller.close();
          },
        );
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('POST /api/chat error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/chat — Get conversation history
// ---------------------------------------------------------------------------
// Query: ?conversationId=xxx
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return Response.json({ error: 'conversationId query parameter is required' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return Response.json({
      conversationId: conversation.id,
      userId: conversation.userId,
      createdAt: conversation.createdAt,
      messages: conversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        language: msg.language,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/chat error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT /api/chat — Link an anonymous conversation to a user
// ---------------------------------------------------------------------------
// Body: { conversationId: string, userId: string }
// ---------------------------------------------------------------------------
export async function PUT(request: NextRequest) {
  try {
    const { conversationId, userId } = await request.json();

    if (!conversationId || !userId) {
      return Response.json({ error: 'conversationId and userId are required' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.userId) {
      return Response.json({ error: 'Conversation is already linked to a user' }, { status: 409 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { userId },
    });

    return Response.json({
      conversationId: updated.id,
      userId: updated.userId,
    });
  } catch (error) {
    console.error('PUT /api/chat error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
