'use client';

import { cn } from '../lib/utils';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { Button } from './ui/button';

interface Option {
    option_text: string;
    points: Record<string, number>;
}

interface Question {
    question_number: number;
    question_text: string;
    options: Option[];
}

interface QuestionPageProps {
    questions: Question[];
    currentQuestionIndex: number;
    selectedAnswers: Record<number, number>;
    onSelectAnswer: (questionIndex: number, optionIndex: number) => void;
    onNext: () => void;
    onPrevious: () => void;
    onHome: () => void;
    totalQuestions: number;
}

export default function QuestionPage({
    questions,
    currentQuestionIndex,
    selectedAnswers,
    onSelectAnswer,
    onNext,
    onPrevious,
    onHome,
    totalQuestions,
}: QuestionPageProps) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    return (
        <div className="h-screen bg-sky-200 flex flex-col items-center">
            <div className="w-full max-w-[800px] h-screen mx-auto flex flex-col relative px-6">
                {/* Home button */}
                <div className="absolute top-6 right-0">
                    <Button
                        variant="primary"
                        className="h-16 w-16 p-0 flex items-center justify-center rounded-full"
                        onClick={onHome}
                    >
                        <Home size={24} />
                    </Button>
                </div>

                {/* Main content area - centered vertically and horizontally */}
                <div className="flex-grow flex flex-col items-center justify-center">
                    {/* Question */}
                    <div className="flex flex-col items-center justify-center mb-10">
                        <h2 className="text-5xl text-center font-bold text-pink-500 drop-shadow-[3px_3px_0px_rgba(255,255,255,0.5)] max-w-[500px]">
                            {currentQuestion.question_text}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="flex flex-col items-center w-full">
                        <div className="flex flex-col gap-6 w-full max-w-[500px]">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSelectAnswer(currentQuestionIndex, index)}
                                    className={cn(
                                        "text-center p-6 rounded-lg text-lg font-medium text-[#3A3A3A]",
                                        "transform transition-all duration-200 bg-white",
                                        selectedAnswers[currentQuestionIndex] === index
                                            ? "border-pink-500 border-2 shadow-none translate-x-[4px] translate-y-[4px]"
                                            : "border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
                                    )}
                                >
                                    {option.option_text}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom navigation section */}
                <div className="flex flex-col gap-4 pb-6">
                    {/* Navigation */}
                    <div className="flex justify-between items-center w-full">
                        <Button
                            onClick={onPrevious}
                            disabled={currentQuestionIndex === 0}
                            variant="neutral"
                            className="h-14"
                        >
                            <ArrowLeft size={24} />
                        </Button>

                        <Button
                            onClick={onNext}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                            variant={selectedAnswers[currentQuestionIndex] === undefined ? "neutral" : "primary"}
                            className="px-10 h-14"
                        >
                            Next
                            <ArrowRight size={24} className="ml-2" />
                        </Button>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-white h-4 rounded-full overflow-hidden border-2 border-black">
                        <div
                            className="h-full bg-pink-500 transition-all duration-300 ease-in-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
} 