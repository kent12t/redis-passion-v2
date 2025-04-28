'use client';

import { useState } from 'react';
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

const personalityTypes = ['runner', 'farmer', 'chef', 'artist', 'volunteer', 'storyteller'];

interface QuizProps {
    questions: unknown[]; // More specific than any, we'll type assert inside
}

export default function Quiz({ questions }: QuizProps) {
    const typedQuestions = questions as Question[];
    const [quizState, setQuizState] = useState<QuizState>('start');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [personalityResult, setPersonalityResult] = useState('');

    // Placeholder activities and resources
    const [activities, setActivities] = useState<string[]>([]);
    const [resources, setResources] = useState<string[]>([]);

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
        let highestType = '';
        let highestScore = -1;

        Object.entries(scores).forEach(([type, score]) => {
            if (score > highestScore) {
                highestScore = score;
                highestType = type;
            }
        });

        setPersonalityResult(highestType);

        // Set activities based on personality type
        const personalityActivities = {
            runner: ['Morning jogs in the neighborhood', 'Joining community sports', 'Organizing fitness meetups'],
            farmer: ['Community gardening', 'Seasonal produce sharing', 'Nature walks'],
            chef: ['Cooking classes for neighbors', 'Recipe exchanges', 'Hosting community meals'],
            artist: ['Local art workshops', 'Creative social gatherings', 'Community mural projects'],
            volunteer: ['Neighborhood cleanup events', 'Support groups for elderly', 'Community outreach programs'],
            storyteller: ['Book clubs', 'Memoir writing workshops', 'Community history projects']
        };

        // Set resources based on personality type
        const personalityResources = {
            runner: ['Local fitness groups', 'Neighborhood walking maps', 'Community sports leagues'],
            farmer: ['Community garden listings', 'Seasonal planting guides', 'Seed exchange programs'],
            chef: ['Recipe sharing platforms', 'Community kitchen locations', 'Local cooking workshops'],
            artist: ['Art supply resources', 'Local galleries and exhibitions', 'Creative workshops'],
            volunteer: ['Community service organizations', 'Volunteer opportunities', 'Neighborhood assistance programs'],
            storyteller: ['Local libraries', 'Writing groups', 'Oral history projects']
        };

        setActivities(personalityActivities[highestType as keyof typeof personalityActivities] || []);
        setResources(personalityResources[highestType as keyof typeof personalityResources] || []);
    };

    // Render the appropriate component based on quiz state
    return (
        <>
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
                    activities={activities}
                    resources={resources}
                    onStartOver={handleStartOver}
                    onHome={handleHome}
                />
            )}
        </>
    );
} 