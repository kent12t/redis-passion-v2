'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
// Remove the direct import
// import * as faceapi from '@vladmandic/face-api';

// Global state to track if models are loaded across component instances
let globalModelsLoaded = false;
let globalModelLoadingPromise: Promise<void> | null = null;

// Global video stream management
let globalVideoStream: MediaStream | null = null;
let globalStreamPromise: Promise<MediaStream> | null = null;
let activeComponentId: string | null = null;
let releaseTimeout: NodeJS.Timeout | null = null;

// Function to get or create video stream globally
const getGlobalVideoStream = async (componentId: string): Promise<MediaStream | null> => {
    // Clear any pending release timeout since a component wants the stream
    if (releaseTimeout) {
        clearTimeout(releaseTimeout);
        releaseTimeout = null;
        console.log('FaceTrackingVideo: Cancelled pending stream release');
    }

    // If there's already an active component, don't interfere
    if (activeComponentId && activeComponentId !== componentId) {
        console.log('FaceTrackingVideo: Another component is using the camera');
        return null;
    }

    // If we already have a stream, return it
    if (globalVideoStream && globalVideoStream.active) {
        console.log('FaceTrackingVideo: Reusing existing global video stream');
        activeComponentId = componentId;
        return globalVideoStream;
    }

    // If we're already getting a stream, wait for it
    if (globalStreamPromise) {
        console.log('FaceTrackingVideo: Waiting for existing stream request...');
        const stream = await globalStreamPromise;
        if (stream && stream.active) {
            activeComponentId = componentId;
            return stream;
        }
    }

    // Create new stream
    console.log('FaceTrackingVideo: Creating new global video stream...');
    globalStreamPromise = navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    });

    try {
        globalVideoStream = await globalStreamPromise;
        activeComponentId = componentId;
        console.log('FaceTrackingVideo: Global video stream created successfully');
        return globalVideoStream;
    } catch (error) {
        console.error('FaceTrackingVideo: Error creating global video stream:', error);
        globalStreamPromise = null;
        return null;
    }
};

// Function to release video stream globally with delay for React development mode
const releaseGlobalVideoStream = (componentId: string) => {
    if (activeComponentId !== componentId) {
        console.log('FaceTrackingVideo: Not the active component, ignoring stream release');
        return;
    }

    console.log('FaceTrackingVideo: Scheduling global video stream release in 1 second...');
    
    // Clear any existing timeout
    if (releaseTimeout) {
        clearTimeout(releaseTimeout);
    }
    
    // Delay the actual release to handle React development mode re-mounting
    releaseTimeout = setTimeout(() => {
        console.log('FaceTrackingVideo: Executing delayed stream release');
        if (globalVideoStream) {
            globalVideoStream.getTracks().forEach(track => track.stop());
            globalVideoStream = null;
        }
        globalStreamPromise = null;
        activeComponentId = null;
        releaseTimeout = null;
    }, 1000); // 1 second delay
};

// Function to load models globally
const loadFaceApiModels = async () => {
    if (globalModelsLoaded) {
        console.log('FaceTrackingVideo: Models already loaded globally');
        return;
    }

    if (globalModelLoadingPromise) {
        console.log('FaceTrackingVideo: Models already loading, waiting...');
        await globalModelLoadingPromise;
        return;
    }

    console.log('FaceTrackingVideo: Starting global model loading...');
    globalModelLoadingPromise = (async () => {
        try {
            const faceapi = await import('@vladmandic/face-api');
            const MODEL_URL = '/models';
            
            console.log('Face-API Version:', faceapi.version);
            console.log('TensorFlow Version:', faceapi.tf?.version);
            console.log('FaceTrackingVideo: Loading SSD MobileNetV1 model from:', MODEL_URL);
            
            await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
            
            globalModelsLoaded = true;
            console.log('Face detection models loaded successfully (global)');
        } catch (error) {
            console.error('FaceTrackingVideo: Error loading models (global):', error);
            globalModelLoadingPromise = null; // Reset on error to allow retry
            throw error;
        }
    })();

    await globalModelLoadingPromise;
};

// Define types we need
interface FaceDetection {
    box: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    score: number;
}

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
    velocity?: {
        x: number;
        y: number;
    };
    confidence: number;
}

interface FaceTrackingVideoProps {
    personalityType: string;
}

