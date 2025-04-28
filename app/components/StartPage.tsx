'use client';

import { CardContent } from './ui/card';
import MotionButton from './ui/motion-button';
import MotionCard from './ui/motion-card';
import { PlayCircle } from 'lucide-react';

interface StartPageProps {
    onStart: () => void;
}

export default function StartPage({ onStart }: StartPageProps) {
    return (
        <div className="min-h-screen grid grid-cols-1 gap-8 p-6 font-sans">
            <div className="flex flex-col items-center justify-center gap-6">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-pink-500 question">
                        REDISCOVER
                        <span className="text-blue-600 text-5xl font-bold italic block">your</span>
                        PERSONALITY
                    </h1>
                </div>

                <MotionCard
                    className="max-w-md"
                    interactive={false}
                >
                    <CardContent className="pt-6">
                        <p className="text-center text-lg mb-6 text-[#3A3A3A]">
                            Take this quick and fun quiz to find out what activities suit you best! There are no right or wrong answers, just choose what feels most like you.
                        </p>
                        <p className="text-center text-lg text-[#3A3A3A]">
                            This will take about 3—5 minutes.
                            <br />
                            At the end, you&apos;ll get personalized suggestions for activities you might enjoy.
                        </p>
                    </CardContent>
                </MotionCard>

                <MotionButton
                    onClick={onStart}
                    size="lg"
                    className="w-full max-w-xs"
                >
                    <PlayCircle size={20} className="mr-2" />
                    Get Started
                </MotionButton>
            </div>
        </div>
    );
} 