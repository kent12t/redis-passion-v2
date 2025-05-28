'use client';

import Image from 'next/image';
import { cn } from '../../lib/utils';

interface CostumeMarqueeProps {
    height?: string;
    className?: string;
}

export default function CostumeMarquee({ height = "h-32", className = "" }: CostumeMarqueeProps) {
    return (
        <div className={cn("relative overflow-hidden", height, className)}>
            <div className="flex animate-marquee">
                <div className="flex-shrink-0">
                    <Image 
                        src="/costume/all-costumes.png" 
                        alt="All costumes" 
                        width={1200}
                        height={200}
                        className="object-contain w-auto h-full"
                        priority
                    />
                </div>
                <div className="flex-shrink-0">
                    <Image 
                        src="/costume/all-costumes.png" 
                        alt="All costumes" 
                        width={1200}
                        height={200}
                        className="object-contain w-auto h-full"
                        priority
                    />
                </div>
                <div className="flex-shrink-0">
                    <Image 
                        src="/costume/all-costumes.png" 
                        alt="All costumes" 
                        width={1200}
                        height={200}
                        className="object-contain w-auto h-full"
                        priority
                    />
                </div>
            </div>
        </div>
    );
} 