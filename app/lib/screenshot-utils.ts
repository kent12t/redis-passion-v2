import { getLanguageSpecificResultCard } from '@/app/data/personality-assets';
import { Language } from '@/app/lib/language-context';

interface ScreenshotOptions {
    faceTrackingCanvas: HTMLCanvasElement;
    video: HTMLVideoElement;
    personalityType: string;
    language?: Language;
}

// Cache for preloaded result card images
const imageCache = new Map<string, HTMLImageElement>();

// Function to preload result card image
export function preloadResultCardImage(personalityType: string, language: Language = 'en'): Promise<HTMLImageElement> {
    const cacheKey = `${personalityType}-${language}`;
    
    return new Promise((resolve, reject) => {
        // Check if already cached
        if (imageCache.has(cacheKey)) {
            resolve(imageCache.get(cacheKey)!);
            return;
        }

        const image = document.createElement('img');
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            imageCache.set(cacheKey, image);
            resolve(image);
        };
        image.onerror = () => reject(new Error(`Failed to load result card image for ${personalityType} in ${language}`));
        image.src = getLanguageSpecificResultCard(personalityType, language);
    });
}

export async function createScreenshotCanvas({
    faceTrackingCanvas,
    video,
    personalityType,
    language = 'en'
}: ScreenshotOptions): Promise<HTMLCanvasElement> {
    // Create master canvas for compositing
    const masterCanvas = document.createElement('canvas');
    const masterCtx = masterCanvas.getContext('2d');
    
    if (!masterCtx) {
        throw new Error('Could not get master canvas context');
    }

    // Get result card image from cache or load it
    const resultCardImage = await preloadResultCardImage(personalityType, language);

    // Set canvas dimensions to 9:16 aspect ratio
    const canvasWidth = 1080;
    const canvasHeight = Math.round(canvasWidth * (16 / 9)); // 9:16 aspect ratio
    
    masterCanvas.width = canvasWidth;
    masterCanvas.height = canvasHeight;

    // Get background color based on personality type
    const getBackgroundColor = () => {
        switch (personalityType.toLowerCase()) {
            case 'artist':
                return '#A855F7'; // bg-purple
            case 'volunteer':
                return '#22C55E'; // bg-green
            case 'crafter':
                return '#1E40AF'; // bg-darkblue
            case 'runner':
                return '#0EA5E9'; // bg-lightblue
            case 'farmer':
                return '#84CC16'; // bg-palegreen
            case 'gamer':
                return '#D97706'; // bg-darkyellow
            default:
                return '#FDE047'; // bg-yellow fallback
        }
    };

    // Step 1: Draw background with personality color
    masterCtx.fillStyle = getBackgroundColor();
    masterCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Step 2: Draw camera feed with face tracking overlays
    // Updated positioning to match the new layout: right side, 3-column span
    const faceTrackingAreaWidth = Math.round(canvasWidth * 0.4); // 3/5 of the width (col-span-3 out of 5)
    const faceTrackingAreaHeight = Math.round(canvasHeight * 0.3); // Reduced height for 3-row span
    const faceTrackingX = Math.round(canvasWidth * 0.5); // Positioned more to the right to match grid layout
    const faceTrackingY = Math.round(canvasHeight * 0.205); // Top padding to match pt-[400px]

    // Create a temporary canvas to composite camera content
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
        throw new Error('Could not get temp canvas context');
    }

    tempCanvas.width = faceTrackingAreaWidth;
    tempCanvas.height = faceTrackingAreaHeight;

    // Draw video frame first
    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const areaAspectRatio = faceTrackingAreaWidth / faceTrackingAreaHeight;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (videoAspectRatio > areaAspectRatio) {
        // Video is wider - fit height and crop sides
        drawHeight = faceTrackingAreaHeight;
        drawWidth = drawHeight * videoAspectRatio;
        drawX = (faceTrackingAreaWidth - drawWidth) / 2;
        drawY = 0;
    } else {
        // Video is taller - fit width and crop top/bottom
        drawWidth = faceTrackingAreaWidth;
        drawHeight = drawWidth / videoAspectRatio;
        drawX = 0;
        drawY = (faceTrackingAreaHeight - drawHeight) / 2;
    }

    // Mirror the video horizontally to match the display
    tempCtx.save();
    tempCtx.translate(drawX + drawWidth, drawY);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(video, 0, 0, drawWidth, drawHeight);
    tempCtx.restore();

    // Draw face tracking overlays on top of video at their original size
    const faceCanvasScale = Math.min(drawWidth / faceTrackingCanvas.width, drawHeight / faceTrackingCanvas.height);
    const scaledFaceWidth = faceTrackingCanvas.width * faceCanvasScale;
    const scaledFaceHeight = faceTrackingCanvas.height * faceCanvasScale;
    const faceCanvasX = drawX + (drawWidth - scaledFaceWidth) / 2;
    const faceCanvasY = drawY + (drawHeight - scaledFaceHeight) / 2;
    
    tempCtx.drawImage(faceTrackingCanvas, faceCanvasX, faceCanvasY, scaledFaceWidth, scaledFaceHeight);

    // Draw the composited camera content onto the master canvas
    masterCtx.drawImage(tempCanvas, faceTrackingX, faceTrackingY, faceTrackingAreaWidth, faceTrackingAreaHeight);

    // Step 3: Draw card overlay on top - now full screen instead of 80%
    const cardScale = 1.0; // Full size to match the new layout
    const cardWidth = canvasWidth * cardScale;
    const cardHeight = (cardWidth / resultCardImage.width) * resultCardImage.height;
    
    // Center the card if it doesn't fill the height, otherwise fit to canvas
    let cardX = 0;
    let cardY = 0;
    
    if (cardHeight > canvasHeight) {
        // Card is taller than canvas, scale to fit height and center horizontally
        const heightScale = canvasHeight / cardHeight;
        const scaledCardWidth = cardWidth * heightScale;
        cardX = (canvasWidth - scaledCardWidth) / 2;
        cardY = 0;
        masterCtx.drawImage(resultCardImage, cardX, cardY, scaledCardWidth, canvasHeight);
    } else {
        // Card fits in height, center vertically
        cardY = (canvasHeight - cardHeight) / 2;
        masterCtx.drawImage(resultCardImage, cardX, cardY, cardWidth, cardHeight);
    }

    return masterCanvas;
} 