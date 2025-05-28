'use client';

import Image from 'next/image';
import { cn } from '../../lib/utils';

interface CostumeMarqueeProps {
    className?: string;
    direction?: 'left' | 'right';
}

export default function CostumeMarquee({ 
    className = "", 
    direction = 'left' 
}: CostumeMarqueeProps) {
    const animationClass = direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse';
    
    return (
        <div className={cn("relative overflow-hidden h-48", className)}>
            <div className={cn("flex w-[300%] gap-8", animationClass)}>
                {/* First set of images */}
                <div className="flex-shrink-0 w-1/3">
                    <Image 
                        src="/costume/all-costumes.png" 
                        alt="All costumes" 
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="object-contain w-full h-full"
                        priority
                    />
                </div>
                {/* Second set (duplicate) */}
                <div className="flex-shrink-0 w-1/3">
                    <Image 
                        src="/costume/all-costumes.png" 
                        alt="All costumes" 
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="object-contain w-full h-full"
                        priority
                    />
                </div>
                {/* Third set (duplicate) */}
                <div className="flex-shrink-0 w-1/3">
                    <Image 
                        src="/costume/all-costumes.png" 
                        alt="All costumes" 
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="object-contain w-full h-full"
                        priority
                    />
                </div>
            </div>
        </div>
    );
} 