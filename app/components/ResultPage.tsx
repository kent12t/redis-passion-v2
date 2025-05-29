'use client';

import { FaceTrackingVideo } from './';
import { CardContent, CardTitle } from './ui/card';
import MotionButton from './ui/motion-button';
import MotionCard from './ui/motion-card';
import { Users, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import personalityData from '../data/personality.json';
import BuddyCard from './ui/buddy-card';
import Image from 'next/image';

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
    onStartOver: () => void;
    onHome?: () => void;
}

export default function ResultPage({
    personalityType,
    onStartOver,
    onHome,
}: ResultPageProps) {
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
                        <Image 
                            src="/icons/home.svg" 
                            alt="Home" 
                            width={32} 
                            height={32} 
                            className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12" 
                        />
                    </MotionButton>
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
                                <FaceTrackingVideo 
                                    key={`face-tracking-${personalityType}`}
                                    personalityType={personalityType.toLowerCase()} 
                                />
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