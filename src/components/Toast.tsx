'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

/**
 * The demo's `showToast()` global, as a provider.
 *
 * In the demo every unbuilt screen answered with a toast ("Trainer profile page is part of
 * the next design stage"). Those placeholders are kept deliberately — they mark exactly
 * where a real route or API call goes, and they make the gaps visible during review.
 */
const ToastContext = createContext<(message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    setShown(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown(false), 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={shown ? 'toast show' : 'toast'} role="status" aria-live="polite">
        {message}
      </div>
    </ToastContext.Provider>
  );
}
