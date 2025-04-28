'use client';

import { FaceTrackingVideo } from './';
import { CardContent, CardTitle } from './ui/card';
import MotionButton from './ui/motion-button';
import MotionCard from './ui/motion-card';
import { Home, Users, Calendar, BookOpen, RefreshCw } from 'lucide-react';

interface ResultPageProps {
    personalityType: string;
    personalityDescription: string;
    activities: string[];
    resources: string[];
    onStartOver: () => void;
    onHome?: () => void;
}

export default function ResultPage({
    personalityType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    personalityDescription, // Kept for API consistency
    activities,
    resources,
    onStartOver,
    onHome,
}: ResultPageProps) {
    return (
        <div className="h-screen flex flex-col items-center">
            <div className="w-full max-w-[800px] h-screen mx-auto flex flex-col relative px-6">
                {/* Home button */}
                <div className="absolute top-6 right-0">
                    <MotionButton
                        variant="primary"
                        size="icon"
                        className="flex items-center justify-center rounded-full"
                        onClick={onHome || onStartOver}
                    >
                        <Home size={24} />
                    </MotionButton>
                </div>

                {/* Header spanning both columns */}
                <div className="text-center mt-20 mb-6">
                    <span className="text-blue-600 text-2xl font-bold">YOU&apos;RE A</span>
                    <h1 className="text-5xl md:text-6xl font-bold text-pink-500 drop-shadow-[4px_4px_0px_rgba(255,255,255,0.5)]">
                        MASTER {personalityType.toUpperCase()}
                    </h1>
                </div>

                {/* Main content with 3:2 ratio columns */}
                <div className="flex-grow grid grid-cols-5 gap-6 mb-6">
                    {/* Left column (60%) */}
                    <div className="col-span-3 flex flex-col">
                        {/* Face tracking display */}
                        <MotionCard
                            className="flex-grow relative overflow-hidden p-0"
                            interactive={false}
                        >
                            <FaceTrackingVideo personalityType={personalityType.toLowerCase()} />
                        </MotionCard>
                    </div>

                    {/* Right column (40%) */}
                    <div className="col-span-2 flex flex-col gap-4 overflow-y-auto">
                        <MotionCard interactive={false}>
                            <CardContent className="pt-6">
                                <CardTitle className="mb-4 flex items-center">
                                    <Users size={24} className="mr-2" />
                                    FIND YOUR BUDDIES
                                </CardTitle>
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2].map((buddy) => (
                                        <div
                                            key={buddy}
                                            className="aspect-square rounded-full bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </MotionCard>

                        <MotionCard interactive={false}>
                            <CardContent className="pt-6">
                                <CardTitle className="mb-4 flex items-center">
                                    <Calendar size={24} className="mr-2" />
                                    ACTIVITIES
                                </CardTitle>
                                <div className="flex flex-col gap-4">
                                    {activities.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center"
                                        >
                                            <div className="bg-pink-500 text-white rounded-full p-2 mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <Calendar size={16} />
                                            </div>
                                            {activity}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </MotionCard>

                        <MotionCard interactive={false}>
                            <CardContent className="pt-6">
                                <CardTitle className="mb-4 flex items-center">
                                    <BookOpen size={24} className="mr-2" />
                                    RESOURCES
                                </CardTitle>
                                <div className="flex flex-col gap-4">
                                    {resources.map((resource, index) => (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center"
                                        >
                                            <div className="bg-blue-500 text-white rounded-full p-2 mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <BookOpen size={16} />
                                            </div>
                                            {resource}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </MotionCard>
                    </div>
                </div>

                {/* Start over button spanning both columns at the bottom */}
                <MotionButton
                    onClick={onStartOver}
                    size="lg"
                    className="w-full mb-6"
                >
                    <RefreshCw size={20} className="mr-2" />
                    Start Over
                </MotionButton>
            </div>
        </div>
    );
} 