'use client';

import { FaceTrackingVideo } from './';
import { CardContent, CardTitle } from './ui/card';
import MotionButton from './ui/motion-button';
import MotionCard from './ui/motion-card';
import { Home, Users, Calendar, BookOpen, RefreshCw, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useRef, useEffect } from 'react';

interface ResultPageProps {
    personalityType: string;
    personalityDescription: string;
    activities: string[];
    resources: string[];
    onStartOver: () => void;
    onHome?: () => void;
}

export default function ResultPage({
    personalityType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    personalityDescription, // Kept for API consistency
    activities,
    resources,
    onStartOver,
    onHome,
}: ResultPageProps) {
    // References for GPU acceleration on individual overlays
    const multiplyRef = useRef<HTMLDivElement>(null);
    const softlightRef = useRef<HTMLDivElement>(null);
    const hardlightRef = useRef<HTMLDivElement>(null);

    // Apply GPU acceleration to overlay layers individually
    useEffect(() => {
        // Apply GPU acceleration to each overlay layer
        if (multiplyRef.current) {
            multiplyRef.current.style.transform = 'translateZ(0)';
            multiplyRef.current.style.backfaceVisibility = 'hidden';
            multiplyRef.current.style.willChange = 'transform';
        }
        
        if (softlightRef.current) {
            softlightRef.current.style.transform = 'translateZ(0)';
            softlightRef.current.style.backfaceVisibility = 'hidden';
            softlightRef.current.style.willChange = 'transform';
        }
        
        if (hardlightRef.current) {
            hardlightRef.current.style.transform = 'translateZ(0)';
            hardlightRef.current.style.backfaceVisibility = 'hidden';
            hardlightRef.current.style.willChange = 'transform';
        }
    }, []);

    return (
        <div className="flex flex-col items-center h-screen">
            <div className="w-full max-w-[800px] h-screen mx-auto flex flex-col relative px-6">
                {/* Home button */}
                <div className="absolute right-0 top-6">
                    <MotionButton
                        variant="primary"
                        size="icon"
                        className="flex items-center justify-center rounded-full"
                        onClick={onHome || onStartOver}
                    >
                        <Home size={24} />
                    </MotionButton>
                </div>

                {/* Header spanning both columns */}
                <div className="mt-20 mb-6 text-center">
                    <span className="text-2xl font-bold text-blue-600">YOU&apos;RE A</span>
                    <h1 className="text-5xl md:text-6xl font-bold text-pink-500 drop-shadow-[4px_4px_0px_rgba(255,255,255,0.5)]">
                        {personalityType.toUpperCase()}
                    </h1>
                </div>

                {/* Main content with 3:2 ratio columns */}
                <div className="grid flex-grow grid-cols-5 gap-6 mb-6">
                    {/* Left column (60%) */}
                    <div className="flex flex-col col-span-3 gap-4">
                        {/* Face tracking display - 50% height */}
                        <MotionCard
                            className="relative h-[50%] p-0 overflow-hidden"
                            interactive={false}
                        >
                            <div className="relative w-full h-full">
                                <FaceTrackingVideo personalityType={personalityType.toLowerCase()} />
                                
                                {/* Individual overlays with direct blend modes */}
                                <div 
                                    ref={multiplyRef}
                                    className="absolute inset-0 pointer-events-none mix-blend-multiply"
                                >
                                    <Image 
                                        src="/7. multiply.png" 
                                        alt="" 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, 60vw"
                                        style={{ objectFit: 'fill' }}
                                        priority
                                    />
                                </div>
                                
                                <div 
                                    ref={softlightRef}
                                    className="absolute inset-0 pointer-events-none mix-blend-soft-light"
                                >
                                    <Image 
                                        src="/2. softlight.png" 
                                        alt="" 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, 60vw"
                                        style={{ objectFit: 'fill' }}
                                        priority
                                    />
                                </div>
                                
                                <div 
                                    ref={hardlightRef}
                                    className="absolute inset-0 pointer-events-none mix-blend-hard-light"
                                >
                                    <Image 
                                        src="/1. hardlight.png" 
                                        alt="" 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, 60vw"
                                        style={{ objectFit: 'fill' }}
                                        priority
                                    />
                                </div>
                            </div>
                        </MotionCard>

                        {/* Places to go section */}
                        <MotionCard
                            className="flex-grow"
                            interactive={false}
                        >
                            <CardContent className="pt-6">
                                <CardTitle className="flex items-center mb-4">
                                    <MapPin size={24} className="mr-2" />
                                    PLACES TO GO
                                </CardTitle>
                                <div className="flex flex-col gap-4">
                                    <div className="p-4 rounded-lg bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center">
                                        <div className="bg-blue-500 text-white rounded-full p-2 mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            <MapPin size={16} />
                                        </div>
                                        Local community gardens
                                    </div>
                                </div>
                            </CardContent>
                        </MotionCard>
                    </div>

                    {/* Right column (40%) */}
                    <div className="flex flex-col col-span-2 gap-4 overflow-y-auto">
                        <MotionCard interactive={false}>
                            <CardContent className="pt-6">
                                <CardTitle className="flex items-center mb-4">
                                    <Users size={24} className="mr-2" />
                                    FIND YOUR BUDDIES
                                </CardTitle>
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2].map((buddy) => (
                                        <div
                                            key={buddy}
                                            className="aspect-square rounded-full bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </MotionCard>

                        <MotionCard interactive={false}>
                            <CardContent className="pt-6">
                                <CardTitle className="flex items-center mb-4">
                                    <Calendar size={24} className="mr-2" />
                                    ACTIVITIES
                                </CardTitle>
                                <div className="flex flex-col gap-4">
                                    {activities.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center"
                                        >
                                            <div className="bg-pink-500 text-white rounded-full p-2 mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <Calendar size={16} />
                                            </div>
                                            {activity}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </MotionCard>

                        <MotionCard interactive={false}>
                            <CardContent className="pt-6">
                                <CardTitle className="flex items-center mb-4">
                                    <BookOpen size={24} className="mr-2" />
                                    RESOURCES
                                </CardTitle>
                                <div className="flex flex-col gap-4">
                                    {resources.map((resource, index) => (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center"
                                        >
                                            <div className="bg-blue-500 text-white rounded-full p-2 mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <BookOpen size={16} />
                                            </div>
                                            {resource}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </MotionCard>
                    </div>
                </div>

                {/* Start over button spanning both columns at the bottom */}
                <MotionButton
                    onClick={onStartOver}
                    size="lg"
                    className="w-full mb-6"
                >
                    <RefreshCw size={20} className="mr-2" />
                    Start Over
                </MotionButton>
            </div>
        </div>
    );
} 