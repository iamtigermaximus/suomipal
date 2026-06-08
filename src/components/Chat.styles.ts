'use client';

import styled, { keyframes } from 'styled-components';

// ---------------------------------------------------------------------------
// Chat container (overlay that appears after CTA click)
// ---------------------------------------------------------------------------
export const ChatOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 420px;
  max-width: 100vw;
  height: 600px;
  max-height: 100vh;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transform: translateY(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  transition: transform 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
  margin: 0 16px;

  @media (max-width: 480px) {
    width: 100%;
    height: 100vh;
    margin: 0;
    border-radius: 0;
  }
`;

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
export const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #E5E7EB;
  background-color: #2C553C;
  color: #FFFFFF;
  flex-shrink: 0;
`;

export const ChatHeaderTitle = styled.span`
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 16px;
`;

export const ChatHeaderClose = styled.button`
  background: none;
  border: none;
  color: #FFFFFF;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`;

// ---------------------------------------------------------------------------
// Messages area
// ---------------------------------------------------------------------------
export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #F8F9FA;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #E5E7EB;
    border-radius: 3px;
  }
`;

// ---------------------------------------------------------------------------
// Message bubbles
// ---------------------------------------------------------------------------
export const MessageRow = styled.div<{ $role: 'user' | 'assistant' }>`
  display: flex;
  justify-content: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'flex-start')};
`;

export const MessageBubble = styled.div<{ $role: 'user' | 'assistant' }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.5;
  color: ${({ $role }) => ($role === 'user' ? '#FFFFFF' : '#1A1A1A')};
  background-color: ${({ $role }) => ($role === 'user' ? '#2C553C' : '#FFFFFF')};
  border: ${({ $role }) => ($role === 'assistant' ? '1px solid #E5E7EB' : 'none')};
  word-break: break-word;
  white-space: pre-wrap;
`;

// ---------------------------------------------------------------------------
// Loading indicator
// ---------------------------------------------------------------------------
const pulse = keyframes`
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
`;

export const LoadingDots = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
`;

export const LoadingDot = styled.span<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #2C553C;
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

// ---------------------------------------------------------------------------
// Input area
// ---------------------------------------------------------------------------
export const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #E5E7EB;
  background-color: #FFFFFF;
  flex-shrink: 0;
`;

export const Input = styled.input`
  flex: 1;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 15px;
  color: #1A1A1A;
  outline: none;

  &::placeholder {
    color: #9CA3AF;
  }

  &:focus {
    border-color: #2C553C;
  }
`;

export const SendButton = styled.button<{ $disabled: boolean }>`
  background-color: ${({ $disabled }) => ($disabled ? '#E5E7EB' : '#2C553C')};
  color: ${({ $disabled }) => ($disabled ? '#9CA3AF' : '#FFFFFF')};
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${({ $disabled }) => ($disabled ? '#E5E7EB' : '#1E3D2A')};
  }
`;

// ---------------------------------------------------------------------------
// Signup prompt (appears after 3 messages)
// ---------------------------------------------------------------------------
export const SignupPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  margin: 8px 0;
  background-color: #FFFFFF;
  border: 1px solid #D4A373;
  border-radius: 12px;
  text-align: center;
`;

export const SignupPromptText = styled.p`
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #4B5563;
  margin: 0;
`;

export const SignupButton = styled.button`
  background-color: #2C553C;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1E3D2A;
  }
`;

// ---------------------------------------------------------------------------
// Signup modal
// ---------------------------------------------------------------------------
export const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
`;

export const ModalCard = styled.div`
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
`;

export const ModalTitle = styled.h2`
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: #1A1A1A;
  margin: 0;
`;

export const ModalText = styled.p`
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #4B5563;
  margin: 0;
`;

export const EmailInput = styled.input`
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: #1A1A1A;
  outline: none;

  &::placeholder {
    color: #9CA3AF;
  }

  &:focus {
    border-color: #2C553C;
  }
`;

export const ModalSubmit = styled.button`
  background-color: #2C553C;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1E3D2A;
  }
`;

export const ModalCancel = styled.button`
  background: none;
  border: none;
  color: #4B5563;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  cursor: pointer;
  padding: 8px;

  &:hover {
    color: #1A1A1A;
  }
`;
