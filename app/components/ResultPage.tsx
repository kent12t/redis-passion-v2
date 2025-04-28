'use client';

import { FaceTrackingVideo } from './';
import { Card, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
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
        <div className="min-h-screen bg-sky-200 p-6 flex flex-col items-center">
            <div className="w-full max-w-[800px] mx-auto relative">
                <div className="absolute top-0 right-0">
                    <Button
                        variant="primary"
                        className="h-16 w-16 p-0 flex items-center justify-center rounded-full"
                        onClick={onHome || onStartOver}
                    >
                        <Home size={24} />
                    </Button>
                </div>

                <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 mt-20">
                    <div className="flex flex-col gap-6">
                        <div className="text-center md:text-left">
                            <span className="text-blue-600 text-2xl font-bold">YOU&apos;RE A</span>
                            <h1 className="text-5xl md:text-6xl font-bold text-pink-500 drop-shadow-[4px_4px_0px_rgba(255,255,255,0.5)]">
                                MASTER {personalityType.toUpperCase()}
                            </h1>
                        </div>

                        {/* Face tracking display */}
                        <Card className="relative aspect-[4/3] overflow-hidden p-0">
                            <FaceTrackingVideo personalityType={personalityType.toLowerCase()} />
                        </Card>

                        {/* Start over button */}
                        <Button
                            onClick={onStartOver}
                            size="lg"
                            className="w-full"
                        >
                            <RefreshCw size={20} className="mr-2" />
                            Start Over
                        </Button>
                    </div>

                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <CardTitle className="mb-4 flex items-center">
                                    <Users size={24} className="mr-2" />
                                    FIND YOUR BUDDIES
                                </CardTitle>
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2].map((buddy) => (
                                        <div
                                            key={buddy}
                                            className="aspect-square rounded-full bg-gray-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <CardTitle className="mb-4 flex items-center">
                                    <Calendar size={24} className="mr-2" />
                                    ACTIVITIES
                                </CardTitle>
                                <div className="flex flex-col gap-4">
                                    {activities.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg bg-gray-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center"
                                        >
                                            <div className="bg-pink-500 text-white rounded-full p-2 mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <Calendar size={16} />
                                            </div>
                                            {activity}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <CardTitle className="mb-4 flex items-center">
                                    <BookOpen size={24} className="mr-2" />
                                    RESOURCES
                                </CardTitle>
                                <div className="flex flex-col gap-4">
                                    {resources.map((resource, index) => (
                                        <div
                                            key={index}
                                            className="p-4 rounded-lg bg-gray-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center"
                                        >
                                            <div className="bg-blue-500 text-white rounded-full p-2 mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <BookOpen size={16} />
                                            </div>
                                            {resource}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
} 