'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { ShieldCheck, Mail, Check } from 'lucide-react';
import { sound } from '@/lib/sounds';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    sound.playCelebration();

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#c5a059', '#1b3323', '#7e1e2d'],
    });

    setIsSubscribed(true);
    toast.success('Welcome to The Reading Circle!', {
      description: 'You will receive newly published biographical portraits directly in your inbox.',
    });
  };

  if (isSubscribed) {
    return (
      <div className="rounded-2xl border border-brass-500/40 bg-surface p-6 text-center space-y-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
          <Check className="h-5 w-5" />
        </div>
        <h4 className="font-serif text-lg font-bold text-text-primary">
          You are enrolled in The Reading Circle.
        </h4>
        <p className="text-xs text-text-secondary">
          A confirmation dispatch has been recorded for <span className="font-semibold">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your private email address"
          required
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brass-500 flex-1 font-sans shadow-2xs"
        />
        <button
          type="submit"
          className="rounded-xl bg-brass-400 hover:bg-brass-300 text-stone-950 px-6 py-3 text-sm font-bold shadow-md active:scale-98 transition-all shrink-0 flex items-center justify-center gap-2"
        >
          <Mail className="h-4 w-4 text-stone-900" />
          <span>Join the Reading Circle</span>
        </button>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-white/75">
        <ShieldCheck className="h-3.5 w-3.5 text-brass-300" />
        <span>Archived under strict privacy. Unsubscribe in one click anytime.</span>
      </div>
    </form>
  );
}
