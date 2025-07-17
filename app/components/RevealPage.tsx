'use client';

import MotionButton from './ui/motion-button';
import CostumeMarquee from './ui/costume-marquee';

interface RevealPageProps {
    onReveal: () => void;
}

export default function RevealPage({ onReveal }: RevealPageProps) {
    return (
        <div className="relative h-full bg-midblue">
            {/* Top marquees */}
            <div className="absolute z-0 w-full top-[5%]">
                <CostumeMarquee direction="left" />
            </div>
            
            <div className="absolute z-0 w-full top-[20%]">
                <CostumeMarquee direction="right" />
            </div>

            {/* Bottom marquees */}
            <div className="absolute z-0 w-full bottom-[20%]">
                <CostumeMarquee direction="left" />
            </div>
            
            <div className="absolute z-0 w-full bottom-[5%]">
                <CostumeMarquee direction="right" />
            </div>

            {/* Main content - centered button */}
            <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <MotionButton
                    onClick={onReveal}
                    size="lg"
                    className="h-auto w-auto rounded-[48px] px-16 py-8 text-[52px] font-sans bg-orange text-white text-center leading-tight"
                >
                    UNVEIL MY<br/>IDEAL PURSUIT!
                </MotionButton>
            </div>
        </div>
    );
} 