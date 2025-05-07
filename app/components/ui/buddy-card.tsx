'use client';

import Image from 'next/image';

const personalityAssets = {
    "wellness warrior": {
        hat: '/runner-hat.png',
        shirt: '/runner-shirt.png'
    },
    "art maestro": {
        hat: '/artist-hat.png',
        shirt: '/artist-shirt.png'
    },
    "wise storyteller": {
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

interface BuddyCardProps {
    personality: string;
    reason?: string;
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