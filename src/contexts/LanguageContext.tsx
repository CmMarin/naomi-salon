'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '../locales';
import { ro } from '../locales/ro';

type TranslationValue = string | { [key: string]: any };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getNestedTranslation: (obj: any, path: string) => TranslationValue;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('ro'); // Default to Romanian
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load language from localStorage if available
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'ro' || savedLanguage === 'ru')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (mounted) {
      localStorage.setItem('language', lang);
    }
  };

  // Helper function to get nested translation values
  const getNestedTranslation = (obj: any, path: string): TranslationValue => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  // Translation function with dot notation support (e.g., 'welcome.title')
  const t = (key: string): any => {
    const translation = getNestedTranslation(translations[language], key);
    
    if (translation === null || translation === undefined) {
      // Fallback to Romanian if translation not found
      const fallback = getNestedTranslation(translations.ro, key);
      if (fallback !== null && fallback !== undefined) {
        return fallback;
      }
      // If still not found, return the key itself for debugging
      return key;
    }
    
    return translation;
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    getNestedTranslation
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for getting translations with better TypeScript support
export function useTranslation() {
  const { t, language, setLanguage } = useLanguage();
  
  return {
    t,
    language,
    setLanguage,
    isRomanian: language === 'ro',
    isRussian: language === 'ru'
  };
}