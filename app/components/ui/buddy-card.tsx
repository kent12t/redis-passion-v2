'use client';

import Image from 'next/image';

const personalityAssets = {
    "warrior": {
        hat: '/costume/runner-hat.png',
        shirt: '/costume/runner-shirt.png'
    },
    "artist": {
        hat: '/costume/artist-hat.png',
        shirt: '/costume/artist-shirt.png'
    },
    "gamer": {
        hat: '/costume/gamer-hat.png',
        shirt: '/costume/gamer-shirt.png'
    },
    "crafter": {
        hat: '/costume/crafter-hat.png',
        shirt: '/costume/crafter-shirt.png'
    },
    "farmer": {
        hat: '/costume/farmer-hat.png',
        shirt: '/costume/farmer-shirt.png'
    },
    "volunteer": {
        hat: '/costume/volunteer-hat.png',
        shirt: '/costume/volunteer-shirt.png'
    }
} as const;

interface BuddyCardProps {
    personality: string;
}

export default function BuddyCard({ personality }: BuddyCardProps) {
    const personalityKey = personality.toLowerCase() as keyof typeof personalityAssets;
    
    return (
        <div className="flex flex-col items-center gap-0">
            <div className="relative w-[84px] aspect-square sm:w-[96px] lg:w-[120px]">
                {/* Shirt layer */}
                <div className="absolute inset-0 scale-[80%] translate-y-[10%]">
                    <Image
                        src={personalityAssets[personalityKey].shirt}
                        alt={`${personality} shirt`}
                        width={120}
                        height={120}
                        sizes="(max-width: 640px) 84px, (max-width: 1024px) 96px, 120px"
                        className="object-contain w-full h-full"
                    />
                </div>
                {/* Hat layer - smaller size */}
                <div className="absolute inset-0 scale-50 -translate-y-[30%]">
                    <Image
                        src={personalityAssets[personalityKey].hat}
                        alt={`${personality} hat`}
                        width={120}
                        height={120}
                        sizes="(max-width: 640px) 84px, (max-width: 1024px) 96px, 120px"
                        className="object-contain w-full h-full"
                    />
                </div>
            </div>
            <span className="mt-2 text-sm leading-tight text-center sm:text-base lg:text-lg">
                {personality}
            </span>
        </div>
    );
} 