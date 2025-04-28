'use client';

import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { PlayCircle } from 'lucide-react';

interface StartPageProps {
    onStart: () => void;
}

export default function StartPage({ onStart }: StartPageProps) {
    return (
        <div className="min-h-screen bg-sky-200 grid grid-cols-1 gap-8 p-6 font-sans">
            <div className="flex flex-col items-center justify-center gap-6">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-pink-500 drop-shadow-[4px_4px_0px_rgba(255,255,255,0.5)]">
                        REDISCOVER
                        <span className="text-blue-600 text-5xl font-bold italic block">your</span>
                        PERSONALITY
                    </h1>
                </div>

                <Card className="max-w-md">
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
                </Card>

                <Button
                    onClick={onStart}
                    size="lg"
                    className="w-full max-w-xs"
                >
                    <PlayCircle size={20} className="mr-2" />
                    Get Started
                </Button>
            </div>
        </div>
    );
} 