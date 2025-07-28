'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
// Remove the direct import
// import * as faceapi from '@vladmandic/face-api';

// Global state to track if models are loaded across component instances
let globalModelsLoaded = false;
let globalModelLoadingPromise: Promise<void> | null = null;

// Cache face-api module to avoid repeated dynamic imports
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let faceApiModule: Record<string, any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let faceApiModulePromise: Promise<Record<string, any>> | null = null;

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
    console.log('FaceTrackingVideo: Release request from component:', componentId, 'Active component:', activeComponentId);
    
    if (activeComponentId !== componentId) {
        console.log('FaceTrackingVideo: Not the active component, ignoring stream release');
        return;
    }

    console.log('FaceTrackingVideo: Scheduling global video stream release in 500ms...');
    
    // Clear any existing timeout
    if (releaseTimeout) {
        clearTimeout(releaseTimeout);
    }
    
    // Reduced delay to handle React development mode re-mounting but faster cleanup
    releaseTimeout = setTimeout(() => {
        console.log('FaceTrackingVideo: Executing delayed stream release');
        if (globalVideoStream) {
            globalVideoStream.getTracks().forEach(track => track.stop());
            globalVideoStream = null;
        }
        globalStreamPromise = null;
        activeComponentId = null;
        releaseTimeout = null;
        console.log('FaceTrackingVideo: Global stream fully released');
    }, 500); // Reduced to 500ms for faster cleanup
};

// Function to immediately release video stream (for emergency cleanup)
const forceReleaseGlobalVideoStream = () => {
    console.log('FaceTrackingVideo: Force releasing global video stream');
    
    // Clear any pending timeout
    if (releaseTimeout) {
        clearTimeout(releaseTimeout);
        releaseTimeout = null;
    }
    
    // Immediately stop stream
    if (globalVideoStream) {
        globalVideoStream.getTracks().forEach(track => track.stop());
        globalVideoStream = null;
    }
    globalStreamPromise = null;
    activeComponentId = null;
    console.log('FaceTrackingVideo: Force release completed');
};

// Function to get face-api module (cached to avoid HMR issues)
const getFaceApiModule = async () => {
    if (faceApiModule) {
        return faceApiModule;
    }

    if (faceApiModulePromise) {
        return await faceApiModulePromise;
    }

    faceApiModulePromise = import('@vladmandic/face-api').then(module => ({
        detectSingleFace: module.detectSingleFace,
        SsdMobilenetv1Options: module.SsdMobilenetv1Options
    }));

    faceApiModule = await faceApiModulePromise;
    return faceApiModule;
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
    stabilityFrames: number; // Track how many consecutive frames this face has been detected
    lastArea: number; // Track face area for size consistency checks
}

interface FaceTrackingVideoProps {
    personalityType: string;
    onCanvasReady?: (getCanvasData: () => { canvas: HTMLCanvasElement | null; video: HTMLVideoElement | null }) => void;
}

// Personality type to costume asset mapping
const personalityAssets = {
    "runner": '/costume/runner.png',
    "artist": '/costume/artist.png',
    "gamer": '/costume/gamer.png',
    "crafter": '/costume/crafter.png',
    "farmer": '/costume/farmer.png',
    "volunteer": '/costume/volunteer.png'
} as const;

// Costume image properties
const COSTUME_SIZE = 1800; // Original costume image size (1800x1800)
const COSTUME_FACE_CENTER = { x: 900, y: 650 }; // Face center position in costume image

// Enhanced filtering thresholds
const INITIAL_DETECTION_THRESHOLD = 0.65; // Higher threshold for new faces
const TRACKING_CONFIDENCE_THRESHOLD = 0.4; // Existing threshold for continuous tracking
const MIN_FACE_SIZE_RATIO = 0.03; // Minimum face size as ratio of video area (3%)
const MIN_FACE_PIXELS = 1600; // Minimum face area in pixels (40x40px minimum)
const FACE_STABILITY_FRAMES = 3; // Frames a face must be detected to be considered stable

