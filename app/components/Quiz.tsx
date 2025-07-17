'use client';

import { useState, useEffect } from 'react';
import { StartPage, QuestionPage, ResultPage } from './';
import { generateSessionId, createActivityRecord, updateActivityRecord, isSupabaseAvailable } from '@/app/lib/supabase';

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
    'runner',
    'artist',
    'gamer',
    'crafter',
    'farmer',
    'volunteer'
];

// Mapping from internal nicknames to official personality names
const personalityMapping: Record<string, string> = {
    'runner': 'The Wellness Warrior',
    'artist': 'The Adventurous Artist',
    'gamer': 'The Tech Explorer',
    'crafter': 'The Everyday Creator',
    'farmer': 'The Urban Gardener',
    'volunteer': 'The Community Champion'
};

// Function to get official personality name
function getOfficialPersonalityName(nickname: string): string {
    return personalityMapping[nickname] || nickname;
}

interface QuizProps {
    questions: unknown[]; // More specific than any, we'll type assert inside
}

export default function Quiz({ questions }: QuizProps) {
    const typedQuestions = questions as Question[];
    const [quizState, setQuizState] = useState<QuizState>('start');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [personalityResult, setPersonalityResult] = useState('');
    const [sessionId, setSessionId] = useState<string>('');

    // Initialize session on component mount
    useEffect(() => {
        initializeSession();
    }, []);

    // Initialize a new session
    const initializeSession = async () => {
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        
        // Only attempt to create activity record if Supabase is available
        if (isSupabaseAvailable()) {
            try {
                const { error } = await createActivityRecord(newSessionId);
                if (error) {
                    console.error('Error creating activity record:', error);
                }
            } catch (error) {
                console.error('Error initializing session:', error);
            }
        } else {
            // Supabase not configured, continue without recording activity
            console.info('Activity recording disabled - Supabase not configured');
        }
    };

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
    const handleHome = async () => {
        setQuizState('start');
        // Create new session when returning to home
        await initializeSession();
    };

    // Handle starting the quiz over
    const handleStartOver = async () => {
        setQuizState('start');
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setPersonalityResult('');
        // Create new session when starting over
        await initializeSession();
    };

    // Calculate quiz results
    const calculateResults = async () => {
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

        // Update the activity record with the official personality name
        if (isSupabaseAvailable()) {
            try {
                const officialPersonalityName = getOfficialPersonalityName(winner);
                const { error } = await updateActivityRecord(sessionId, officialPersonalityName);
                if (error) {
                    console.error('Error updating activity record:', error);
                }
            } catch (error) {
                console.error('Error saving quiz result:', error);
            }
        } else {
            console.info('Activity recording disabled - Supabase not configured');
        }
    };

    // Simple render without complex animations for now
    return (
        <div className="overflow-hidden relative w-full h-full">
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
                    onStartOver={handleStartOver}
                    onHome={handleHome}
                />
            )}
        </div>
    );
} 