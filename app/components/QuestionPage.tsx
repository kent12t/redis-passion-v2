'use client';

import MotionButton from './ui/motion-button';
import MotionCard from './ui/motion-card';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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
                    <div className="flex gap-4">
                        {/* BACK BUTTON */}
                        <MotionButton
                            onClick={onPrevious}
                            disabled={currentQuestionIndex === 0}
                            variant="neutral"
                            className="p-6 w-28 h-28 bg-yellow"

                        >
                            <Image
                                src="/icons/back-arrow.svg"
                                alt="Previous"
                                width={96}
                                height={96}
                                className="w-28 h-28"
                            />
                        </MotionButton>

                        <MotionButton
                            variant="primary"
                            className="flex items-center justify-center p-6 rounded-full w-28 h-28 bg-yellow"
                            onClick={onHome}
                        >
                            <Image
                                src="/icons/home.svg"
                                alt="Home"
                                width={96}
                                height={96}
                                className="w-28 h-28"
                            />
                        </MotionButton>
                    </div>
                </div>

                {/* Main content area - centered vertically and horizontally */}
                <div className="flex flex-col items-center justify-center flex-grow w-4/5 gap-6 md:gap-16">
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

                    {/* NEXT BUTTON */}
                    <MotionButton
                        onClick={onNext}
                        disabled={selectedAnswers[currentQuestionIndex] === undefined}
                        variant={selectedAnswers[currentQuestionIndex] === undefined ? "neutral" : "primary"}
                        className="flex-shrink px-12 h-24 text-[48px] bg-yellow text-orange"
                    >
                        Next
                        <Image
                            src="/icons/next-arrow.svg"
                            alt="Next"
                            width={64}
                            height={64}
                            className="w-16 h-16 ml-4"
                        />
                    </MotionButton>
                </div>

                {/* Bottom navigation section */}
                <div className="flex flex-col w-full gap-4 md:gap-6">

                    {/* Progress bar */}
                    <div className="w-full h-8 overflow-hidden bg-white border-black rounded-full border-6">
                        <div
                            className="h-full transition-all duration-300 ease-out bg-orange"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
} 