'use client';

import { FaceTrackingVideo } from './';
import { CardContent, CardTitle } from './ui/card';
import MotionButton from './ui/motion-button';
import MotionCard from './ui/motion-card';
import { Home, Users, Calendar, BookOpen, RefreshCw, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useRef, useEffect, useMemo } from 'react';
import personalityData from '../data/personality.json';
import BuddyCard from './ui/buddy-card';

interface Buddy {
    personality: string;
}

interface PersonalityData {
    personality_en: string;
    personality_cn: string;
    activity: string;
    buddy_reason: string;
    buddies: Buddy[];
}

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

    // Get current personality data
    const currentPersonality = useMemo(() => {
        return personalityData.find(
            (p: PersonalityData) => p.personality_en.toLowerCase() === personalityType.toLowerCase()
        );
    }, [personalityType]);

    // Get buddies from personality data
    const currentBuddies = useMemo(() => {
        return currentPersonality?.buddies || [];
    }, [currentPersonality]);

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
        <div className="flex flex-col items-center h-full p-6 lg:p-12">
            <div className="relative flex flex-col w-full h-full max-w-[1200px] mx-auto items-center justify-center">
                {/* Home button */}
                <div className="absolute right-0 top-6 lg:top-12">
                    <MotionButton
                        variant="primary"
                        size="icon"
                        className="flex items-center justify-center w-16 h-16 rounded-full sm:h-20 lg:h-24 sm:w-20 lg:w-24"
                        onClick={onHome || onStartOver}
                    >
                        <Home className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12" />
                    </MotionButton>
                </div>

                {/* Header spanning both columns */}
                <div className="mb-6 text-center md:mb-16">
                    <span className="text-2xl font-bold text-blue-600 sm:text-3xl lg:text-4xl font-title title-shadow">
                        {personalityType.toLowerCase() === 'art maestro' ? 'YOU\'RE AN' : 'YOU\'RE A'}
                    </span>
                    <h1 className="text-5xl font-bold text-pink-500 sm:text-7xl lg:text-8xl font-title title-shadow">
                        {personalityType.toUpperCase()}
                    </h1>
                </div>

                {/* Main content with 3:2 ratio columns */}
                <div className="grid w-full grid-cols-5 gap-6 mb-6 h-2/3 grid-rows-8 lg:mb-12">
                    {/* Left column (60%) */}
                    <div className="flex flex-col col-span-3 gap-4 row-span-full md:gap-6">
                        {/* Face tracking display - 5/8 height */}
                        <MotionCard
                            className="relative h-[62.5%] p-0 overflow-hidden"
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

                        {/* Places to go section - 3/8 height */}
                        <MotionCard
                            className="flex-grow"
                            interactive={false}
                        >
                            <CardContent className="pt-6 lg:pt-8">
                                <CardTitle className="flex items-center mb-4 text-md sm:text-lg lg:text-xl">
                                    <Users className="w-4 h-4 mr-2 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                                    FIND YOUR BUDDIES
                                </CardTitle>
                                <div className="flex flex-col gap-2 md:gap-4">
                                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                                        {currentBuddies.map((buddy: Buddy, index: number) => (
                                            <BuddyCard
                                                key={index}
                                                personality={buddy.personality}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {currentPersonality?.buddy_reason}
                                    </p>
                                </div>
                            </CardContent>
                        </MotionCard>
                    </div>

                    {/* Right column (40%) */}
                    <div className="flex flex-col col-span-2 gap-4 pr-1 overflow-hidden row-span-full md:gap-6">
                        {/* Find your buddies - 2/8 height */}
                        <MotionCard
                            className="h-[25%]"
                            interactive={false}
                        >
                            <CardContent className="pt-6 lg:pt-8">
                                <CardTitle className="flex items-center mb-4 text-md sm:text-lg lg:text-xl">
                                    <MapPin className="w-4 h-4 mr-2 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                                    PLACES TO GO
                                </CardTitle>
                                <div className="flex flex-col gap-4 md:gap-6">
                                    <div className="flex items-center p-4 text-lg border-2 border-black rounded-lg sm:text-xl lg:text-2xl sm:p-6 lg:p-8 bg-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="flex items-center justify-center p-2 mr-3 text-white bg-blue-500 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                                        </div>
                                        Local community gardens
                                    </div>
                                </div>
                            </CardContent>
                        </MotionCard>

                        {/* Activities - 3/8 height */}
                        <MotionCard
                            className="h-[37.5%] overflow-y-auto"
                            interactive={false}
                        >
                            <CardContent className="pt-6 lg:pt-8">
                                <CardTitle className="flex items-center mb-4 text-md sm:text-lg lg:text-xl">
                                    <Calendar className="w-4 h-4 mr-2 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                                    ACTIVITIES
                                </CardTitle>
                                <div className="flex flex-col gap-4 md:gap-6">
                                    {activities.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center p-4 text-lg border-2 border-black rounded-lg sm:text-xl lg:text-2xl sm:p-6 lg:p-8 bg-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                        >
                                            <div className="flex items-center justify-center p-2 mr-3 text-white bg-pink-500 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                                            </div>
                                            {activity}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </MotionCard>

                        {/* Resources - 3/8 height */}
                        <MotionCard
                            className="h-[37.5%] overflow-y-auto"
                            interactive={false}
                        >
                            <CardContent className="pt-6 lg:pt-8">
                                <CardTitle className="flex items-center mb-4 text-md sm:text-lg lg:text-xl">
                                    <BookOpen className="w-4 h-4 mr-2 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                                    RESOURCES
                                </CardTitle>
                                <div className="flex flex-col gap-4 md:gap-6">
                                    {resources.map((resource, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center p-4 text-lg border-2 border-black rounded-lg sm:text-xl lg:text-2xl sm:p-6 lg:p-8 bg-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                        >
                                            <div className="flex items-center justify-center p-2 mr-3 text-white bg-blue-500 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
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
                    className="w-full h-16 text-lg sm:h-20 lg:h-24 sm:text-xl lg:text-3xl"
                >
                    <RefreshCw className="w-5 h-5 mr-2 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                    Start Over
                </MotionButton>
            </div>
        </div>
    );
} 