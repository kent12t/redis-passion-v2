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
        <div className="flex flex-col items-center h-full font-sans bg-midblue">
            <div className="relative flex flex-col p-6 w-full h-full max-w-[1200px] mx-auto items-center justify-center">
                {/* Background Frame */}


                <div className="absolute inset-0 z-0 w-[90%] h-[90%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Image
                        src="/frame.svg"
                        alt="Frame"
                        fill 
                        className="object-contain"
                    />
                </div>


                {/* Main content area - centered vertically and horizontally */}
                <div className="flex z-10 flex-col flex-grow gap-6 justify-center items-center mt-32 w-4/5 md:gap-16">
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
                            <div className="flex flex-col justify-center items-center mb-16">
                                <h2 className="text-6xl leading-snug text-center text-white question">
                                    {currentQuestion.question_text.split('\n').map((line, lineIndex) => (
                                        <span key={lineIndex}>
                                            {line}
                                            {lineIndex < currentQuestion.question_text.split('\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </h2>
                            </div>

                            {/* Options */}
                            <div className="flex flex-col items-center p-8 w-full">
                                <div className="flex flex-col gap-4 w-full md:gap-6">
                                    {currentQuestion.options.map((option, index) => (
                                        <MotionCard
                                            key={index}
                                            isSelected={selectedAnswers[currentQuestionIndex] === index}
                                            className={`p-12 text-[40px] text-white font-medium leading-normal text-center ${selectedAnswers[currentQuestionIndex] === index ? 'bg-green' : 'bg-purple'}`}
                                            onClick={() => onSelectAnswer(currentQuestionIndex, index)}
                                        >
                                            {option.option_text.split('\n').map((line, lineIndex) => (
                                                <span key={lineIndex}>
                                                    {line}
                                                    {lineIndex < option.option_text.split('\n').length - 1 && <br />}
                                                </span>
                                            ))}
                                        </MotionCard>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* NAVIGATION BUTTONS */}
                    <div className="flex z-10 gap-4 items-center">
                        {/* BACK BUTTON */}
                        <MotionButton
                            onClick={onPrevious}
                            disabled={currentQuestionIndex === 0}
                            variant="neutral"
                            className="p-6 w-28 h-28 bg-yellow"
                        >
                            <Image
                                src="/icons/back.svg"
                                alt="Back"
                                width={40}
                                height={40}
                                className="w-10 h-10"
                            />
                        </MotionButton>

                        {/* NEXT BUTTON */}
                        <MotionButton
                            onClick={onNext}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                            variant={selectedAnswers[currentQuestionIndex] === undefined ? "neutral" : "primary"}
                            className="flex-shrink px-24 h-28 text-[48px] bg-orange text-white"
                        >
                            NEXT 
                            <Image
                                src="/icons/next.svg"
                                alt="Next"
                                width={40}
                                height={40}
                                className="ml-4 w-10 h-10"
                            />
                        </MotionButton>

                        {/* HOME BUTTON */}
                        <MotionButton
                            variant="primary"
                            className="flex justify-center items-center p-6 w-28 h-28 rounded-full bg-yellow"
                            onClick={onHome}
                        >
                            <Image
                                src="/icons/home.svg"
                                alt="Home"
                                width={80}
                                height={80}
                                className="w-20 h-20"
                            />
                        </MotionButton>
                    </div>
                </div>

                {/* Bottom navigation section */}
                <div className="flex z-10 flex-col gap-4 px-32 py-8 mb-32 w-full">

                    {/* Progress bar */}
                    <div className="overflow-hidden w-full h-8 bg-white rounded-full border-black border-6">
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