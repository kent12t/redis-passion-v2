'use client';

import MotionButton from './ui/motion-button';
import CostumeMarquee from './ui/costume-marquee';
import Image from 'next/image';

interface StartPageProps {
    onStart: () => void;
}

export default function StartPage({ onStart }: StartPageProps) {
    return (
        <div className="relative h-full">
            {/* Frame overlay - floating and centered, constrained by app-content width */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-1">
                <div className="relative w-full h-full">
                    <Image
                        src="/frame.png"
                        alt="Frame"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            {/* Costume marquee */}
            <div className="absolute z-0 w-full top-1/12">
                <CostumeMarquee direction="left" />
            </div>

            <div className="absolute w-dvw max-w-[1200px] aspect-[3/1] z-2 top-1/6">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    fill
                    priority
                    sizes="(max-width: 768px) 80vw, (max-width: 1200px) 60vw, 1200px"
                    className="object-contain"
                />
            </div>

            {/* Costume marquee */}
            <div className="absolute z-0 w-full bottom-1/12">
                <CostumeMarquee direction="right" />
            </div>

            {/* Main content */}
            <div className="absolute z-0 grid w-full h-auto grid-cols-1 px-32 font-sans top-2/5">
                <div className="flex flex-col items-center justify-center">

                    <p className="text-center text-[42px] mb-12 leading-normal text-[#3A3A3A]">
                        Take this quick and fun quiz to find out what activities suit you best! There are no right or wrong answers, just choose what feels most like you.                     </p>
                    <p className="text-center text-[42px] mb-24 leading-normal text-[#3A3A3A]">
                        This will take about 3-5 minutes.<br/> At the end, you’ll get personalised suggestions for activities you might enjoy.
                    </p>


                    <MotionButton
                        onClick={onStart}
                        size="lg"
                        className="h-auto w-auto px-32 py-4 text-[60px] bg-darkblue text-white"
                    >
                        Get Started!
                    </MotionButton>
                </div>
            </div>
        </div>
    );
} 