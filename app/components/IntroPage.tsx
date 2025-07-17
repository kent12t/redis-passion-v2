'use client';

import MotionButton from './ui/motion-button';
import CostumeMarquee from './ui/costume-marquee';
import Image from 'next/image';

interface IntroPageProps {
    onBegin: () => void;
    onBack: () => void;
}

export default function IntroPage({ onBegin, onBack }: IntroPageProps) {
    return (
        <div className="relative h-full bg-purple">
            {/* Costume marquee */}
            <div className="absolute z-0 w-full top-[5%]">
                <CostumeMarquee direction="left" />
            </div>

            {/* Costume marquee */}
            <div className="absolute z-0 w-full bottom-[5%]">
                <CostumeMarquee direction="right" />
            </div>

            {/* Main content */}
            <div className="grid absolute top-1/2 z-0 grid-cols-1 px-32 w-full h-auto font-sans -translate-y-1/2">
                <div className="flex flex-col gap-8 justify-center items-center">
                    {/* Two paragraphs */}
                    <p className="text-center text-[60px] mb-8 leading-tight text-white">
                        Live Life Unstoppable!
                    </p>

                    <p className="text-center text-[42px] mb-12 leading-tight text-white">
                        Take this quick and fun quiz to find out what activities suit you best! There are no right or wrong answers, just choose what feels most like you.

                        <br />
                        <br />

                        This will take only 3–5 minutes.
                        <br />

                        At the end, you’ll receive activity suggestions that you’re likely to enjoy.
                    </p>

                    {/* Navigation buttons */}
                    <div className="flex gap-4 items-center">
                        {/* BACK BUTTON */}
                        <MotionButton
                            onClick={onBack}
                            variant="neutral"
                            className="p-6 w-28 h-28 bg-yellow"
                        >
                            <Image
                                src="/icons/back.svg"
                                alt="Back"
                                width={40}
                                height={40}
                                className="w-10 h-10"
                            />
                        </MotionButton>

                        {/* BEGIN BUTTON */}
                        <MotionButton
                            onClick={onBegin}
                            variant="primary"
                            className="flex-shrink px-24 h-28 text-[48px] bg-orange text-white"
                        >
                            BEGIN
                            <Image
                                src="/icons/next.svg"
                                alt="Next"
                                width={40}
                                height={40}
                                className="ml-4 w-10 h-10"
                            />
                        </MotionButton>
                    </div>
                </div>
            </div>
        </div>
    );
} 