'use client';

import { useState } from 'react';
import { StartPage, QuestionPage, ResultPage } from './';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface Option {
    option_text: string;
    points: {
        [key: string]: number;
    };
}

export interface Question {
    question_number: number;
    question_text: string;
    options: Option[];
}

type QuizState = 'start' | 'question' | 'result';

const personalityTypes = [
    'wellness warrior',
    'art maestro',
    'storyteller',
    'master chef',
    'tree whisperer',
    'community champion'
];

interface QuizProps {
    questions: unknown[]; // More specific than any, we'll type assert inside
}

export default function Quiz({ questions }: QuizProps) {
    const typedQuestions = questions as Question[];
    const [quizState, setQuizState] = useState<QuizState>('start');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [personalityResult, setPersonalityResult] = useState('');
    const [direction, setDirection] = useState<'left' | 'right'>('right');

    // Page transition variants
    const variants = {
        enter: (direction: string) => ({
            x: direction === 'right' ? -1200 : 1200,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: string) => ({
            x: direction === 'right' ? 1200 : -1200,
            opacity: 0
        })
    };

    // Placeholder activities and resources
    const [activities, setActivities] = useState<string[]>([]);
    const [resources, setResources] = useState<string[]>([]);

    // Handle starting the quiz
    const handleStart = () => {
        setDirection('left');
        setQuizState('question');
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
    };

    // Handle selecting an answer
    const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    // Handle navigating to the next question
    const handleNext = () => {
        setDirection('left');
        if (currentQuestionIndex < typedQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Calculate results and move to result page
            calculateResults();
            setQuizState('result');
        }
    };

    // Handle navigating to the previous question
    const handlePrevious = () => {
        setDirection('right');
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    // Handle returning to home/start screen
    const handleHome = () => {
        setDirection('right');
        setQuizState('start');
    };

    // Handle starting the quiz over
    const handleStartOver = () => {
        setDirection('right');
        setQuizState('start');
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setPersonalityResult('');
    };

    // Calculate quiz results
    const calculateResults = () => {
        // Initialize scores for each personality type
        const scores: Record<string, number> = {};
        const firstToReach: Record<number, string> = {}; // Track first personality to reach each score
        personalityTypes.forEach(type => {
            scores[type] = 0;
        });

        // Calculate points for each answer in order
        Object.entries(selectedAnswers)
            .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Sort by question number
            .forEach(([questionIndex, optionIndex]) => {
                const question = typedQuestions[parseInt(questionIndex)];
                const option = question.options[optionIndex];

                // Add points to personality types
                Object.entries(option.points).forEach(([type, points]) => {
                    if (scores[type] !== undefined) {
                        scores[type] += points;
                        // Track first personality to reach each score
                        if (!firstToReach[scores[type]]) {
                            firstToReach[scores[type]] = type;
                        }
                    }
                });
            });

        // Find the highest scoring personality type(s)
        const maxScore = Math.max(...Object.values(scores));
        const winners = Object.entries(scores)
            .filter(([, score]) => score === maxScore)
            .map(([type]) => type);

        // If there's a tie, use First Past The Post
        const result = winners.length === 1
            ? winners[0]
            : firstToReach[maxScore] || winners[0]; // Fallback to first winner if no first-to-reach record

        setPersonalityResult(result);

        // Set activities based on personality type
        const personalityActivities = {
            'wellness warrior': ['Morning jogs in the neighborhood', 'Joining community sports', 'Organizing fitness meetups'],
            'art maestro': ['Local art workshops', 'Creative social gatherings', 'Community mural projects'],
            storyteller: ['Book clubs', 'Memoir writing workshops', 'Community history projects'],
            'master chef': ['Cooking classes for neighbors', 'Recipe exchanges', 'Hosting community meals'],
            'tree whisperer': ['Community gardening', 'Seasonal produce sharing', 'Nature walks'],
            'community champion': ['Neighborhood cleanup events', 'Support groups for elderly', 'Community outreach programs']
        };

        // Set resources based on personality type
        const personalityResources = {
            'wellness warrior': ['Local fitness groups', 'Neighborhood walking maps', 'Community sports leagues'],
            'art maestro': ['Art supply resources', 'Local galleries and exhibitions', 'Creative workshops'],
            storyteller: ['Local libraries', 'Writing groups', 'Oral history projects'],
            'master chef': ['Recipe sharing platforms', 'Community kitchen locations', 'Local cooking workshops'],
            'tree whisperer': ['Community garden listings', 'Seasonal planting guides', 'Seed exchange programs'],
            'community champion': ['Community service organizations', 'Volunteer opportunities', 'Neighborhood assistance programs']
        };

        setActivities(personalityActivities[result as keyof typeof personalityActivities] || []);
        setResources(personalityResources[result as keyof typeof personalityResources] || []);
    };

    // Render the appropriate component based on quiz state
    return (
        <div className="relative w-full h-screen overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="sync">
                {quizState === 'start' && (
                    <motion.div
                        key="start"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "tween", duration: 0.4, ease: "easeOut" },
                            opacity: { duration: 0 }
                        }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <StartPage onStart={handleStart} />
                    </motion.div>
                )}

                {quizState === 'question' && (
                    <div key={`question-container`} className="absolute inset-0 w-full h-full">
                        <QuestionPage
                            questions={typedQuestions}
                            currentQuestionIndex={currentQuestionIndex}
                            selectedAnswers={selectedAnswers}
                            onSelectAnswer={handleSelectAnswer}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onHome={handleHome}
                            totalQuestions={typedQuestions.length}
                        />
                    </div>
                )}

                {quizState === 'result' && (
                    <motion.div
                        key="result"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "tween", duration: 0.4, ease: "easeOut" },
                            opacity: { duration: 0 }
                        }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <ResultPage
                            personalityType={personalityResult}
                            personalityDescription="Your personalized description based on quiz results."
                            activities={activities}
                            resources={resources}
                            onStartOver={handleStartOver}
                            onHome={handleHome}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 