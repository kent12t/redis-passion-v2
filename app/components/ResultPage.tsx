'use client';

import { FaceTrackingVideo } from './';
import MotionButton from './ui/motion-button';
import { RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface ResultPageProps {
    personalityType: string;
    onStartOver: () => void;
    onHome?: () => void;
}

// Personality type to asset mapping
const personalityAssets = {
    "wellness warrior": {
        card: '/results/wellness-warrior.png',
        bg: '/costume/runner-shirt.png'
    },
    "art maestro": {
        card: '/results/art-maestro.png',
        bg: '/costume/artist-shirt.png'
    },
    "wise storyteller": {
        card: '/results/wise-storyteller.png',
        bg: '/costume/storyteller-shirt.png'
    },
    "master chef": {
        card: '/results/master-chef.png',
        bg: '/costume/chef-shirt.png'
    },
    "tree whisperer": {
        card: '/results/tree-whisperer.png',
        bg: '/costume/farmer-shirt.png'
    },
    "community champion": {
        card: '/results/community-champion.png',
        bg: '/costume/volunteer-shirt.png'
    }
};

export default function ResultPage({
    personalityType,
    onStartOver,
    onHome,
}: ResultPageProps) {
    // Get current personality data
    return (
        <div className="flex flex-col items-center h-full p-0">
            <div className="relative flex flex-col w-full h-full max-w-[1200px] mx-auto items-center justify-center">
                {/* Home button */}
                <div className="absolute right-12 top-12">
                    <MotionButton
                        variant="primary"
                        className="flex items-center justify-center p-6 rounded-full w-28 h-28 bg-yellow"
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

                {/* Main content with 3:2 ratio columns */}
                <div className="grid w-full grid-cols-5 pl-[160px] pr-[90px] h-full pt-[360px] grid-rows-8 z-0">
                    {/* Left column (60%) */}
                    <div className="flex flex-col h-full col-span-3 row-span-full">
                        {/* Face tracking display - 5/8 height */}

                        <div className="relative h-full p-0 overflow-hidden">
                            <FaceTrackingVideo
                                key={`face-tracking-${personalityType}`}
                                personalityType={personalityType.toLowerCase()}
                            />
                        </div>

                    </div>

                </div>

                <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
                    <Image
                        src={personalityAssets[personalityType as keyof typeof personalityAssets].card}
                        alt={personalityType}
                        sizes="80vw"
                        className="relative object-contain w-5/6"
                        width={1080}
                        height={1966}
                    />
                </div>


            </div>
            
            <MotionButton
                onClick={onStartOver}
                size="lg"
                className="px-12 h-24 text-[48px] text-orange bg-yellow absolute bottom-12"
            >
                <RefreshCw className="w-12 h-12 mr-2 stroke-3 text-orange" />
                Start Over
            </MotionButton>
        </div>
    );
} 