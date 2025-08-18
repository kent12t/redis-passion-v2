'use client';

import { FaceTrackingVideo } from './';
import MotionButton from './ui/motion-button';
import { QRModal } from './ui';
import Image from 'next/image';
import { useRef, useCallback, useState, useEffect } from 'react';
import { uploadImage, canvasToBlob } from '@/app/lib/upload-utils';
import { createScreenshotCanvas, preloadResultCardImage } from '@/app/lib/screenshot-utils';
import { personalityAssets, getLanguageSpecificResultCard } from '@/app/data/personality-assets';
import { useLanguage } from '@/app/lib/text-utils';

interface ResultPageProps {
    personalityType: string;
    onHome?: () => void;
    onShare?: (imageUrl: string) => void;
}



export default function ResultPage({
    personalityType,
    onHome,
    onShare,
}: ResultPageProps) {
    const { textContent, currentLanguage } = useLanguage();
    const getCanvasDataRef = useRef<(() => { canvas: HTMLCanvasElement | null; video: HTMLVideoElement | null }) | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadUrl, setUploadUrl] = useState<string | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
    const [showUploadErrorModal, setShowUploadErrorModal] = useState(false);

    // Get background color based on personality type
    const getBackgroundColor = () => {
        switch (personalityType.toLowerCase()) {
            case 'artist':
                return 'bg-purple';
            case 'volunteer':
                return 'bg-green';
            case 'crafter':
                return 'bg-darkblue';
            case 'runner':
                return 'bg-lightblue';
            case 'farmer':
                return 'bg-palegreen';
            case 'gamer':
                return 'bg-darkyellow';
            default:
                return 'bg-yellow'; // fallback
        }
    };

    // Screenshot functionality with layer flattening and R2 upload
    const takeScreenshotInternal = useCallback(async () => {
        if (!getCanvasDataRef.current) {
            console.error('Canvas data not available');
            return;
        }

        const { canvas: faceTrackingCanvas, video } = getCanvasDataRef.current();
        
        if (!faceTrackingCanvas || !video) {
            console.error('Face tracking canvas or video not available');
            return;
        }

        // Phase 1: Capture the image
        setIsCapturing(true);
        setUploadUrl(null);

        try {
            // First, create a composite image for freezing the camera feed (video + costume overlays)
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            if (!tempCtx) {
                throw new Error('Could not get temp canvas context');
            }

            // Set canvas size to match the face tracking canvas display area
            tempCanvas.width = faceTrackingCanvas.width;
            tempCanvas.height = faceTrackingCanvas.height;

            // Calculate proper video scaling to maintain aspect ratio (same as FaceTrackingVideo component)
            const videoAspect = video.videoWidth / video.videoHeight;
            const canvasAspect = tempCanvas.width / tempCanvas.height;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (videoAspect > canvasAspect) {
                // Video is wider - fit height and center horizontally
                drawHeight = tempCanvas.height;
                drawWidth = drawHeight * videoAspect;
                drawX = (tempCanvas.width - drawWidth) / 2;
                drawY = 0;
            } else {
                // Video is taller - fit width and center vertically
                drawWidth = tempCanvas.width;
                drawHeight = drawWidth / videoAspect;
                drawX = 0;
                drawY = (tempCanvas.height - drawHeight) / 2;
            }

            // Draw the video frame first (mirrored to match display)
            tempCtx.save();
            tempCtx.translate(drawX + drawWidth, drawY);
            tempCtx.scale(-1, 1);
            tempCtx.drawImage(video, 0, 0, drawWidth, drawHeight);
            tempCtx.restore();

            // Draw the costume overlays on top
            tempCtx.drawImage(faceTrackingCanvas, 0, 0);

            // Capture the composite for freezing
            const faceTrackingImageData = tempCanvas.toDataURL('image/jpeg', 0.9);
            setCapturedImageData(faceTrackingImageData);

            // Create screenshot canvas using the utility function
            const masterCanvas = await createScreenshotCanvas({
                faceTrackingCanvas,
                video,
                personalityType,
                language: currentLanguage
            });
            
            // Phase 2: Upload the image
            setIsCapturing(false);
            setIsUploading(true);

            // Convert to blob with optimized settings for upload
            const blob = await canvasToBlob(masterCanvas, 0.85); // Reduced quality for faster upload
            const result = await uploadImage(blob, personalityType);

            if (result.success && result.url) {
                setUploadUrl(result.url);
                if (onShare) {
                    onShare(result.url);
                } else {
                    setShowQRModal(true);
                }
                console.log('Screenshot uploaded successfully:', result.url);
            } else {
                console.error('Upload failed:', result.error);
                setShowUploadErrorModal(true);
            }

        } catch (error) {
            console.error('Error taking screenshot:', error);
            setShowUploadErrorModal(true);
        } finally {
            setIsCapturing(false);
            setIsUploading(false);
        }
    }, [onShare, personalityType]);

    // Reset captured state for new photo
    const resetCapture = useCallback(() => {
        setCapturedImageData(null);
        setUploadUrl(null);
        setShowUploadErrorModal(false);
    }, []);

    // Countdown functionality
    const startCountdown = useCallback(() => {
        // Reset any previous capture
        resetCapture();
        setCountdown(3);
        
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(countdownInterval);
                    // Take screenshot immediately when countdown reaches 0
                    takeScreenshotInternal();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    }, [takeScreenshotInternal, resetCapture]);

    const handleCanvasReady = useCallback((getCanvasData: () => { canvas: HTMLCanvasElement | null; video: HTMLVideoElement | null }) => {
        getCanvasDataRef.current = getCanvasData;
    }, []);

    // Preload result card image for faster capture
    useEffect(() => {
        if (personalityType) {
            preloadResultCardImage(personalityType, currentLanguage).catch(error => {
                console.error('Failed to preload result card image:', error);
            });
        }
    }, [personalityType, currentLanguage]);

    // Don't render anything if personalityType is not set yet (during preloading)
    if (!personalityType) {
        return null;
    }

    // Get current personality data
    return (
        <div className={`flex flex-col items-center p-0 w-full h-full ${getBackgroundColor()}`}>
            <div className="relative flex flex-col w-full h-full max-w-[1200px] mx-auto items-center justify-center">
                {/* Home button */}
                <div className="absolute top-[47%] right-[18%] z-30">
                    <MotionButton
                        variant="primary"
                        className="flex items-center justify-center p-6 rounded-full w-28 h-28 bg-yellow"
                        onClick={onHome}
                    >
                        <Image
                            src="/icons/home.svg"
                            alt={textContent.common.altTexts.home}
                            width={80}
                            height={80}
                            className="w-20 h-20"
                        />
                    </MotionButton>
                </div>

                {/* Screenshot & Upload button */}
                <div className="absolute right-[31%] top-[47%] z-30">
                    <MotionButton
                        variant="primary"
                        className={`flex items-center justify-center p-6 rounded-full w-28 h-28 bg-green ${
                            (isCapturing || isUploading || countdown !== null) ? '' : 'animate-pulse-scale'
                        }`}
                        onClick={startCountdown}
                        disabled={isCapturing || isUploading || countdown !== null}
                    >
                        <Image
                            src="/icons/camera.svg"
                            alt={textContent.common.altTexts.camera}
                            width={64}
                            height={64}
                            className={`w-16 h-16 ${
                                (isCapturing || isUploading) ? 'animate-pulse' : 
                                (countdown === null) ? 'animate-pulse-scale' : ''
                            }`}
                        />
                    </MotionButton>
                </div>

                {/* Countdown display */}
                {countdown !== null && (
                    <div className="absolute top-[20%] right-[6%] w-[50%] h-[32%] z-10 flex justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                        <span className="font-bold text-white text-9xl">
                            {countdown}
                        </span>
                    </div>
                )}

                {/* Capturing loader */}
                {isCapturing && (
                    <div className="absolute top-[20%] right-[6%] w-[50%] h-[32%] z-10 flex flex-col justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 border-4 border-white rounded-full animate-spin border-t-transparent"></div>
                        </div>
                        <span className="text-[40px] font-bold text-white">Capturing...</span>
                    </div>
                )}

                {/* Uploading loader */}
                {isUploading && (
                    <div className="absolute top-[20%] right-[6%] w-[50%] h-[32%] z-10 flex flex-col justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 border-4 border-white rounded-full animate-spin border-t-transparent"></div>
                        </div>
                        <span className="text-[40px] font-bold text-white">Uploading...</span>
                    </div>
                )}

                <div className="absolute top-[20%] right-[6%] w-[50%] h-[32%] z-2">
                    <div className="relative w-full h-full p-0 overflow-hidden">
                        {capturedImageData ? (
                            /* Show frozen captured image */
                            <Image 
                                src={capturedImageData} 
                                alt="Captured result"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            /* Show live face tracking video */
                            <FaceTrackingVideo
                                key={`face-tracking-${personalityType}`}
                                personalityType={personalityType.toLowerCase()}
                                onCanvasReady={handleCanvasReady}
                            />
                        )}
                    </div>
                </div>

                <div className="absolute z-20 flex items-center justify-center w-full h-full transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                    <Image
                        src={getLanguageSpecificResultCard(personalityType, currentLanguage)}
                        alt={personalityType}
                        sizes="100vw"
                        className="object-contain w-full h-full"
                        width={1080}
                        height={1920}
                        style={{ transformOrigin: 'center center' }}
                    />
                </div>


            </div>
            
            {/* QR Modal */}
            {uploadUrl && (
                <QRModal
                    isOpen={showQRModal}
                    onClose={() => setShowQRModal(false)}
                    imageUrl={uploadUrl}
                    personalityType={personalityType}
                />
            )}

            {/* Upload Error Modal */}
            {showUploadErrorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-[60%] p-16 bg-white border-6 border-black rounded-[48px] motion-card text-center">
                        <p className="text-[36px] leading-tight font-bold text-[#3A3A3A] mb-2">
                            Upload failed.
                            <br />
                            </p>
                            <p className="text-[28px] leading-tight font-bold text-[#3A3A3A] mb-8">
                            Please take a picture of your
                            <br />
                            Ideal Pursuit instead!
                        </p>
                        <MotionButton
                            variant="primary"
                            className="text-black bg-yellow text-[32px] p-8"
                            onClick={() => {
                                setShowUploadErrorModal(false);
                                // Reset capture to allow retry
                                resetCapture();
                            }}
                        >
                            Close
                        </MotionButton>
                    </div>
                </div>
            )}
        </div>
    );
} 