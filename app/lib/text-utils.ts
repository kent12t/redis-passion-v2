// Re-export language functionality from the new language context
export { 
  useLanguage, 
  LanguageProvider, 
  languages, 
  type Language, 
  type LanguageConfig, 
  type TextContent 
} from './language-context';

// Import Language type for local use
import type { Language } from './language-context';

// Legacy default export removed - use useLanguage hook instead

/**
 * Get language-specific font classes based on current language
 * @param currentLanguage - The current language code
 * @param type - 'title' for headings/titles, 'body' for regular text
 * @returns CSS class string for the appropriate font
 */
export function getLanguageFontClass(currentLanguage: Language, type: 'title' | 'body'): string {
  switch (currentLanguage) {
    case 'ta': // Tamil
      return type === 'title' ? 'font-tamil-title' : 'font-tamil-body';
    case 'cn': // Chinese
      return type === 'title' ? 'font-chinese-title' : 'font-chinese-body';
    case 'en': // English
    case 'ms': // Malay
    default:
      return ''; // Use default fonts defined in CSS
  }
} 