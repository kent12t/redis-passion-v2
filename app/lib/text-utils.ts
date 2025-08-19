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

/**
 * Adjust font size based on language for better readability
 * @param baseFontSize - The base font size (e.g., 'text-6xl', 'text-[60px]')
 * @param currentLanguage - The current language code
 * @returns Adjusted font size class or empty string if using inline style
 */
export function getLanguageAdjustedFontSize(baseFontSize: string, currentLanguage: Language): string {
  // Extract the size value from classes like 'text-6xl', 'text-[60px]', etc.
  if (baseFontSize.includes('[') && baseFontSize.includes('px]')) {
    // For custom pixel sizes, we'll return empty string and use getLanguageAdjustedFontStyle instead
    return '';
  } else {
    // Handle Tailwind size classes like 'text-6xl', 'text-4xl', etc.
    const sizeMap: Record<string, Record<Language, string>> = {
      'text-6xl': {
        'ta': 'text-5xl',
        'cn': 'text-7xl',
        'en': 'text-6xl',
        'ms': 'text-6xl'
      },
      'text-5xl': {
        'ta': 'text-4xl',
        'cn': 'text-6xl',
        'en': 'text-5xl',
        'ms': 'text-5xl'
      },
      'text-4xl': {
        'ta': 'text-3xl',
        'cn': 'text-5xl',
        'en': 'text-4xl',
        'ms': 'text-4xl'
      },
      'text-3xl': {
        'ta': 'text-2xl',
        'cn': 'text-4xl',
        'en': 'text-3xl',
        'ms': 'text-3xl'
      }
    };
    
    if (sizeMap[baseFontSize]) {
      return sizeMap[baseFontSize][currentLanguage];
    }
  }
  
  return baseFontSize; // Return original if no mapping found
}

/**
 * Get inline style object for language-adjusted font sizes (for custom pixel sizes)
 * @param baseFontSize - The base font size (e.g., 'text-[60px]')
 * @param currentLanguage - The current language code
 * @returns Style object with fontSize property or empty object
 */
export function getLanguageAdjustedFontStyle(baseFontSize: string, currentLanguage: Language): { fontSize?: string } {
  if (baseFontSize.includes('[') && baseFontSize.includes('px]')) {
    // Handle custom pixel sizes like 'text-[60px]'
    const match = baseFontSize.match(/\[(\d+)px\]/);
    if (match) {
      const baseSize = parseInt(match[1]);
      let adjustedSize: number;
      
      switch (currentLanguage) {
        case 'ta': // Tamil - smaller by ~15%
          adjustedSize = Math.round(baseSize * 0.85);
          break;
        case 'cn': // Chinese - larger by ~10%
          adjustedSize = Math.round(baseSize * 1.1);
          break;
        default:
          adjustedSize = baseSize; // No adjustment for English/Malay
      }
      
      return { fontSize: `${adjustedSize}px` };
    }
  }
  
  return {}; // Return empty object if no custom size found
} 