'use client';

import MotionButton from './ui/motion-button';
import CostumeMarquee from './ui/costume-marquee';
import Image from 'next/image';
import { useLanguage, languages, getLanguageFontClass, getLanguageAdjustedFontStyle } from '@/app/lib/text-utils';

interface StartPageProps {
    onStart: () => void;
}

export default function StartPage({ onStart }: StartPageProps) {
    const { textContent, currentLanguage, setLanguage, isLanguageSwitcherEnabled } = useLanguage();

    return (
        <div className="relative h-full bg-yellow">
            {/* Costume marquee */}
            <div className="absolute z-0 w-full bottom-[22%]">
                <CostumeMarquee direction="left" />
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 w-dvw max-w-[1200px] aspect-[3/1] z-2 top-[10%]">
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
            <div className="grid absolute z-0 grid-cols-1 px-16 w-full h-auto font-sans top-[33%]">
                <div className="flex flex-col justify-center items-center">

                    <p className={`text-center mb-12 leading-tight text-black ${getLanguageFontClass(currentLanguage, 'body')}`} style={getLanguageAdjustedFontStyle('text-[40px]', currentLanguage)}>
                        {textContent.startPage.heroText.split('\n').map((line, index, array) => (
                            <span key={index}>
                                {line}
                                {index < array.length - 1 && <br />}
                            </span>
                        ))}
                    </p>

                    {/* Language selection buttons - hidden for deployment (see ENABLE_LANGUAGE_SWITCHER in language-context.tsx) */}
                    {isLanguageSwitcherEnabled && (
                        <div className="flex flex-row gap-4 mb-8">
                            {languages.map((language) => (
                                <MotionButton
                                    key={language.code}
                                    onClick={() => setLanguage(language.code)}
                                    className={`px-8 py-8 font-sans text-white ${
                                        currentLanguage === language.code ? 'bg-green' : 'bg-purple'
                                    }`}
                                    style={getLanguageAdjustedFontStyle('text-[30px]', currentLanguage)}
                                >
                                    {language.name}
                                </MotionButton>
                            ))}
                        </div>
                    )}

                    <MotionButton
                        onClick={onStart}
                        size="lg"
                        className={`h-auto w-auto px-12 py-4 font-sans bg-midblue text-white ${getLanguageFontClass(currentLanguage, 'body')}`}
                        style={getLanguageAdjustedFontStyle('text-[48px]', currentLanguage)}
                    >
                        {textContent.startPage.button.getStarted}
                    </MotionButton>
                </div>
            </div>
        </div>
    );
} 