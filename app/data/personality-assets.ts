import { Language } from '@/app/lib/language-context';

// Function to get language-specific result card image
export function getLanguageSpecificResultCard(personalityType: string, language: Language): string {
    const baseType = personalityType.toLowerCase();
    
    switch (language) {
        case 'ta': // Tamil
            return `/results/result-${baseType}-ta.png`;
        case 'cn': // Chinese
            return `/results/result-${baseType}-zh.png`;
        case 'ms': // Malay
            return `/results/result-${baseType}-ms.png`;
        case 'en': // English (default)
        default:
            return `/results/result-${baseType}.png`;
    }
}

// Personality type to asset mapping
export const personalityAssets = {
    "runner": {
        card: '/results/result-runner.png',
        bg: '/costume/runner-shirt.png',
        shirt: '/costume/runner-shirt.png',
        hat: '/costume/runner-hat.png'
    },
    "artist": {
        card: '/results/result-artist.png',
        bg: '/costume/artist-shirt.png',
        shirt: '/costume/artist-shirt.png',
        hat: '/costume/artist-hat.png'
    },
    "gamer": {
        card: '/results/result-gamer.png',
        bg: '/costume/gamer-shirt.png',
        shirt: '/costume/gamer-shirt.png',
        hat: '/costume/gamer-hat.png'
    },
    "crafter": {
        card: '/results/result-crafter.png',
        bg: '/costume/crafter-shirt.png',
        shirt: '/costume/crafter-shirt.png',
        hat: '/costume/crafter-hat.png'
    },
    "farmer": {
        card: '/results/result-farmer.png',
        bg: '/costume/farmer-shirt.png',
        shirt: '/costume/farmer-shirt.png',
        hat: '/costume/farmer-hat.png'
    },
    "volunteer": {
        card: '/results/result-volunteer.png',
        bg: '/costume/volunteer-shirt.png',
        shirt: '/costume/volunteer-shirt.png',
        hat: '/costume/volunteer-hat.png'
    }
}; 