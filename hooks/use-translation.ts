'use client';

import { useTranslation as useReactI18nextTranslation } from 'react-i18next';

/**
 * Custom hook that wraps react-i18next's useTranslation
 * Provides type-safe translations with default namespace
 */
export function useTranslation(namespace: string = 'common') {
  return useReactI18nextTranslation(namespace);
}

/**
 * Hook to change language programmatically
 */
export function useLanguage() {
  const { i18n } = useReactI18nextTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', lng);
    }
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    isLanguageLoaded: i18n.isInitialized,
  };
}
