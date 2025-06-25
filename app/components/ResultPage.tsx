'use client';

import { FaceTrackingVideo } from './';
import MotionButton from './ui/motion-button';
import { QRModal } from './ui';
import { RefreshCw, Camera } from 'lucide-react';
import Image from 'next/image';
import { useRef, useCallback, useState } from 'react';
import { uploadImage, canvasToBlob } from '../lib/upload-utils';

interface ResultPageProps {
    personalityType: string;
    onStartOver: () => void;
    onHome?: () => void;
}

// Personality type to asset mapping
const personalityAssets = {
    "wellness warrior": {
        card: '/results/wellness-warrior.png',
        bg: '/costume/runner-shirt.png'
    },
    "art maestro": {
        card: '/results/art-maestro.png',
        bg: '/costume/artist-shirt.png'
    },
    "wise storyteller": {
        card: '/results/wise-storyteller.png',
        bg: '/costume/storyteller-shirt.png'
    },
    "master chef": {
        card: '/results/master-chef.png',
        bg: '/costume/chef-shirt.png'
    },
    "tree whisperer": {
        card: '/results/tree-whisperer.png',
        bg: '/costume/farmer-shirt.png'
    },
    "community champion": {
        card: '/results/community-champion.png',
        bg: '/costume/volunteer-shirt.png'
    }
};

