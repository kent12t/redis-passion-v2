'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function FaceTracking() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const chefHatRef = useRef<HTMLImageElement | null>(null);
    const chefShirtRef = useRef<HTMLImageElement | null>(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [facesDetected, setFacesDetected] = useState(0);
    const [showDebugBox, setShowDebugBox] = useState(true);

    // Store previous detection positions for smoothing
    const prevPositionsRef = useRef<Array<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>>([]);

    // Load the chef images
    useEffect(() => {
        const chefHat = new Image();
        chefHat.src = '/chef-hat.png';
        chefHat.onload = () => {
            console.log('Chef hat loaded');
            chefHatRef.current = chefHat;
            if (chefShirtRef.current) setImagesLoaded(true);
        };

        const chefShirt = new Image();
        chefShirt.src = '/chef-shirt.png';
        chefShirt.onload = () => {
            console.log('Chef shirt loaded');
            chefShirtRef.current = chefShirt;
            if (chefHatRef.current) setImagesLoaded(true);
        };
    }, []);

    // Load face-api.js models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';

                console.log('Loading face-api.js models...');

                // Only load the TinyFaceDetector model
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                console.log('Tiny face detector model loaded');

                setModelsLoaded(true);
                console.log('All models loaded successfully');
            } catch (error) {
                console.error('Error loading models:', error);
            }
        };

        loadModels();
    }, []);

    // Cleanup function for video stream in a separate useEffect
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Start video when models and images are loaded
    useEffect(() => {
        if (modelsLoaded && imagesLoaded) {
            startVideo();
        }
    }, [modelsLoaded, imagesLoaded]);

    // Start the webcam
    const startVideo = async () => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
                setStream(newStream);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    // Function to smoothly interpolate between previous and current values
    const smoothPosition = (
        current: { x: number; y: number; width: number; height: number },
        index: number,
        easing = 0.3
    ) => {
        if (!prevPositionsRef.current[index]) {
            prevPositionsRef.current[index] = { ...current };
            return current;
        }

        const prev = prevPositionsRef.current[index];

        // Apply easing to create smooth movement
        const smoothed = {
            x: prev.x + easing * (current.x - prev.x),
            y: prev.y + easing * (current.y - prev.y),
            width: prev.width + easing * (current.width - prev.width),
            height: prev.height + easing * (current.height - prev.height)
        };

        // Update previous position for next frame
        prevPositionsRef.current[index] = { ...smoothed };

        return smoothed;
    };

    // Handle video playback and face detection
    const handleVideoPlay = () => {
        if (!videoRef.current || !canvasRef.current || !modelsLoaded || !imagesLoaded) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Match canvas size to video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Create face detection loop
        const detectFaces = async () => {
            if (!video || !canvas) return;

            try {
                // Use TinyFaceDetector for basic face detection only (no landmarks)
                const detections = await faceapi.detectAllFaces(
                    video,
                    new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
                );

                setFacesDetected(detections.length);

                // Get canvas context and clear previous drawings
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Clean up prevPositions array if we have fewer detections
                if (prevPositionsRef.current.length > detections.length) {
                    prevPositionsRef.current = prevPositionsRef.current.slice(0, detections.length);
                }

                // Process each detected face
                detections.forEach((detection, index) => {
                    const rawBox = detection.box;

                    // Apply smoothing to the box position and dimensions
                    const box = smoothPosition(
                        {
                            x: rawBox.x,
                            y: rawBox.y,
                            width: rawBox.width,
                            height: rawBox.height
                        },
                        index
                    );

                    // Draw debug bounding box if enabled
                    if (showDebugBox) {
                        ctx.strokeStyle = '#00ff00';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(box.x, box.y, box.width, box.height);
                    }

                    // Get chef hat and shirt images
                    const chefHat = chefHatRef.current;
                    const chefShirt = chefShirtRef.current;

                    if (chefHat && chefShirt) {
                        // Position chef hat above the face
                        const hatWidth = box.width * 1.5;
                        const hatHeight = hatWidth * (chefHat.height / chefHat.width);
                        const hatX = box.x - (hatWidth - box.width) / 2;
                        const hatY = box.y - hatHeight * 0.9;

                        // Draw chef hat
                        ctx.drawImage(chefHat, hatX, hatY, hatWidth, hatHeight);

                        // Position chef shirt below the face
                        const shirtWidth = box.width * 2.5;
                        const shirtHeight = shirtWidth * (chefShirt.height / chefShirt.width);
                        const shirtX = box.x - (shirtWidth - box.width) / 2;
                        const shirtY = box.y + box.height;

                        // Draw chef shirt
                        ctx.drawImage(chefShirt, shirtX, shirtY, shirtWidth, shirtHeight);
                    }
                });
            } catch (error) {
                console.error('Error in face detection:', error);
            }

            // Continue the detection loop
            requestAnimationFrame(detectFaces);
        };

        // Start the detection loop
        detectFaces();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
            <h1 className="text-3xl font-bold mb-6">Face Tracking Chef</h1>

            <div className="relative">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    onPlay={handleVideoPlay}
                    className="rounded-lg shadow-lg"
                    width={640}
                    height={480}
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 z-10 rounded-lg"
                />
            </div>

            {(!modelsLoaded || !imagesLoaded) && (
                <div className="mt-4 text-lg">Loading resources, please wait...</div>
            )}

            <div className="mt-4 text-sm">
                Models: {modelsLoaded ? '✅' : '⏳'} |
                Images: {imagesLoaded ? '✅' : '⏳'} |
                Faces detected: {facesDetected}
            </div>

            <div className="mt-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={showDebugBox}
                        onChange={() => setShowDebugBox(!showDebugBox)}
                        className="h-4 w-4"
                    />
                    Show debug bounding boxes
                </label>
            </div>
        </div>
    );
} 