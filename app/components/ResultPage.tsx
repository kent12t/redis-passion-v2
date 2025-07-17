'use client';

import { FaceTrackingVideo } from './';
import MotionButton from './ui/motion-button';
import { QRModal } from './ui';
import { RefreshCw, Camera } from 'lucide-react';
import Image from 'next/image';
import { useRef, useCallback, useState } from 'react';
import { uploadImage, canvasToBlob } from '@/app/lib/upload-utils';
import { createScreenshotCanvas } from '@/app/lib/screenshot-utils';
import { personalityAssets } from '@/app/data/personality-assets';

interface ResultPageProps {
    personalityType: string;
    onStartOver: () => void;
    onHome?: () => void;
}



export default function ResultPage({
    personalityType,
    onStartOver,
    onHome,
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

    // Get current personality data
    return (
        <div className={`flex flex-col items-center p-0 h-full ${getBackgroundColor()}`}>
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
                        onClick={startCountdown}
                        disabled={isUploading || countdown !== null}
                    >
                        <Camera className={`w-16 h-16 text-white ${isUploading ? 'animate-pulse' : ''}`} />
                    </MotionButton>
                </div>

                {/* Countdown display */}
                {countdown !== null && (
                    <div className="flex fixed inset-0 z-30 justify-center items-center w-full h-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <div className="flex justify-center items-center w-48 h-48 bg-white rounded-full border-8 shadow-2xl border-orange">
                            <span className="text-8xl font-bold animate-pulse text-orange">
                                {countdown}
                            </span>
                        </div>
                    </div>
                )}

                {/* Processing loader */}
                {isUploading && (
                    <div className="flex fixed inset-0 z-30 justify-center items-center w-full h-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                        <div className="flex flex-col justify-center items-center p-8 bg-white rounded-2xl border-4 shadow-2xl border-orange">
                            <div className="flex justify-center items-center mb-4">
                                <div className="w-12 h-12 rounded-full border-4 animate-spin border-orange border-t-transparent"></div>
                            </div>
                            <span className="text-2xl font-bold text-orange">Processing...</span>
                            <span className="mt-2 text-sm text-gray-600">Capturing and uploading your image</span>
                        </div>
                    </div>
                )}

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