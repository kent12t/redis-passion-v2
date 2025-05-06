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
        <div className="flex flex-col items-center">
            <div className="relative w-24 aspect-square sm:w-28 lg:w-36">
                {/* Shirt layer */}
                <div className="absolute inset-0">
                    <Image
                        src={personalityAssets[personalityKey].shirt}
                        alt={`${personality} shirt`}
                        fill
                        className="object-contain"
                    />
                </div>
                {/* Hat layer - smaller size */}
                <div className="absolute inset-0 scale-75 -translate-y-4">
                    <Image
                        src={personalityAssets[personalityKey].hat}
                        alt={`${personality} hat`}
                        fill
                        className="object-contain"
                    />
                </div>
            </div>
            <span className="mt-2 text-sm text-center sm:text-base lg:text-lg">
                {personality}
            </span>
        </div>
    );
} 