export default function ResultPage({
    personalityType,
    onStartOver,
    onHome,
}: ResultPageProps) {
    const getCanvasDataRef = useRef<(() => { canvas: HTMLCanvasElement | null; video: HTMLVideoElement | null }) | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadUrl, setUploadUrl] = useState<string | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);

    // Screenshot functionality with layer flattening and R2 upload
    const takeScreenshot = useCallback(async () => {
        if (!getCanvasDataRef.current) {
            console.error('Canvas data not available');
            return;
        }

        const { canvas: faceTrackingCanvas, video } = getCanvasDataRef.current();
        
        if (!faceTrackingCanvas || !video) {
            console.error('Face tracking canvas or video not available');
            return;
        }

        setIsUploading(true);
        setUploadUrl(null);

        try {
            // Create master canvas for compositing
            const masterCanvas = document.createElement('canvas');
            const masterCtx = masterCanvas.getContext('2d');
            
            if (!masterCtx) {
                console.error('Could not get master canvas context');
                return;
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
            // Calculate the position and size of the face tracking area (same as before)
            const faceTrackingAreaWidth = Math.round(canvasWidth * 0.6); // 3/5 of the width
            const faceTrackingAreaHeight = Math.round(canvasHeight * 0.6); // Approximate height based on layout
            const faceTrackingX = Math.round(canvasWidth * 0.13); // Left padding approximation
            const faceTrackingY = Math.round(canvasHeight * 0.18); // Top padding approximation

            // Create a temporary canvas to composite camera content
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            if (!tempCtx) {
                console.error('Could not get temp canvas context');
                return;
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
            // The face tracking canvas should align with the video position but maintain its aspect ratio
            const faceCanvasScale = Math.min(drawWidth / faceTrackingCanvas.width, drawHeight / faceTrackingCanvas.height);
            const scaledFaceWidth = faceTrackingCanvas.width * faceCanvasScale;
            const scaledFaceHeight = faceTrackingCanvas.height * faceCanvasScale;
            const faceCanvasX = drawX + (drawWidth - scaledFaceWidth) / 2;
            const faceCanvasY = drawY + (drawHeight - scaledFaceHeight) / 2;
            
            tempCtx.drawImage(faceTrackingCanvas, faceCanvasX, faceCanvasY, scaledFaceWidth, scaledFaceHeight);

            // Draw the composited camera content onto the master canvas
            masterCtx.drawImage(tempCanvas, faceTrackingX, faceTrackingY, faceTrackingAreaWidth, faceTrackingAreaHeight);

            // Step 3: Draw card overlay on top
            // Scale and position the result card to overlay on the composition
            const cardScale = 0.9; // Scale down the card to fit nicely
            const cardWidth = canvasWidth * cardScale;
            const cardHeight = (cardWidth / resultCardImage.width) * resultCardImage.height;
            const cardX = (canvasWidth - cardWidth) / 2; // Center horizontally
            const cardY = (canvasHeight - cardHeight) / 2; // Center vertically
            
            masterCtx.drawImage(resultCardImage, cardX, cardY, cardWidth, cardHeight);

            // Step 5: Convert to blob and upload to R2
            const blob = await canvasToBlob(masterCanvas);
            const result = await uploadImage(blob, personalityType);

            if (result.success && result.url) {
                setUploadUrl(result.url);
                setShowQRModal(true);
                console.log('Screenshot uploaded successfully:', result.url);
            } else {
                console.error('Upload failed:', result.error);
            }

        } catch (error) {
            console.error('Error taking screenshot:', error);
        } finally {
            setIsUploading(false);
        }
    }, [personalityType]);



    const handleCanvasReady = useCallback((getCanvasData: () => { canvas: HTMLCanvasElement | null; video: HTMLVideoElement | null }) => {
        getCanvasDataRef.current = getCanvasData;
    }, []);

    // Get current personality data
    return (
        <div className="flex flex-col items-center p-0 h-full">
            <div className="relative flex flex-col w-full h-full max-w-[1200px] mx-auto items-center justify-center">
                {/* Home button */}
                <div className="absolute top-12 right-12 z-20">
                    <MotionButton
                        variant="primary"
                        className="flex justify-center items-center p-6 w-28 h-28 rounded-full bg-yellow"
                        onClick={onHome}
                    >
                        <Image
                            src="/icons/home.svg"
                            alt="Home"
                            width={96}
                            height={96}
                            className="w-28 h-28"
                        />
                    </MotionButton>
                </div>

                {/* Screenshot & Upload button */}
                <div className="absolute right-12 top-44 z-20">
                    <MotionButton
                        variant="primary"
                        className="flex justify-center items-center p-6 w-28 h-28 rounded-full bg-orange"
                        onClick={takeScreenshot}
                        disabled={isUploading}
                    >
                        <Camera className={`w-16 h-16 text-white ${isUploading ? 'animate-pulse' : ''}`} />
                    </MotionButton>
                </div>

                {/* Upload URL display */}
                {uploadUrl && (
                    <div className="absolute right-12 top-80 z-20 p-4 max-w-xs bg-white rounded-lg shadow-lg">
                        <p className="mb-2 text-sm text-gray-600">Image uploaded!</p>
                        <a 
                            href={uploadUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 break-all hover:underline"
                        >
                            View Image
                        </a>
                    </div>
                )}

                {/* Main content with 3:2 ratio columns */}
                <div className="grid w-full grid-cols-5 pl-[160px] pr-[90px] h-full pt-[360px] grid-rows-8 z-0">
                    {/* Left column (60%) */}
                    <div className="flex flex-col col-span-3 row-span-full h-full">
                        {/* Face tracking display - 5/8 height */}

                        <div className="overflow-hidden relative p-0 h-full">
                            <FaceTrackingVideo
                                key={`face-tracking-${personalityType}`}
                                personalityType={personalityType.toLowerCase()}
                                onCanvasReady={handleCanvasReady}
                            />
                        </div>

                    </div>

                </div>

                <div className="flex absolute top-0 left-0 justify-center items-center w-full h-full">
                    <Image
                        src={personalityAssets[personalityType as keyof typeof personalityAssets].card}
                        alt={personalityType}
                        sizes="80vw"
                        className="object-contain relative w-5/6"
                        width={1080}
                        height={1966}
                    />
                </div>


            </div>
            
            <MotionButton
                onClick={onStartOver}
                size="lg"
                className="px-12 h-24 text-[48px] text-orange bg-yellow absolute bottom-12 z-20"
            >
                <RefreshCw className="mr-2 w-12 h-12 stroke-3 text-orange" />
                Start Over
            </MotionButton>

            {/* QR Modal */}
            {uploadUrl && (
                <QRModal
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                    imageUrl={uploadUrl}
                    personalityType={personalityType}
                />
            )}
        </div>
    );
} 