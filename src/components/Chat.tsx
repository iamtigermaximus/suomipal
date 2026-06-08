'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChatOverlay,
  ChatHeader,
  ChatHeaderTitle,
  ChatHeaderClose,
  MessagesContainer,
  MessageRow,
  MessageBubble,
  LoadingDots,
  LoadingDot,
  InputContainer,
  Input,
  SendButton,
  SignupPrompt,
  SignupPromptText,
  SignupButton,
  ModalOverlay,
  ModalCard,
  ModalTitle,
  ModalText,
  EmailInput,
  ModalSubmit,
  ModalCancel,
} from './Chat.styles';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chat({ isOpen, onClose }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signedUpUserId, setSignedUpUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when the chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Reset state when chat opens fresh
  useEffect(() => {
    if (isOpen && messages.length === 0 && !conversationId) {
      setShowSignupPrompt(false);
    }
  }, [isOpen, messages.length, conversationId]);

  // Detect language from message content
  function detectLanguage(text: string): string {
    const fiPattern = /[äöå]/i;
    const svPattern = /[åäö]/i;
    const commonFiWords = /\b(ja|on|se|ei|mutta|että|tämä|hän|mitä|siitä|voin|voida|ole|ovat)\b/i;
    const commonSvWords = /\b(och|är|det|inte|men|att|detta|han|vad|kan|skall|skola)\b/i;

    if (fiPattern.test(text) || commonFiWords.test(text)) return 'fi';
    if (svPattern.test(text) || commonSvWords.test(text)) return 'sv';
    return 'en';
  }

  // Send a message and handle SSE streaming
  async function handleSend() {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setInputValue('');
    const language = detectLanguage(text);

    // Add user message to UI immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: text,
          language,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let newConversationId = conversationId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));

            if (data.type === 'meta') {
              newConversationId = data.conversationId;
              setConversationId(data.conversationId);
            } else if (data.type === 'chunk') {
              fullContent += data.content;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId ? { ...msg, content: fullContent } : msg,
                ),
              );
            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      // Update final content
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content: fullContent } : msg,
        ),
      );
    } catch (error) {
      // Update the assistant message with an error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: 'Sorry, something went wrong. Please try again.' }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Enter key in input
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Check after each user message whether to show signup prompt
  useEffect(() => {
    const userMessageCount = messages.filter((m) => m.role === 'user').length;
    if (userMessageCount >= 3 && !signedUpUserId && !showSignupPrompt) {
      setShowSignupPrompt(true);
    }
  }, [messages, signedUpUserId, showSignupPrompt]);

  // Handle signup modal
  function handleOpenSignup() {
    setShowSignupModal(true);
    setEmailValue('');
  }

  function handleCloseSignup() {
    setShowSignupModal(false);
    setEmailValue('');
  }

  async function handleSignupSubmit() {
    if (!emailValue.trim() || !emailValue.includes('@') || isSigningUp) return;

    setIsSigningUp(true);
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailValue.trim(),
          conversationId,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Signup failed');
      }

      const data = await response.json();
      setSignedUpUserId(data.userId);
      setShowSignupModal(false);
      setShowSignupPrompt(false);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  }

  return (
    <>
      <ChatOverlay $isOpen={isOpen}>
        <ChatHeader>
          <ChatHeaderTitle>SuomiPal</ChatHeaderTitle>
          <ChatHeaderClose onClick={onClose}>&times;</ChatHeaderClose>
        </ChatHeader>

        <MessagesContainer>
          {messages.length === 0 && !isLoading && (
            <MessageRow $role="assistant">
              <MessageBubble $role="assistant">
                Hello! I&apos;m SuomiPal. Ask me anything — I speak Finnish, Swedish, and English.
              </MessageBubble>
            </MessageRow>
          )}

          {messages.map((msg) => (
            <MessageRow key={msg.id} $role={msg.role}>
              <MessageBubble $role={msg.role}>{msg.content}</MessageBubble>
            </MessageRow>
          ))}

          {isLoading && messages[messages.length - 1]?.content === '' && (
            <MessageRow $role="assistant">
              <MessageBubble $role="assistant">
                <LoadingDots>
                  <LoadingDot $delay={0} />
                  <LoadingDot $delay={0.2} />
                  <LoadingDot $delay={0.4} />
                </LoadingDots>
              </MessageBubble>
            </MessageRow>
          )}

          {showSignupPrompt && (
            <SignupPrompt>
              <SignupPromptText>
                Sign up to save this conversation and continue where you left off later.
              </SignupPromptText>
              <SignupButton onClick={handleOpenSignup}>
                Sign up with email
              </SignupButton>
            </SignupPrompt>
          )}

          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <SendButton $disabled={!inputValue.trim() || isLoading} onClick={handleSend}>
            Send
          </SendButton>
        </InputContainer>
      </ChatOverlay>

      {/* Signup Modal */}
      <ModalOverlay $isOpen={showSignupModal}>
        <ModalCard>
          <ModalTitle>Save your chat</ModalTitle>
          <ModalText>
            Enter your email to save this conversation and pick up where you left off.
          </ModalText>
          <EmailInput
            type="email"
            placeholder="your@email.com"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSignupSubmit();
            }}
          />
          <ModalSubmit onClick={handleSignupSubmit} disabled={isSigningUp}>
            {isSigningUp ? 'Signing up...' : 'Sign up'}
          </ModalSubmit>
          <ModalCancel onClick={handleCloseSignup}>Not now</ModalCancel>
        </ModalCard>
      </ModalOverlay>
    </>
  );
}
