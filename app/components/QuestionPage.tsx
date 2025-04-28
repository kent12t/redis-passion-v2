'use client';

import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import MotionButton from './ui/motion-button';
import MotionCard from './ui/motion-card';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="h-screen bg-sky-200 flex flex-col items-center font-sans">
            <div className="w-full max-w-[800px] h-screen mx-auto flex flex-col relative px-6">
                {/* Home button */}
                <div className="absolute top-6 right-0">
                    <MotionButton
                        variant="primary"
                        size="icon"
                        className="flex items-center justify-center rounded-full"
                        onClick={onHome}
                    >
                        <Home size={24} />
                    </MotionButton>
                </div>

                {/* Main content area - centered vertically and horizontally */}
                <div className="flex-grow flex flex-col items-center justify-center">
                    {/* Question and Options - these will be animated */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`question-${currentQuestionIndex}`}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{
                                x: { type: "tween", duration: 0.4, ease: "easeOut" },
                                opacity: { duration: 0.3 }
                            }}
                            className="flex flex-col items-center w-full"
                        >
                            {/* Question */}
                            <div className="flex flex-col items-center justify-center mb-10">
                                <h2 className="text-5xl text-center font-bold text-pink-500 question max-w-[500px]">
                                    {currentQuestion.question_text}
                                </h2>
                            </div>

                            {/* Options */}
                            <div className="flex flex-col items-center w-full">
                                <div className="flex flex-col gap-6 w-full max-w-[500px]">
                                    {currentQuestion.options.map((option, index) => (
                                        <MotionCard
                                            key={index}
                                            isSelected={selectedAnswers[currentQuestionIndex] === index}
                                            variant="white"
                                            className="p-6 text-center text-lg font-medium"
                                            onClick={() => onSelectAnswer(currentQuestionIndex, index)}
                                        >
                                            {option.option_text}
                                        </MotionCard>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bottom navigation section */}
                <div className="flex flex-col gap-4 pb-6">
                    {/* Navigation */}
                    <div className="flex justify-between items-center w-full">
                        <MotionButton
                            onClick={onPrevious}
                            disabled={currentQuestionIndex === 0}
                            variant="neutral"
                            className="h-14"
                        >
                            <ArrowLeft size={24} />
                        </MotionButton>

                        <MotionButton
                            onClick={onNext}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                            variant={selectedAnswers[currentQuestionIndex] === undefined ? "neutral" : "primary"}
                            className="px-10 h-14"
                        >
                            Next
                            <ArrowRight size={24} className="ml-2" />
                        </MotionButton>
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