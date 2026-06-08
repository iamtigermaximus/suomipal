'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import Chat from '@/components/Chat';
import Footer from '@/components/Footer';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  function handleStartChat() {
    setIsChatOpen(true);
  }

  function handleCloseChat() {
    setIsChatOpen(false);
  }

  return (
    <main>
      <Hero onStartChat={handleStartChat} />
      <Footer />
      <Chat isOpen={isChatOpen} onClose={handleCloseChat} />
    </main>
  );
}
