const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are SuomiPal, an AI customer support assistant for Finnish small businesses. Your primary goals:

1. **Language detection**: Detect whether the user is writing in Finnish, Swedish, or English. Always respond in the same language the user wrote in.
2. **Tone**: Be friendly, professional, and concise. Keep responses under 150 words when possible.
3. **Scope**: Help with common customer service inquiries — product questions, order status, returns, pricing, business hours, and general company info.
4. **Honesty**: If you don't know an answer, say so clearly. Never invent specific details like prices, inventory, or policies — suggest the user contact the business directly for those.
5. **Privacy**: Never ask for or store sensitive personal information (passwords, credit card numbers, personal IDs).`;

export function buildSystemPrompt(): ChatMessage {
  return {
    role: 'system',
    content: SYSTEM_PROMPT,
  };
}

export async function streamChat(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
): Promise<void> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    onError(new Error('DEEPSEEK_API_KEY is not configured'));
    return;
  }

  const systemMessage = buildSystemPrompt();
  const allMessages = [systemMessage, ...messages.filter((m) => m.role !== 'system')];

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: allMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      onError(new Error(`DeepSeek API error: ${response.status} ${errorText}`));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError(new Error('Response body is not readable'));
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error during streaming'));
  }
}

export async function generateResponse(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  const systemMessage = buildSystemPrompt();
  const allMessages = [systemMessage, ...messages.filter((m) => m.role !== 'system')];

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: allMessages,
      stream: false,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
