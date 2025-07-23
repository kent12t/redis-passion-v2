// Re-export language functionality from the new language context
export { 
  useLanguage, 
  LanguageProvider, 
  languages, 
  type Language, 
  type LanguageConfig, 
  type TextContent 
} from './language-context';

// Legacy default export removed - use useLanguage hook instead 