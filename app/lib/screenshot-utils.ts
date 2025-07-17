import { personalityAssets } from '@/app/data/personality-assets';

interface ScreenshotOptions {
    faceTrackingCanvas: HTMLCanvasElement;
    video: HTMLVideoElement;
    personalityType: string;
}

export async function createScreenshotCanvas({
    faceTrackingCanvas,
    video,
    personalityType
}: ScreenshotOptions): Promise<HTMLCanvasElement> {
    // Create master canvas for compositing
    const masterCanvas = document.createElement('canvas');
    const masterCtx = masterCanvas.getContext('2d');
    
    if (!masterCtx) {
        throw new Error('Could not get master canvas context');
    }

    // Set master canvas size to match the result page layout
    const resultCardImage = document.createElement('img');
    resultCardImage.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
        resultCardImage.onload = () => resolve();
        resultCardImage.onerror = () => reject(new Error('Failed to load result card image'));
        resultCardImage.src = personalityAssets[personalityType as keyof typeof personalityAssets].card;
    });

    // Set canvas dimensions to 9:16 aspect ratio
    const canvasWidth = 1080;
    const canvasHeight = Math.round(canvasWidth * (16 / 9)); // 9:16 aspect ratio
    
    masterCanvas.width = canvasWidth;
    masterCanvas.height = canvasHeight;

    // Step 1: Draw background (#facb16)
    masterCtx.fillStyle = '#facb16';
    masterCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Step 2: Draw camera feed with face tracking overlays
    const faceTrackingAreaWidth = Math.round(canvasWidth * 0.6); // 3/5 of the width
    const faceTrackingAreaHeight = Math.round(canvasHeight * 0.6); // Approximate height based on layout
    const faceTrackingX = Math.round(canvasWidth * 0.13); // Left padding approximation
    const faceTrackingY = Math.round(canvasHeight * 0.18); // Top padding approximation

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

    // Step 3: Draw card overlay on top
    const cardScale = 0.9; // Scale down the card to fit nicely
    const cardWidth = canvasWidth * cardScale;
    const cardHeight = (cardWidth / resultCardImage.width) * resultCardImage.height;
    const cardX = (canvasWidth - cardWidth) / 2; // Center horizontally
    const cardY = (canvasHeight - cardHeight) / 2; // Center vertically
    
    masterCtx.drawImage(resultCardImage, cardX, cardY, cardWidth, cardHeight);

    return masterCanvas;
} 