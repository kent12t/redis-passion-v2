'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Feature flag for language switcher (set to false to hide for deployment)
const ENABLE_LANGUAGE_SWITCHER = true;

// Language types
export type Language = 'en' | 'cn' | 'ms' | 'ta';

export interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
}

export const languages: LanguageConfig[] = [
  { code: 'en', name: 'English', flag: '' },
  { code: 'cn', name: '中文', flag: '' },
  { code: 'ms', name: 'Bahasa', flag: '' },
  { code: 'ta', name: 'தமிழ்', flag: '' }
];

// Text content type (based on the structure we see in JSON files)
export interface TextContent {
  startPage: {
    heroText: string;
    button: {
      getStarted: string;
    };
  };
  introPage: {
    title: string;
    description: string;
    buttons: {
      begin: string;
    };
  };
  revealPage: {
    buttons: {
      unveil: string;
    };
  };
  sharePage: {
    title: string;
    qrText: string;
    downloadText: string;
  };
  questionPage: {
    buttons: {
      next: string;
    };
  };
  common: {
    buttons: {
      back: string;
      home: string;
      camera: string;
    };
    altTexts: {
      back: string;
      next: string;
      home: string;
      camera: string;
    };
  };
}

// Language context
interface LanguageContextType {
  currentLanguage: Language;
  textContent: TextContent;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
  isLanguageSwitcherEnabled: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [textContent, setTextContent] = useState<TextContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Feature flag for language switcher
  const isLanguageSwitcherEnabled = ENABLE_LANGUAGE_SWITCHER;

  // Load text content for a specific language
  const loadTextContent = async (language: Language) => {
    setIsLoading(true);
    try {
      const content = await import(`@/app/data/text_content_${language}.json`);
      setTextContent(content.default);
    } catch (error) {
      console.error(`Failed to load text content for language: ${language}`, error);
      // Fallback to English if language fails to load
      if (language !== 'en') {
        const fallback = await import('@/app/data/text_content_en.json');
        setTextContent(fallback.default);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial language on mount
  useEffect(() => {
    loadTextContent(currentLanguage);
  }, [currentLanguage]);

  // Handle language change
  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    loadTextContent(language);
  };

  const value: LanguageContextType = {
    currentLanguage,
    textContent: textContent!,
    setLanguage,
    isLoading,
    isLanguageSwitcherEnabled
  };

  // Don't render children until text content is loaded
  if (isLoading || !textContent) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 