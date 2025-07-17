'use client';

import MotionButton from './ui/motion-button';
import CostumeMarquee from './ui/costume-marquee';
import Image from 'next/image';

interface StartPageProps {
    onStart: () => void;
}

export default function StartPage({ onStart }: StartPageProps) {
    return (
        <div className="relative h-full bg-yellow">
            {/* Costume marquee */}
            <div className="absolute z-0 w-full top-[5%]">
                <CostumeMarquee direction="left" />
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 w-dvw max-w-[1200px] aspect-[3/1] z-2 top-[24%]">
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
            <div className="absolute z-0 w-full bottom-[5%]">
                <CostumeMarquee direction="right" />
            </div>

            {/* Main content */}
            <div className="grid absolute z-0 grid-cols-1 px-32 w-full h-auto font-sans top-[47%]">
                <div className="flex flex-col justify-center items-center">

                    <p className="text-center text-[48px] mb-12 leading-tight text-black">
                    Unlock your next adventure<br/>
                    by tailoring suggestions to<br/>
                    what excites you. Whether it’s<br/>
                    Play, Purpose, or Passion,<br/>
                    we’ll help you find the perfect fit.
                    </p>

                    <MotionButton
                        onClick={onStart}
                        size="lg"
                        className="h-auto w-auto px-12 py-4 text-[48px] font-sans bg-midblue text-white"
                    >
                        GET STARTED!
                    </MotionButton>
                </div>
            </div>
        </div>
    );
} 