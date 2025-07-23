'use client';

import MotionButton from './ui/motion-button';
import CostumeMarquee from './ui/costume-marquee';
import Image from 'next/image';
import { useLanguage } from '@/app/lib/text-utils';

interface IntroPageProps {
    onBegin: () => void;
    onBack: () => void;
}

export default function IntroPage({ onBegin, onBack }: IntroPageProps) {
    const { textContent } = useLanguage();

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
                    <p className="text-center text-[60px] mb-8 font-sans leading-tight text-white">
                        {textContent.introPage.title}
                    </p>

                    <p className="text-center text-[40px] mb-12 font-sans leading-tight text-white">
                        {textContent.introPage.description.split('\n').map((line, index, array) => (
                            <span key={index}>
                                {line}
                                {index < array.length - 1 && <br />}
                            </span>
                        ))}
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
                                alt={textContent.common.altTexts.back}
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
                            {textContent.introPage.buttons.begin}
                            <Image
                                src="/icons/next.svg"
                                alt={textContent.common.altTexts.next}
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