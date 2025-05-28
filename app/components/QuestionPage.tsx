'use client';

import { ArrowLeft, ArrowRight, House } from 'lucide-react';
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
        <div className="flex flex-col items-center h-full font-sans">
            <div className="relative flex flex-col p-6 lg:p-12 w-full h-full max-w-[1200px] mx-auto items-center justify-center">
                {/* Home button */}
                <div className="absolute right-6 lg:right-12 top-6 lg:top-12">
                    <MotionButton
                        variant="primary"
                        size="icon"
                        className="flex items-center justify-center w-16 h-16 rounded-full sm:h-20 lg:h-24 sm:w-20 lg:w-24"
                        onClick={onHome}
                    >
                        <House className="w-8 h-8 sm:w-10 lg:w-12 sm:h-10 lg:h-12" />
                    </MotionButton>
                </div>

                {/* Main content area - centered vertically and horizontally */}
                <div className="flex flex-col justify-center flex-grow w-4/5 gap-6 md:gap-16">
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
                            <div className="flex flex-col items-center justify-center mb-6 md:mb-16">
                                <h2 className="text-4xl font-bold text-center text-white sm:text-6xl lg:text-7xl question">
                                    {currentQuestion.question_text}
                                </h2>
                            </div>

                            {/* Options */}
                            <div className="flex flex-col items-center w-full">
                                <div className="flex flex-col w-full gap-4 md:gap-6">
                                    {currentQuestion.options.map((option, index) => (
                                        <MotionCard
                                            key={index}
                                            isSelected={selectedAnswers[currentQuestionIndex] === index}
                                            className={`p-12 text-[40px] text-white font-medium leading-normal text-center ${index > 0 ? 'bg-green' : 'bg-purple'}`}
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
                <div className="flex flex-col w-full gap-4 md:gap-6">
                    {/* Navigation */}
                    <div className="flex items-center justify-between w-full">
                        <MotionButton
                            onClick={onPrevious}
                            disabled={currentQuestionIndex === 0}
                            variant="neutral"
                            className="w-16 h-16 sm:h-20 lg:h-24 sm:w-20 lg:w-24"
                            size="icon"
                        >
                            <ArrowLeft className="w-7 sm:w-8 lg:w-10 h-7 sm:h-8 lg:h-10" />
                        </MotionButton>

                        <MotionButton
                            onClick={onNext}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                            variant={selectedAnswers[currentQuestionIndex] === undefined ? "neutral" : "primary"}
                            className="h-16 px-8 text-lg sm:h-20 lg:h-24 sm:px-10 sm:text-xl lg:text-3xl"
                        >
                            Next
                            <ArrowRight className="ml-2 w-7 sm:w-8 lg:w-10 h-7 sm:h-8 lg:h-10" />
                        </MotionButton>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-3 overflow-hidden bg-white border-4 border-black rounded-full sm:h-4 lg:h-5">
                        <div
                            className="h-full transition-all duration-300 ease-in-out bg-orange"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
} 