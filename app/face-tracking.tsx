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
                    new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
                );

                setFacesDetected(detections.length);

                // Get canvas context and clear previous drawings
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Process each detected face
                detections.forEach(detection => {
                    const box = detection.box;

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
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
        </div>
    );
} 