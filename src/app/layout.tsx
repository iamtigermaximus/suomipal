import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeProvider from '@/lib/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SuomiPal — Bilingual support for Finnish businesses',
  description:
    'Your customers speak Finnish, Swedish, or English. So does our AI. Affordable bilingual customer support chatbot for Finnish small businesses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
