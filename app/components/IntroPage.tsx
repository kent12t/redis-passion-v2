'use client';

import MotionButton from './ui/motion-button';
import CostumeMarquee from './ui/costume-marquee';
import Image from 'next/image';
import { useLanguage, getLanguageFontClass, getLanguageAdjustedFontStyle } from '@/app/lib/text-utils';

interface IntroPageProps {
    onBegin: () => void;
    onBack: () => void;
}

export default function IntroPage({ onBegin, onBack }: IntroPageProps) {
    const { textContent, currentLanguage } = useLanguage();

    return (
        <div className="relative h-full bg-purple">
            {/* Costume marquee */}
            <div className="absolute z-0 w-full bottom-[22%]">
                <CostumeMarquee direction="left" />
            </div>

            {/* Costume marquee */}
            <div className="absolute z-0 w-full bottom-[5%]">
                <CostumeMarquee direction="right" />
            </div>

            {/* Main content */}
            <div className="absolute z-0 grid w-full h-auto grid-cols-1 px-0 font-sans -translate-y-1/2 top-[36%]">
                <div className="flex flex-col gap-8 justify-center items-center">
                    {/* Two paragraphs */}
                    <p className={`text-center mb-8 font-sans leading-tight text-white ${getLanguageFontClass(currentLanguage, 'title')}`} style={getLanguageAdjustedFontStyle('text-[60px]', currentLanguage)}>
                        {textContent.introPage.title.split('\n').map((line, index, array) => (
                            <span key={index}>
                                {line}
                                {index < array.length - 1 && <br />}
                            </span>
                        ))}
                    </p>

                    <p className={`text-center mb-12 font-sans leading-tight text-white ${getLanguageFontClass(currentLanguage, 'body')}`} style={getLanguageAdjustedFontStyle('text-[42px]', currentLanguage)}>
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
                            className={`flex-shrink px-24 h-28 bg-orange text-white ${getLanguageFontClass(currentLanguage, 'body')}`}
                            style={getLanguageAdjustedFontStyle('text-[48px]', currentLanguage)}
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