export default function FaceTrackingVideo({
    personalityType,
    onCanvasReady
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
    const [costumeImage, setCostumeImage] = useState<HTMLImageElement | null>(null);
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
            
            // For quiz flow transitions, do immediate cleanup to prevent "another component using camera" issue
            if (activeComponentId === componentId) {
                forceReleaseGlobalVideoStream();
            } else {
                releaseGlobalVideoStream(componentId);
            }
        };
    }, [componentId]);

    // Target aspect ratio
    const TARGET_ASPECT_RATIO = 0.775;

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

        const costumePath = personalityAssets[personalityType as keyof typeof personalityAssets];
        if (!costumePath) {
            console.log('FaceTrackingVideo: No costume found for personality:', personalityType);
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

        loadImage(costumePath).then((costume) => {
            if (isActiveRef.current && isMountedRef.current) {
                console.log('FaceTrackingVideo: Costume loaded successfully');
                setCostumeImage(costume);
                setImagesLoaded(true);
            } else {
                console.log('FaceTrackingVideo: Component became inactive during costume loading');
            }
        }).catch((error) => {
            console.error('FaceTrackingVideo: Error loading costume:', error);
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
                    console.log('FaceTrackingVideo: Component became inactive after model loading, clearing active component');
                    // If this component became inactive and it was the active component, clear it
                    if (activeComponentId === componentId) {
                        console.log('FaceTrackingVideo: Clearing stale activeComponentId:', activeComponentId);
                        activeComponentId = null;
                    }
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
    }, [componentId]);

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
            
            // Clear active component if this was the active one
            if (activeComponentId === componentId) {
                console.log('FaceTrackingVideo: Clearing activeComponentId during cleanup:', activeComponentId);
                activeComponentId = null;
            }

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
        const scaleEasing = 0.8;

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

    // Check if face meets minimum size requirements
    const isFaceSizeValid = (detection: FaceDetection, cropWidth: number, cropHeight: number) => {
        const faceArea = detection.box.width * detection.box.height;
        const videoArea = cropWidth * cropHeight;
        const sizeRatio = faceArea / videoArea;
        
        // Face must meet both ratio and absolute pixel requirements
        return sizeRatio >= MIN_FACE_SIZE_RATIO && faceArea >= MIN_FACE_PIXELS;
    };

    // Filter detections for quality and size
    const filterValidDetections = (detections: FaceDetection[], cropWidth: number, cropHeight: number) => {
        return detections.filter(detection => {
            // Size validation
            if (!isFaceSizeValid(detection, cropWidth, cropHeight)) {
                return false;
            }
            
            // Confidence validation (already handled by face-api threshold, but double-check)
            if (detection.score < INITIAL_DETECTION_THRESHOLD) {
                return false;
            }
            
            return true;
        });
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

        // Stability bonus for faces that have been tracked longer
        const stabilityBonus = Math.min(face1.stabilityFrames / FACE_STABILITY_FRAMES, 1) * 0.1;

        // Combine scores with weights
        return distanceScore * 0.6 + sizeScore * 0.3 + stabilityBonus;
    };

    // Enhanced single face tracking with size filtering
    const updateTrackedFaces = (detections: FaceDetection[], cropWidth: number, cropHeight: number) => {
        const currentTime = Date.now();
        const trackedFaces = [...trackedFacesRef.current];
        const activeFaces = trackedFaces.filter(face => currentTime - face.lastSeen < 1000);
        
        // Filter detections for size and quality
        const validDetections = filterValidDetections(detections, cropWidth, cropHeight);
        
        // For single face tracking, select the best detection
        let bestDetection: FaceDetection | null = null;
        if (validDetections.length > 0) {
            // Sort by combined score: size (40%), confidence (40%), stability preference (20%)
            const scoredDetections = validDetections.map(detection => {
                const area = detection.box.width * detection.box.height;
                const videoArea = cropWidth * cropHeight;
                const sizeScore = Math.min(area / (videoArea * 0.1), 1); // Normalize to video area, cap at 10%
                const confidenceScore = detection.score;
                
                // Prefer faces that match existing tracked faces (stability)
                let stabilityScore = 0;
                if (activeFaces.length > 0) {
                    const bestSimilarity = Math.max(...activeFaces.map(face => 
                        calculateSimilarity(face, detection)
                    ));
                    stabilityScore = bestSimilarity > TRACKING_CONFIDENCE_THRESHOLD ? bestSimilarity : 0;
                }
                
                const combinedScore = sizeScore * 0.4 + confidenceScore * 0.4 + stabilityScore * 0.2;
                return { detection, score: combinedScore };
            });
            
            // Select the highest scoring detection
            scoredDetections.sort((a, b) => b.score - a.score);
            bestDetection = scoredDetections[0].detection;
        }
        
        // Handle single face tracking
        if (bestDetection) {
            let bestMatch: { face: TrackedFace | null; similarity: number } = { face: null, similarity: 0 };
            
            // Try to match with existing tracked face
            activeFaces.forEach(face => {
                const similarity = calculateSimilarity(face, bestDetection!);
                if (similarity > bestMatch.similarity && similarity > TRACKING_CONFIDENCE_THRESHOLD) {
                    bestMatch = { face, similarity };
                }
            });
            
            if (bestMatch.face) {
                // Update existing face
                const face = bestMatch.face;
                const timeDelta = Math.max((currentTime - face.lastSeen) / 1000, 0.033); // Minimum 30fps
                
                // Update velocity
                const oldCenter = getBoxCenter(face.box);
                const newCenter = getBoxCenter(bestDetection.box);
                const velocity = {
                    x: (newCenter.x - oldCenter.x) / timeDelta,
                    y: (newCenter.y - oldCenter.y) / timeDelta
                };
                
                // Update face data
                const newArea = bestDetection.box.width * bestDetection.box.height;
                face.lastSeen = currentTime;
                face.box = bestDetection.box;
                face.velocity = velocity;
                face.confidence = bestMatch.similarity;
                face.stabilityFrames = Math.min(face.stabilityFrames + 1, FACE_STABILITY_FRAMES * 2);
                face.lastArea = newArea;
                
                trackedFacesRef.current = [face]; // Single face tracking
                return [face];
            } else {
                // Create new tracked face
                const newArea = bestDetection.box.width * bestDetection.box.height;
                const newFace: TrackedFace = {
                    id: nextIdRef.current++,
                    lastSeen: currentTime,
                    box: bestDetection.box,
                    confidence: bestDetection.score,
                    stabilityFrames: 1,
                    lastArea: newArea
                };
                
                trackedFacesRef.current = [newFace]; // Single face tracking
                return [newFace];
            }
        } else {
            // No valid detections - clear tracking if no face for too long
            if (activeFaces.length === 0 || (activeFaces.length > 0 && currentTime - activeFaces[0].lastSeen > 2000)) {
                trackedFacesRef.current = [];
                return [];
            }
            
            // Keep the most recent face but decrease its stability
            const mostRecent = activeFaces[0];
            mostRecent.stabilityFrames = Math.max(mostRecent.stabilityFrames - 1, 0);
            trackedFacesRef.current = [mostRecent];
            return [mostRecent];
        }
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
                // Get cached face-api module to avoid HMR issues
                const { detectSingleFace, SsdMobilenetv1Options } = await getFaceApiModule();

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

                // Detect single face on the cropped region - more efficient than detectAllFaces
                const detection = await detectSingleFace(
                    tempCanvas,
                    new SsdMobilenetv1Options({ minConfidence: INITIAL_DETECTION_THRESHOLD })
                );

                // Final check before processing results
                if (!isActiveRef.current) return;

                // Convert single detection to array format for consistency with existing code
                const simplifiedDetections: FaceDetection[] = detection ? [{
                    box: detection.box,
                    score: detection.score
                }] : [];

                const persistentFaces = updateTrackedFaces(simplifiedDetections, cropWidth, cropHeight);
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

                    const costume = costumeImage;

                    if (costume && isActiveRef.current) {
                        // Calculate base scale factor based on face size relative to canvas
                        const faceArea = box.width * box.height;
                        const canvasArea = canvas.width * canvas.height;
                        const rawFaceScale = Math.sqrt(faceArea / canvasArea);

                        // Apply temporal smoothing to scale
                        const faceScale = smoothScale(rawFaceScale);

                        // Scale multiplier for costume - adjust to fine-tune the effect
                        const costumeScaleBase = 7.5; // Base scale for costume overlay

                        // Apply dynamic scaling based on face size
                        const costumeScale = costumeScaleBase * (0.7 + faceScale * 0.6);

                        // // Draw debug bounding box for detected face
                        // ctx.strokeStyle = '#00ff00';
                        // ctx.lineWidth = 2;
                        // ctx.strokeRect(box.x, box.y, box.width, box.height);

                        // // Add debug text for scale and confidence values
                        // ctx.fillStyle = '#00ff00';
                        // ctx.font = '16px Arial';
                        // ctx.fillText(`Scale: ${faceScale.toFixed(2)}`, box.x, box.y - 25);
                        // ctx.fillText(`Conf: ${face.confidence.toFixed(2)}`, box.x, box.y - 5);

                        // Calculate costume dimensions
                        const costumeWidth = box.width * costumeScale;
                        const costumeHeight = costumeWidth; // Square costume image

                        // Calculate face center in detected box
                        const faceCenterX = box.x + box.width / 2;
                        const faceCenterY = box.y + box.height / 2;

                        // Calculate offset from costume's face center to its top-left corner
                        const costumeFaceCenterOffsetX = (COSTUME_FACE_CENTER.x / COSTUME_SIZE) * costumeWidth;
                        const costumeFaceCenterOffsetY = (COSTUME_FACE_CENTER.y / COSTUME_SIZE) * costumeHeight;

                        // Adjust costume position - move it by shifting Y position
                        const verticalAdjustment = -box.height * 0.4;

                        // Position costume so its face center aligns with detected face center
                        const costumeX = faceCenterX - costumeFaceCenterOffsetX;
                        const costumeY = faceCenterY - costumeFaceCenterOffsetY - verticalAdjustment;

                        // Draw costume
                        ctx.drawImage(costume, costumeX, costumeY, costumeWidth, costumeHeight);
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

    // Expose canvas and video data to parent component
    useEffect(() => {
        if (onCanvasReady) {
            onCanvasReady(() => ({
                canvas: canvasRef.current,
                video: videoRef.current
            }));
        }
    }, [onCanvasReady]);

    return (
        <div ref={containerRef} className="overflow-hidden relative w-full h-full">
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
                    className="object-cover absolute top-0 left-0 w-full h-full"
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
                    <div className="flex absolute inset-0 justify-center items-center bg-black/30">
                        <div className="p-4 bg-white rounded-lg border-2 border-black">
                            Loading camera...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 