// Personality type to asset mapping
const personalityAssets = {
    "wellness warrior": {
        hat: '/costume/runner-hat.png',
        shirt: '/costume/runner-shirt.png'
    },
    "art maestro": {
        hat: '/costume/artist-hat.png',
        shirt: '/costume/artist-shirt.png'
    },
    "wise storyteller": {
        hat: '/costume/storyteller-hat.png',
        shirt: '/costume/storyteller-shirt.png'
    },
    "master chef": {
        hat: '/costume/chef-hat.png',
        shirt: '/costume/chef-shirt.png'
    },
    "tree whisperer": {
        hat: '/costume/farmer-hat.png',
        shirt: '/costume/farmer-shirt.png'
    },
    "community champion": {
        hat: '/costume/volunteer-hat.png',
        shirt: '/costume/volunteer-shirt.png'
    }
} as const;

const debugMode = false;
// Confidence thresholds
const INITIAL_DETECTION_THRESHOLD = 0.65; // Higher threshold for new faces
const TRACKING_CONFIDENCE_THRESHOLD = 0.4; // Existing threshold for continuous tracking

export default function FaceTrackingVideo({
    personalityType
}: FaceTrackingVideoProps) {
    console.log('FaceTrackingVideo: Component mounting for personality:', personalityType);
    
    // Generate unique component ID
    const componentId = useRef(`face-tracking-${Date.now()}-${Math.random()}`).current;
    console.log('FaceTrackingVideo: Component ID:', componentId);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const trackedFacesRef = useRef<TrackedFace[]>([]);
    const nextIdRef = useRef(0);
    const prevPositionsRef = useRef<Array<{ x: number; y: number; width: number; height: number }>>([]);
    const [hatImage, setHatImage] = useState<HTMLImageElement | null>(null);
    const [shirtImage, setShirtImage] = useState<HTMLImageElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0, scale: 1 });
    // Add ref for scale smoothing
    const prevScaleRef = useRef<number>(1);
    const scaleBufferRef = useRef<number[]>([]);
    const SCALE_BUFFER_SIZE = 10; // Number of frames to average

    // Add refs for cleanup management
    const animationFrameRef = useRef<number | null>(null);
    const isActiveRef = useRef<boolean>(true);
    const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
    
    // Add a mounting ref to track if this is the initial mount
    const isMountedRef = useRef<boolean>(false);
    
    // Set mounted flag on first mount
    useEffect(() => {
        console.log('FaceTrackingVideo: Initial mount effect, setting mounted flag for:', componentId);
        isMountedRef.current = true;
        isActiveRef.current = true;
        
        return () => {
            console.log('FaceTrackingVideo: Component unmounting, clearing mounted flag for:', componentId);
            isMountedRef.current = false;
            isActiveRef.current = false;
            // Release the global video stream when component unmounts
            releaseGlobalVideoStream(componentId);
        };
    }, [componentId]);

    // Target aspect ratio
    const TARGET_ASPECT_RATIO = 0.566;

    // Calculate dimensions and scale based on container size
    const updateDimensions = useCallback(() => {
        if (!containerRef.current || !videoRef.current || !isActiveRef.current) return;

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
        console.log('FaceTrackingVideo: startVideo called, isActive:', isActiveRef.current, 'componentId:', componentId);
        if (!isActiveRef.current) return;

        try {
            console.log('FaceTrackingVideo: Requesting camera access via global stream...');
            const newStream = await getGlobalVideoStream(componentId);

            if (!newStream) {
                console.log('FaceTrackingVideo: Could not get global video stream');
                return;
            }

            if (!isActiveRef.current) {
                // Component was unmounted during async operation
                console.log('FaceTrackingVideo: Component became inactive during camera access');
                return;
            }

            console.log('FaceTrackingVideo: Camera access granted, setting up video...');
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;

                // Wait for video metadata to load then update dimensions
                videoRef.current.onloadedmetadata = updateDimensions;
            }
        } catch (error) {
            console.error('FaceTrackingVideo: Error accessing camera:', error);
        }
    }, [updateDimensions, componentId]);

    // Update dimensions on resize
    useEffect(() => {
        const resizeHandler = () => {
            if (isActiveRef.current) {
                updateDimensions();
            }
        };

        window.addEventListener('resize', resizeHandler);
        return () => window.removeEventListener('resize', resizeHandler);
    }, [updateDimensions]);

    // Load personality-specific assets
    useEffect(() => {
        console.log('FaceTrackingVideo: Loading assets for personality:', personalityType);
        if (!isActiveRef.current || !isMountedRef.current) {
            console.log('FaceTrackingVideo: Component not active or mounted, skipping asset loading');
            return;
        }

        const assets = personalityAssets[personalityType as keyof typeof personalityAssets];
        if (!assets) {
            console.log('FaceTrackingVideo: No assets found for personality:', personalityType);
            return;
        }

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
            if (isActiveRef.current && isMountedRef.current) {
                console.log('FaceTrackingVideo: Assets loaded successfully');
                setHatImage(hat);
                setShirtImage(shirt);
                setImagesLoaded(true);
            } else {
                console.log('FaceTrackingVideo: Component became inactive during asset loading');
            }
        }).catch((error) => {
            console.error('FaceTrackingVideo: Error loading assets:', error);
        });
    }, [personalityType]);

    // Load face-api.js models
    useEffect(() => {
        console.log('FaceTrackingVideo: Model loading effect triggered');
        // Flag to track if the effect has been cleaned up
        let isActive = true;
        
        const loadModels = async () => {
            console.log('FaceTrackingVideo: Starting model loading...');
            try {
                await loadFaceApiModels();
                
                console.log('FaceTrackingVideo: Models loaded, checking component state...');
                if (isActive && isActiveRef.current && isMountedRef.current) {
                    console.log('FaceTrackingVideo: Setting modelsLoaded to true');
                    setModelsLoaded(true);
                } else {
                    console.log('FaceTrackingVideo: Component became inactive after model loading');
                }
            } catch (error) {
                console.error('FaceTrackingVideo: Error loading models:', error);
            }
        };

        // Only run on the client side
        if (typeof window !== 'undefined') {
            console.log('FaceTrackingVideo: Client side detected, calling loadModels');
            loadModels();
        } else {
            console.log('FaceTrackingVideo: Server side, skipping model loading');
        }

        // Cleanup function
        return () => {
            console.log('FaceTrackingVideo: Model loading effect cleanup');
            isActive = false;
        };
    }, []);

    // Start video when models and images are loaded
    useEffect(() => {
        console.log('FaceTrackingVideo: Checking if ready to start video - models:', modelsLoaded, 'images:', imagesLoaded, 'active:', isActiveRef.current, 'mounted:', isMountedRef.current);
        if (modelsLoaded && imagesLoaded && isActiveRef.current && isMountedRef.current) {
            console.log('FaceTrackingVideo: All conditions met, waiting 100ms before starting video...');
            // Add a small delay to ensure component is fully stable
            const timeout = setTimeout(() => {
                if (isActiveRef.current && isMountedRef.current) {
                    console.log('FaceTrackingVideo: Starting video after delay...');
                    startVideo();
                } else {
                    console.log('FaceTrackingVideo: Component became inactive during delay');
                }
            }, 100);

            return () => clearTimeout(timeout);
        }
    }, [modelsLoaded, imagesLoaded, startVideo]);

    // Main cleanup effect - runs when component unmounts
    useEffect(() => {
        // Capture current ref values to avoid stale closure issues
        const currentVideo = videoRef.current;
        const currentCanvas = canvasRef.current;
        const currentTempCanvas = tempCanvasRef.current;
        
        // This effect should only return the cleanup function, not run cleanup on mount
        return () => {
            console.log('FaceTrackingVideo: Component unmounting, starting cleanup for:', componentId);
            
            // Mark component as inactive to prevent new operations
            isActiveRef.current = false;

            // Stop animation frame
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            // Clean up video element using captured ref
            if (currentVideo) {
                currentVideo.pause();
                currentVideo.srcObject = null;
                currentVideo.onloadedmetadata = null;
                currentVideo.onplay = null;
            }

            // Clean up temporary canvas using captured ref
            if (currentTempCanvas) {
                const ctx = currentTempCanvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, currentTempCanvas.width, currentTempCanvas.height);
                }
                tempCanvasRef.current = null;
            }

            // Clear canvas using captured ref
            if (currentCanvas) {
                const ctx = currentCanvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
                }
            }

            // Reset all refs
            trackedFacesRef.current = [];
            nextIdRef.current = 0;
            prevPositionsRef.current = [];
            prevScaleRef.current = 1;
            scaleBufferRef.current = [];

            console.log('FaceTrackingVideo: Cleanup completed for:', componentId);
        };
    }, [componentId]); // Remove stream dependency as it's managed globally

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
        const scaleEasing = 0.8;    // Stronger scale smoothing

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

    // Calculate similarity score between two faces
    const calculateSimilarity = (face1: TrackedFace, detection: FaceDetection) => {
        const center1 = getBoxCenter(face1.box);
        const center2 = getBoxCenter(detection.box);
        
        // If face has velocity, predict its position
        const predictedCenter = face1.velocity ? {
            x: center1.x + (face1.velocity.x * (Date.now() - face1.lastSeen) / 1000),
            y: center1.y + (face1.velocity.y * (Date.now() - face1.lastSeen) / 1000)
        } : center1;

        // Distance score (0-1, where 1 is closest)
        const distanceScore = 1 / (1 + Math.sqrt(getDistanceSquared(predictedCenter, center2)) / detection.box.width);
        
        // Size similarity score (0-1, where 1 is most similar)
        const sizeDiff = Math.abs(face1.box.width - detection.box.width) / Math.max(face1.box.width, detection.box.width);
        const sizeScore = 1 - sizeDiff;

        // Combine scores with weights
        return distanceScore * 0.7 + sizeScore * 0.3;
    };

    // Assign detections to tracked faces or create new tracked faces
    const updateTrackedFaces = (detections: FaceDetection[]) => {
        const currentTime = Date.now();
        const trackedFaces = [...trackedFacesRef.current];
        const activeFaces = trackedFaces.filter(face => currentTime - face.lastSeen < 1000);
        const assignedFaceIndices = new Set<number>();
        const newAssignments: TrackedFace[] = [];

        // Sort detections by size (larger faces first, as they're likely closer and more reliable)
        const sortedDetections = [...detections].sort((a, b) => 
            (b.box.width * b.box.height) - (a.box.width * a.box.height)
        );

        sortedDetections.forEach(detection => {
            let bestMatch = {
                index: -1,
                similarity: 0
            };

            // Find best matching face
            activeFaces.forEach((face, index) => {
                if (assignedFaceIndices.has(index)) return;

                const similarity = calculateSimilarity(face, detection);
                if (similarity > bestMatch.similarity && similarity > TRACKING_CONFIDENCE_THRESHOLD) { // Using tracking threshold for continuous tracking
                    bestMatch = { index, similarity };
                }
            });

            if (bestMatch.index !== -1) {
                const face = activeFaces[bestMatch.index];
                const timeDelta = (currentTime - face.lastSeen) / 1000; // Convert to seconds

                // Update velocity
                const oldCenter = getBoxCenter(face.box);
                const newCenter = getBoxCenter(detection.box);
                const velocity = {
                    x: (newCenter.x - oldCenter.x) / timeDelta,
                    y: (newCenter.y - oldCenter.y) / timeDelta
                };

                // Update face data
                face.lastSeen = currentTime;
                face.box = detection.box;
                face.velocity = velocity;
                face.confidence = bestMatch.similarity;
                assignedFaceIndices.add(bestMatch.index);
                newAssignments.push(face);
            } else {
                // Create new tracked face
                newAssignments.push({
                    id: nextIdRef.current++,
                    lastSeen: currentTime,
                    box: detection.box,
                    confidence: 1, // New faces start with full confidence
                });
            }
        });

        trackedFacesRef.current = newAssignments;
        return newAssignments;
    };

    // Add scale smoothing function
    const smoothScale = useCallback((newScale: number) => {
        const buffer = scaleBufferRef.current;

        // Add new scale to buffer
        buffer.push(newScale);
        if (buffer.length > SCALE_BUFFER_SIZE) {
            buffer.shift();
        }

        // Calculate weighted moving average
        // Recent values have more weight
        let weightedSum = 0;
        let weightSum = 0;
        buffer.forEach((scale, index) => {
            const weight = index + 1;
            weightedSum += scale * weight;
            weightSum += weight;
        });

        const smoothedScale = weightedSum / weightSum;
        prevScaleRef.current = smoothedScale;
        return smoothedScale;
    }, []);

    // Handle video playback and face detection
    const handleVideoPlay = () => {
        if (!videoRef.current || !canvasRef.current || !modelsLoaded || !imagesLoaded || !isActiveRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Create face detection loop
        const detectFaces = async () => {
            // Check if component is still active before processing
            if (!video || !canvas || !isActiveRef.current) return;

            try {
                // Dynamically import face-api for each detection cycle
                const { detectAllFaces, SsdMobilenetv1Options } = await import('@vladmandic/face-api');

                // Double-check active state after async import
                if (!isActiveRef.current) return;

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

                // Reuse or create temporary canvas
                if (!tempCanvasRef.current) {
                    tempCanvasRef.current = document.createElement('canvas');
                }
                const tempCanvas = tempCanvasRef.current;
                tempCanvas.width = cropWidth;
                tempCanvas.height = cropHeight;
                const tempCtx = tempCanvas.getContext('2d');
                if (!tempCtx || !isActiveRef.current) return;

                // Set up mirroring transform for detection input
                tempCtx.save(); // Save the context state
                tempCtx.translate(cropWidth, 0);
                tempCtx.scale(-1, 1);

                // Draw the cropped and mirrored region
                tempCtx.drawImage(video,
                    cropX, cropY, cropWidth, cropHeight,
                    0, 0, cropWidth, cropHeight
                );

                tempCtx.restore(); // Restore the context state

                // Check active state before expensive detection
                if (!isActiveRef.current) return;

                // Detect faces on the cropped region
                const detections = await detectAllFaces(
                    tempCanvas,
                    new SsdMobilenetv1Options({ minConfidence: INITIAL_DETECTION_THRESHOLD })
                );

                // Final check before processing results
                if (!isActiveRef.current) return;

                // Cast the detections to our simplified FaceDetection interface
                const simplifiedDetections: FaceDetection[] = detections.map(d => ({
                    box: d.box,
                    score: d.score
                }));

                const persistentFaces = updateTrackedFaces(simplifiedDetections);
                const ctx = canvas.getContext('2d');
                if (!ctx || !isActiveRef.current) return;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (prevPositionsRef.current.length > persistentFaces.length) {
                    prevPositionsRef.current = prevPositionsRef.current.slice(0, persistentFaces.length);
                }

                // Scale factor between cropped video and display
                const scaleX = canvas.width / cropWidth;
                const scaleY = canvas.height / cropHeight;

                persistentFaces.forEach((face, index) => {
                    if (!isActiveRef.current) return;

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

                    if (hat && shirt && isActiveRef.current) {
                        // Calculate base scale factor based on face size relative to canvas
                        const faceArea = box.width * box.height;
                        const canvasArea = canvas.width * canvas.height;
                        const rawFaceScale = Math.sqrt(faceArea / canvasArea);

                        // Apply temporal smoothing to scale
                        const faceScale = smoothScale(rawFaceScale);

                        // Scale multipliers - adjust these to fine-tune the effect
                        const hatScaleBase = 3;
                        const shirtScaleBase = 6;

                        // Apply dynamic scaling based on face size with more conservative range
                        const hatScale = hatScaleBase * (0.8 + faceScale * 0.4); // Less conservative scaling
                        const shirtScale = shirtScaleBase * (0.8 + faceScale * 0.4);

                        if (debugMode) {
                            // Draw debug bounding box
                            ctx.strokeStyle = '#00ff00';
                            ctx.lineWidth = 2;
                            ctx.strokeRect(box.x, box.y, box.width, box.height);

                            // Add debug text for scale values
                            ctx.fillStyle = '#00ff00';
                            ctx.font = '24px Arial';
                            ctx.fillText(`Scale: ${faceScale.toFixed(2)}`, box.x, box.y - 5);
                        }

                        // Position hat above the face with dynamic scaling
                        const hatWidth = box.width * hatScale;
                        const hatHeight = hatWidth * (hat.height / hat.width);
                        const hatX = box.x - (hatWidth - box.width) / 2;
                        const hatY = box.y - box.height * 1.4;

                        // Draw hat
                        ctx.drawImage(hat, hatX, hatY, hatWidth, hatHeight);

                        // Position shirt below the face with dynamic scaling
                        const shirtWidth = box.width * shirtScale;
                        const shirtHeight = shirtWidth * (shirt.height / shirt.width);
                        const shirtX = box.x - (shirtWidth - box.width) / 2;
                        const shirtY = box.y + box.height * 0.2;

                        // Draw shirt
                        ctx.drawImage(shirt, shirtX, shirtY, shirtWidth, shirtHeight);
                    }
                });

            } catch (error) {
                console.error('Error in face detection:', error);
            }

            // Schedule next frame only if component is still active
            if (isActiveRef.current) {
                animationFrameRef.current = requestAnimationFrame(detectFaces);
            }
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