'use client';

import { useEffect } from 'react';
import { I18nextProvider as ReactI18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface I18nextProviderProps {
  children: React.ReactNode;
}

export function I18nextProvider({ children }: I18nextProviderProps) {
  useEffect(() => {
    // Initialize i18next on the client side
    if (typeof window !== 'undefined') {
      // Check if there's a saved language preference
      const savedLanguage = localStorage.getItem('i18nextLng');
      if (savedLanguage && ['en', 'th'].includes(savedLanguage)) {
        i18n.changeLanguage(savedLanguage);
      }
    }
  }, []);

  return (
    <ReactI18nextProvider i18n={i18n}>
      {children}
    </ReactI18nextProvider>
  );
}
