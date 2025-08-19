'use client';

import MotionButton from './ui/motion-button';
import CostumeMarquee from './ui/costume-marquee';
import { useLanguage, getLanguageAdjustedFontSize, getLanguageAdjustedFontStyle } from '@/app/lib/text-utils';

interface RevealPageProps {
    onReveal: () => void;
}

export default function RevealPage({ onReveal }: RevealPageProps) {
    const { textContent, currentLanguage } = useLanguage();

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
                    className="h-auto w-full rounded-[48px] px-16 py-8 font-sans bg-orange text-white text-center leading-tight whitespace-normal"
                    style={getLanguageAdjustedFontStyle('text-[52px]', currentLanguage)}
                >
                    <div className="whitespace-normal">
                        {textContent.revealPage.buttons.unveil.split('\n').map((line, index) => (
                            <div key={index}>
                                {line}
                            </div>
                        ))}
                    </div>
                </MotionButton>
            </div>
        </div>
    );
} 