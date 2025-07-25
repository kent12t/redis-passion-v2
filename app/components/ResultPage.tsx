'use client';

import { FaceTrackingVideo } from './';
import MotionButton from './ui/motion-button';
import { QRModal } from './ui';
import Image from 'next/image';
import { useRef, useCallback, useState } from 'react';
import { uploadImage, canvasToBlob } from '@/app/lib/upload-utils';
import { createScreenshotCanvas } from '@/app/lib/screenshot-utils';
import { personalityAssets } from '@/app/data/personality-assets';

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
    const getCanvasDataRef = useRef<(() => { canvas: HTMLCanvasElement | null; video: HTMLVideoElement | null }) | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadUrl, setUploadUrl] = useState<string | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

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

        setIsUploading(true);
        setUploadUrl(null);

        try {
            // Create screenshot canvas using the utility function
            const masterCanvas = await createScreenshotCanvas({
                faceTrackingCanvas,
                video,
                personalityType
            });

            // Convert to blob and upload to R2
            const blob = await canvasToBlob(masterCanvas);
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
            }

        } catch (error) {
            console.error('Error taking screenshot:', error);
        } finally {
            setIsUploading(false);
        }
    }, [onShare, personalityType]);

    // Countdown functionality
    const startCountdown = useCallback(() => {
        setCountdown(3);
        
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(countdownInterval);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        // Take screenshot after countdown completes
        setTimeout(() => {
            takeScreenshotInternal();
        }, 3000);
    }, [takeScreenshotInternal]);

    const handleCanvasReady = useCallback((getCanvasData: () => { canvas: HTMLCanvasElement | null; video: HTMLVideoElement | null }) => {
        getCanvasDataRef.current = getCanvasData;
    }, []);

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
                        className="flex justify-center items-center p-6 w-28 h-28 rounded-full bg-yellow"
                        onClick={onHome}
                    >
                        <Image
                            src="/icons/home.svg"
                            alt="Home"
                            width={80}
                            height={80}
                            className="w-20 h-20"
                        />
                    </MotionButton>
                </div>

                {/* Screenshot & Upload button */}
                <div className="absolute right-[31%] top-[47%] z-60">
                    <MotionButton
                        variant="primary"
                        className="flex justify-center items-center p-6 w-28 h-28 rounded-full bg-green"
                        onClick={startCountdown}
                        disabled={isUploading || countdown !== null}
                    >
                        <Image
                            src="/icons/camera.svg"
                            alt="Camera"
                            width={64}
                            height={64}
                            className={`w-16 h-16 ${isUploading ? 'animate-pulse' : ''}`}
                        />
                    </MotionButton>
                </div>

                {/* Countdown display */}
                {countdown !== null && (
                    <div className="flex absolute inset-0 z-10 justify-center items-center w-full h-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                        <div className="absolute top-[460px] right-[25px] flex justify-center items-center w-[600px] h-[445px]">
                            <span className="text-9xl font-bold text-white">
                                {countdown}
                            </span>
                        </div>
                    </div>
                )}

                {/* Processing loader */}
                {isUploading && (
                    <div className="flex absolute inset-0 z-10 justify-center items-center w-full h-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                        <div className="absolute top-[460px] right-[25px] flex flex-col justify-center items-center w-[600px] h-[450px]">
                            <div className="flex justify-center items-center mb-4">
                                <div className="w-12 h-12 rounded-full border-4 border-white animate-spin border-t-transparent"></div>
                            </div>
                            <span className="text-[40px] font-bold text-white">Processing...</span>
                        </div>
                    </div>
                )}

                <div className="grid w-full grid-cols-5 pl-[190px] pr-[90px] h-full pt-[400px] grid-rows-8 z-2">
                    <div className="col-span-2 row-span-full"></div>
                    <div className="flex flex-col col-span-3 row-span-3 row-start-1 h-full">
                        <div className="overflow-hidden relative p-0 h-full">
                            <FaceTrackingVideo
                                key={`face-tracking-${personalityType}`}
                                personalityType={personalityType.toLowerCase()}
                                onCanvasReady={handleCanvasReady}
                            />
                        </div>
                    </div>

                </div>

                <div className="absolute top-0 left-0 z-20 justify-center items-center w-full h-full">
                    <Image
                        src={personalityAssets[personalityType as keyof typeof personalityAssets].card}
                        alt={personalityType}
                        sizes="100vw"
                        className="object-contain relative w-full"
                        width={1080}
                        height={1920}
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
        </div>
    );
} 