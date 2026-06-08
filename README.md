# SuomiPal

**Bilingual AI customer support chatbot for Finnish small businesses.**

Your customers speak Finnish, Swedish, or English. So does SuomiPal.

## Features

- **Auto-detects language** — Users write in fi/sv/en, the AI responds in the same language
- **Real-time streaming** — Responses appear word-by-word via Server-Sent Events
- **No signup required to start** — Click "Start free trial" and chat immediately
- **Conversion path** — After 3 messages, prompted to save the conversation with just an email
- **Conversation history** — Messages persisted to PostgreSQL, linkable to user accounts
- **3-tier pricing** — Free, Pro (€29/mo), Business (€99/mo)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Styled Components |
| Database | PostgreSQL via Neon |
| ORM | Prisma |
| AI | DeepSeek API |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- DeepSeek API key

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/suomipal.git
cd suomipal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and DEEPSEEK_API_KEY

# Run database migrations
npx prisma migrate deploy

# Start the dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `DEEPSEEK_API_KEY` | DeepSeek API key |
| `NEXT_PUBLIC_APP_URL` | Application URL |

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Send a message, stream AI response via SSE |
| GET | `/api/chat?conversationId=xxx` | Get conversation history |
| PUT | `/api/chat` | Link conversation to a user |
| POST | `/api/signup` | Create user by email |

## Deployment

Deploy to Vercel with zero configuration:

```bash
npx vercel --prod
```

Set the three environment variables in the Vercel dashboard.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts     # Chat API (POST, GET, PUT)
│   │   └── signup/route.ts   # Signup API
│   ├── layout.tsx            # Root layout with theme
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/
│   ├── Hero.tsx              # Hero section with CTA
│   ├── Chat.tsx              # Chat widget with streaming
│   └── Footer.tsx            # Footer with pricing
└── lib/
    ├── theme.ts              # Design tokens
    ├── ThemeProvider.tsx      # Theme context
    ├── registry.tsx           # styled-components SSR
    ├── prisma.ts             # Prisma client
    └── deepseek.ts           # DeepSeek API client
```

## License

MIT
