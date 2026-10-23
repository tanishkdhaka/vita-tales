import type { ReactNode } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import SpotlightCanvas from '@/components/public/SpotlightCanvas';
import ScrollProgressIndicator from '@/components/public/ScrollProgressIndicator';

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-text-primary selection:bg-brand-200 selection:text-brand-950 relative">
      <SpotlightCanvas />
      <Header />
      <main id="main-content" className="flex-1 relative z-20">
        {children}
      </main>
      <Footer />
      <ScrollProgressIndicator />
    </div>
  );
}
