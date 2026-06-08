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
  SignupPromptDismiss,
  ModalOverlay,
  ModalCard,
  ModalTitle,
  ModalText,
  EmailInput,
  ModalSubmit,
  ModalCancel,
  ModalError,
  ModalSuccessIcon,
  ModalSuccessTitle,
  ModalSuccessText,
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

const SIGNUP_THRESHOLD = 3;

export default function Chat({ isOpen, onClose }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Conversion path state
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupPromptDismissed, setSignupPromptDismissed] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupStep, setSignupStep] = useState<'form' | 'success'>('form');
  const [emailValue, setEmailValue] = useState('');
  const [emailError, setEmailError] = useState('');
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

  // Reset transient state when chat opens fresh
  useEffect(() => {
    if (isOpen && messages.length === 0 && !conversationId) {
      setSignupSuccess(false);
    }
  }, [isOpen, messages.length, conversationId]);

  // Detect language from message content
  function detectLanguage(text: string): string {
    const fiPattern = /[äöå]/i;
    const svPattern = /[åäö]/i;
    const commonFiWords =
      /\b(ja|on|se|ei|mutta|että|tämä|hän|mitä|siitä|voin|voida|ole|ovat)\b/i;
    const commonSvWords =
      /\b(och|är|det|inte|men|att|detta|han|vad|kan|skall|skola)\b/i;

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

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

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
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

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

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content: fullContent } : msg,
        ),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: errorMessage }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // -----------------------------------------------------------------------
  // Conversion path
  // -----------------------------------------------------------------------

  // Show signup prompt after 3 user messages
  useEffect(() => {
    const userMessageCount = messages.filter((m) => m.role === 'user').length;
    if (
      userMessageCount >= SIGNUP_THRESHOLD &&
      !signedUpUserId &&
      !showSignupPrompt &&
      !signupPromptDismissed
    ) {
      setShowSignupPrompt(true);
    }
  }, [messages, signedUpUserId, showSignupPrompt, signupPromptDismissed]);

  function handleDismissPrompt() {
    setShowSignupPrompt(false);
    setSignupPromptDismissed(true);
  }

  function handleOpenSignup() {
    setShowSignupModal(true);
    setSignupStep('form');
    setEmailValue('');
    setEmailError('');
  }

  function handleCloseSignup() {
    setShowSignupModal(false);
    setEmailValue('');
    setEmailError('');
  }

  function validateEmail(email: string): string | null {
    if (!email.trim()) return 'Please enter your email address.';
    if (!email.includes('@')) return 'Please enter a valid email address.';
    const parts = email.split('@');
    if (parts[1].indexOf('.') === -1) return 'Please enter a valid email address.';
    return null;
  }

  async function handleSignupSubmit() {
    const error = validateEmail(emailValue);
    if (error) {
      setEmailError(error);
      return;
    }

    setIsSigningUp(true);
    setEmailError('');

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
      setSignupStep('success');
    } catch {
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  }

  function handleCloseSuccess() {
    setShowSignupModal(false);
    setShowSignupPrompt(false);
    setSignupSuccess(true);
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
                Hello! I&apos;m SuomiPal. Ask me anything — I speak Finnish,
                Swedish, and English.
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

          {/* Signup success message shown in chat */}
          {signupSuccess && (
            <MessageRow $role="assistant">
              <MessageBubble $role="assistant">
                You&apos;re all set! This conversation is saved and you can
                continue anytime. Just message us and we&apos;ll pick up right
                where we left off.
              </MessageBubble>
            </MessageRow>
          )}

          {/* Signup prompt card */}
          {showSignupPrompt && (
            <SignupPrompt>
              <SignupPromptText>
                Sign up to save this conversation and continue where you left
                off later.
              </SignupPromptText>
              <SignupButton onClick={handleOpenSignup}>
                Sign up with email
              </SignupButton>
              <SignupPromptDismiss onClick={handleDismissPrompt}>
                Not now
              </SignupPromptDismiss>
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
          <SendButton
            $disabled={!inputValue.trim() || isLoading}
            onClick={handleSend}
          >
            Send
          </SendButton>
        </InputContainer>
      </ChatOverlay>

      {/* Signup Modal */}
      <ModalOverlay $isOpen={showSignupModal}>
        <ModalCard>
          {signupStep === 'form' ? (
            <>
              <ModalTitle>Save your chat</ModalTitle>
              <ModalText>
                Enter your email to save this conversation and pick up where you
                left off.
              </ModalText>
              <EmailInput
                type="email"
                placeholder="your@email.com"
                value={emailValue}
                onChange={(e) => {
                  setEmailValue(e.target.value);
                  if (emailError) setEmailError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSignupSubmit();
                }}
              />
              {emailError && <ModalError>{emailError}</ModalError>}
              <ModalSubmit onClick={handleSignupSubmit} disabled={isSigningUp}>
                {isSigningUp ? 'Signing up...' : 'Sign up'}
              </ModalSubmit>
              <ModalCancel onClick={handleCloseSignup}>Not now</ModalCancel>
            </>
          ) : (
            <>
              <ModalSuccessIcon>&#10003;</ModalSuccessIcon>
              <ModalSuccessTitle>You&apos;re signed up!</ModalSuccessTitle>
              <ModalSuccessText>
                Your conversation has been saved. You can now close this window
                and pick up where you left off anytime.
              </ModalSuccessText>
              <ModalSubmit onClick={handleCloseSuccess}>Continue chatting</ModalSubmit>
            </>
          )}
        </ModalCard>
      </ModalOverlay>
    </>
  );
}
