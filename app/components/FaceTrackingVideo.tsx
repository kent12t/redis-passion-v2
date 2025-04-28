'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

// Interface for tracked face data
interface TrackedFace {
    id: number;
    lastSeen: number;
    box: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

interface FaceTrackingVideoProps {
    personalityType: string;
}

// Personality type to asset mapping
const personalityAssets = {
    "wellness warrior": {
        hat: '/runner-hat.png',
        shirt: '/runner-shirt.png'
    },
    "art maestro": {
        hat: '/artist-hat.png',
        shirt: '/artist-shirt.png'
    },
    "storyteller": {
        hat: '/storyteller-hat.png',
        shirt: '/storyteller-shirt.png'
    },
    "master chef": {
        hat: '/chef-hat.png',
        shirt: '/chef-shirt.png'
    },
    "tree whisperer": {
        hat: '/farmer-hat.png',
        shirt: '/farmer-shirt.png'
    },
    "community champion": {
        hat: '/volunteer-hat.png',
        shirt: '/volunteer-shirt.png'
    }
} as const;

export default function FaceTrackingVideo({
    personalityType
}: FaceTrackingVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const trackedFacesRef = useRef<TrackedFace[]>([]);
    const nextIdRef = useRef(0);
    const prevPositionsRef = useRef<Array<{ x: number; y: number; width: number; height: number }>>([]);
    const [hatImage, setHatImage] = useState<HTMLImageElement | null>(null);
    const [shirtImage, setShirtImage] = useState<HTMLImageElement | null>(null);

    // Load personality-specific assets
    useEffect(() => {
        const assets = personalityAssets[personalityType as keyof typeof personalityAssets];
        if (!assets) return;

        const loadImage = (src: string) => {
            return new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        };

        Promise.all([
            loadImage(assets.hat),
            loadImage(assets.shirt)
        ]).then(([hat, shirt]) => {
            setHatImage(hat);
            setShirtImage(shirt);
            setImagesLoaded(true);
        }).catch(console.error);
    }, [personalityType]);

    // Load face-api.js models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                setModelsLoaded(true);
            } catch (error) {
                console.error('Error loading models:', error);
            }
        };

        loadModels();
    }, []);

    // Cleanup function for video stream
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

    // Find center point of a box
    const getBoxCenter = (box: { x: number; y: number; width: number; height: number }) => {
        return {
            x: box.x + box.width / 2,
            y: box.y + box.height / 2
        };
    };

    // Calculate squared distance between two points (faster than using Math.sqrt)
    const getDistanceSquared = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return dx * dx + dy * dy;
    };

    // Assign detections to tracked faces or create new tracked faces
    const updateTrackedFaces = (detections: faceapi.ObjectDetection[]) => {
        const currentTime = Date.now();
        const trackedFaces = [...trackedFacesRef.current];
        const activeFaces = trackedFaces.filter(face => currentTime - face.lastSeen < 1000);
        const assignedFaceIndices = new Set<number>();
        const newAssignments: TrackedFace[] = [];

        detections.forEach(detection => {
            const detectedBox = detection.box;
            const detectedCenter = getBoxCenter(detectedBox);

            let closestIndex = -1;
            let closestDistance = Number.MAX_VALUE;

            activeFaces.forEach((face, index) => {
                if (assignedFaceIndices.has(index)) return;

                const trackedCenter = getBoxCenter(face.box);
                const distance = getDistanceSquared(detectedCenter, trackedCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            const distanceThreshold = (detectedBox.width * detectedBox.width) * 2;

            if (closestIndex !== -1 && closestDistance < distanceThreshold) {
                const face = activeFaces[closestIndex];
                face.lastSeen = currentTime;
                face.box = detectedBox;
                assignedFaceIndices.add(closestIndex);
                newAssignments.push(face);
            } else {
                newAssignments.push({
                    id: nextIdRef.current++,
                    lastSeen: currentTime,
                    box: detectedBox
                });
            }
        });

        trackedFacesRef.current = newAssignments;
        return newAssignments;
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
                const detections = await faceapi.detectAllFaces(
                    video,
                    new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
                );

                const persistentFaces = updateTrackedFaces(detections);
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (prevPositionsRef.current.length > persistentFaces.length) {
                    prevPositionsRef.current = prevPositionsRef.current.slice(0, persistentFaces.length);
                }

                persistentFaces.forEach((face, index) => {
                    const rawBox = face.box;
                    const box = smoothPosition(
                        {
                            x: rawBox.x,
                            y: rawBox.y,
                            width: rawBox.width,
                            height: rawBox.height
                        },
                        index
                    );

                    const hat = hatImage;
                    const shirt = shirtImage;

                    if (hat && shirt) {
                        // Position chef hat above the face
                        const hatWidth = box.width * 1.5;
                        const hatHeight = hatWidth * (hat.height / hat.width);
                        const hatX = box.x - (hatWidth - box.width) / 2;
                        const hatY = box.y - hatHeight * 0.9;

                        // Draw chef hat
                        ctx.drawImage(hat, hatX, hatY, hatWidth, hatHeight);

                        // Position chef shirt below the face
                        const shirtWidth = box.width * 2.5;
                        const shirtHeight = shirtWidth * (shirt.height / shirt.width);
                        const shirtX = box.x - (shirtWidth - box.width) / 2;
                        const shirtY = box.y + box.height;

                        // Draw chef shirt
                        ctx.drawImage(shirt, shirtX, shirtY, shirtWidth, shirtHeight);
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
        <>
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onPlay={handleVideoPlay}
                className="w-full h-full object-cover"
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
            />
            {(!modelsLoaded || !imagesLoaded) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="bg-white p-4 rounded-lg border-2 border-black">
                        Loading camera...
                    </div>
                </div>
            )}
        </>
    );
} 