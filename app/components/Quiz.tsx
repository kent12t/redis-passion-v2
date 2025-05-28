'use client';

import { useState, useEffect } from 'react';
import { StartPage, QuestionPage, ResultPage } from './';

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
    'wise storyteller',
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

    // Apply container classes based on quiz state
    useEffect(() => {
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            // Remove all state classes
            appContainer.classList.remove('question-page');
            
            // Add appropriate class based on state
            if (quizState === 'question') {
                appContainer.classList.add('question-page');
            }
        }
    }, [quizState]);

    // Handle starting the quiz
    const handleStart = () => {
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
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    // Handle returning to home/start screen
    const handleHome = () => {
        setQuizState('start');
    };

    // Handle starting the quiz over
    const handleStartOver = () => {
        setQuizState('start');
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setPersonalityResult('');
    };

    // Calculate quiz results
    const calculateResults = () => {
        // Initialize scores for each personality type
        const scores: Record<string, number> = {};
        personalityTypes.forEach(type => {
            scores[type] = 0;
        });

        // Calculate points for each answer
        Object.entries(selectedAnswers).forEach(([questionIndex, optionIndex]) => {
            const question = typedQuestions[parseInt(questionIndex)];
            const option = question.options[optionIndex];

            // Add points to personality types
            Object.entries(option.points).forEach(([type, points]) => {
                if (scores[type] !== undefined) {
                    scores[type] += points;
                }
            });
        });

        // Find the highest scoring personality type
        const maxScore = Math.max(...Object.values(scores));
        const winner = Object.entries(scores)
            .find(([, score]) => score === maxScore)?.[0] || personalityTypes[0];

        setPersonalityResult(winner);
    };

    // Simple render without complex animations for now
    return (
        <div className="relative w-full h-full overflow-hidden">
            {quizState === 'start' && (
                <StartPage onStart={handleStart} />
            )}

            {quizState === 'question' && (
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
            )}

            {quizState === 'result' && (
                <ResultPage
                    personalityType={personalityResult}
                    personalityDescription="Your personalized description based on quiz results."
                    activities={[]}
                    resources={[]}
                    onStartOver={handleStartOver}
                    onHome={handleHome}
                />
            )}
        </div>
    );
} 