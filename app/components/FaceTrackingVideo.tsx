'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
    const containerRef = useRef<HTMLDivElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const trackedFacesRef = useRef<TrackedFace[]>([]);
    const nextIdRef = useRef(0);
    const prevPositionsRef = useRef<Array<{ x: number; y: number; width: number; height: number }>>([]);
    const [hatImage, setHatImage] = useState<HTMLImageElement | null>(null);
    const [shirtImage, setShirtImage] = useState<HTMLImageElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0, scale: 1 });

    // Target aspect ratio (2:3)
    const TARGET_ASPECT_RATIO = 2/3;

    // Calculate dimensions and scale based on container size
    const updateDimensions = useCallback(() => {
        if (!containerRef.current || !videoRef.current) return;

        const container = containerRef.current;
        const video = videoRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const containerAspect = containerWidth / containerHeight;

        let width, height;

        // If container is wider than target aspect
        if (containerAspect > TARGET_ASPECT_RATIO) {
            height = containerHeight;
            width = height * TARGET_ASPECT_RATIO;
        } else {
            width = containerWidth;
            height = width / TARGET_ASPECT_RATIO;
        }

        // Calculate scale between video and display dimensions
        const videoAspect = video.videoWidth / video.videoHeight;
        let videoDisplayWidth, videoDisplayHeight;

        if (videoAspect > TARGET_ASPECT_RATIO) {
            // Video is wider than container
            videoDisplayHeight = height;
            videoDisplayWidth = videoDisplayHeight * videoAspect;
        } else {
            // Video is taller than container
            videoDisplayWidth = width;
            videoDisplayHeight = videoDisplayWidth / videoAspect;
        }

        const scale = width / videoDisplayWidth;

        setDimensions({ width, height, scale });

        // Update canvas size
        if (canvasRef.current) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
        }
    }, [TARGET_ASPECT_RATIO]);

    // Start the webcam
    const startVideo = useCallback(async () => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
                setStream(newStream);
                
                // Wait for video metadata to load then update dimensions
                videoRef.current.onloadedmetadata = updateDimensions;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    }, [updateDimensions]);

    // Update dimensions on resize
    useEffect(() => {
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [updateDimensions]);

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

    // Start video when models and images are loaded
    useEffect(() => {
        if (modelsLoaded && imagesLoaded) {
            startVideo();
        }
    }, [modelsLoaded, imagesLoaded, startVideo]);

    // Cleanup function for video stream
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Function to smoothly interpolate between previous and current values
    const smoothPosition = (
        current: { x: number; y: number; width: number; height: number },
        index: number
    ) => {
        if (!prevPositionsRef.current[index]) {
            prevPositionsRef.current[index] = { ...current };
            return current;
        }

        const prev = prevPositionsRef.current[index];
        const positionEasing = 0.15; // Weaker position smoothing (was 0.3)
        const scaleEasing = 0.7;    // Stronger scale smoothing

        // Apply different easing values for position and scale
        const smoothed = {
            // Position uses weaker smoothing for more responsive movement
            x: prev.x + positionEasing * (current.x - prev.x),
            y: prev.y + positionEasing * (current.y - prev.y),
            // Scale uses stronger smoothing for more stable size changes
            width: prev.width + scaleEasing * (current.width - prev.width),
            height: prev.height + scaleEasing * (current.height - prev.height)
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

        // Create face detection loop
        const detectFaces = async () => {
            if (!video || !canvas) return;

            try {
                // Calculate the center crop region of the video
                const videoAspect = video.videoWidth / video.videoHeight;
                let cropX = 0, cropY = 0, cropWidth = video.videoWidth, cropHeight = video.videoHeight;

                if (videoAspect > TARGET_ASPECT_RATIO) {
                    // Video is wider - crop sides
                    cropWidth = video.videoHeight * TARGET_ASPECT_RATIO;
                    cropX = (video.videoWidth - cropWidth) / 2;
                } else {
                    // Video is taller - crop top/bottom
                    cropHeight = video.videoWidth / TARGET_ASPECT_RATIO;
                    cropY = (video.videoHeight - cropHeight) / 2;
                }

                // Create a temporary canvas for the cropped and mirrored video
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = cropWidth;
                tempCanvas.height = cropHeight;
                const tempCtx = tempCanvas.getContext('2d');
                if (!tempCtx) return;

                // Set up mirroring transform for detection input
                tempCtx.translate(cropWidth, 0);
                tempCtx.scale(-1, 1);

                // Draw the cropped and mirrored region
                tempCtx.drawImage(video, 
                    cropX, cropY, cropWidth, cropHeight,
                    0, 0, cropWidth, cropHeight
                );

                // Detect faces on the cropped region
                const detections = await faceapi.detectAllFaces(
                    tempCanvas,
                    new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
                );

                const persistentFaces = updateTrackedFaces(detections);
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (prevPositionsRef.current.length > persistentFaces.length) {
                    prevPositionsRef.current = prevPositionsRef.current.slice(0, persistentFaces.length);
                }

                // Scale factor between cropped video and display
                const scaleX = canvas.width / cropWidth;
                const scaleY = canvas.height / cropHeight;

                persistentFaces.forEach((face, index) => {
                    const rawBox = face.box;
                    
                    // Scale the detection box to match display dimensions
                    // Note: x position is already mirrored from detection stage
                    const scaledBox = {
                        x: rawBox.x * scaleX,
                        y: rawBox.y * scaleY,
                        width: rawBox.width * scaleX,
                        height: rawBox.height * scaleY
                    };

                    const box = smoothPosition(scaledBox, index);

                    const hat = hatImage;
                    const shirt = shirtImage;

                    if (hat && shirt) {
                        // Position hat above the face
                        const hatWidth = box.width * 1.5;
                        const hatHeight = hatWidth * (hat.height / hat.width);
                        const hatX = box.x - (hatWidth - box.width) / 2;
                        const hatY = box.y - hatHeight * 0.9;

                        // Draw hat
                        ctx.drawImage(hat, hatX, hatY, hatWidth, hatHeight);

                        // Position shirt below the face
                        const shirtWidth = box.width * 2.5;
                        const shirtHeight = shirtWidth * (shirt.height / shirt.width);
                        const shirtX = box.x - (shirtWidth - box.width) / 2;
                        const shirtY = box.y + box.height;

                        // Draw shirt
                        ctx.drawImage(shirt, shirtX, shirtY, shirtWidth, shirtHeight);
                    }
                });

            } catch (error) {
                console.error('Error in face detection:', error);
            }

            requestAnimationFrame(detectFaces);
        };

        detectFaces();
    };

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden">
            <div 
                className="relative w-full h-full"
                style={{
                    width: dimensions.width,
                    height: dimensions.height,
                    margin: '0 auto'
                }}
            >
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    onPlay={handleVideoPlay}
                    className="absolute top-0 left-0 object-cover w-full h-full"
                    style={{
                        objectFit: 'cover',
                        transform: 'scaleX(-1)' // Mirror the video display
                    }}
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                />
                {(!modelsLoaded || !imagesLoaded) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="p-4 bg-white border-2 border-black rounded-lg">
                            Loading camera...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 