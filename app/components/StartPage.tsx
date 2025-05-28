'use client';

import { CardContent } from './ui/card';
import MotionButton from './ui/motion-button';
import MotionCard from './ui/motion-card';
import Image from 'next/image';
interface StartPageProps {
    onStart: () => void;
}

export default function StartPage({ onStart }: StartPageProps) {
    return (
        <div className="grid h-full grid-cols-1 p-6 font-sans">
            <div className="flex flex-col items-center justify-center gap-6 md:gap-16">
                <div className="w-4/5 max-w-[1200px]">
                    <div className="relative w-full aspect-[3/1]">
                        <Image 
                            src="/logo.png" 
                            alt="Logo" 
                            fill
                            priority
                            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 60vw, 1200px"
                            className="object-contain"
                        />
                    </div>
                </div>

                <MotionCard
                    className="w-4/5 max-w-[1200px]"
                    interactive={false}
                >
                    <CardContent className="pt-6">
                        <p className="text-center text-lg sm:text-xl lg:text-3xl mb-6 leading-normal text-[#3A3A3A]">
                            Take this quick and fun quiz to find out what activities suit you best! There are no right or wrong answers, just choose what feels most like you.
                        </p>
                        <p className="text-center text-lg sm:text-xl lg:text-3xl leading-normal text-[#3A3A3A]">
                            This will take about 3-5 minutes.
                            <br />
                            At the end, you&apos;ll get personalized suggestions for activities you might enjoy.
                        </p>
                    </CardContent>
                </MotionCard>

                <MotionButton
                    onClick={onStart}
                    size="lg"
                    className="w-4/5 h-16 max-w-[1200px] text-xl sm:h-20 lg:h-24 sm:text-2xl lg:text-3xl"
                >
                    Get Started
                </MotionButton>
            </div>
        </div>
    );
} 