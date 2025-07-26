// TODO: Submit risk answers to backend risk-profile API (FR Risk Profile, ~70% completion)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';
import { useOnboarding } from '../contexts/OnboardingContext';

const RiskQuestionnaire = () => {
    const { riskQuestionnaire, updateRiskQuestionnaire } = useOnboarding();
    const [answers, setAnswers] = useState({});
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const navigate = useNavigate();

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const questions = [
        { id: 'q1', text: 'What is your primary investment objective?', options: ['Capital preservation', 'Income generation', 'Capital appreciation', 'Speculation'] },
        { id: 'q2', text: 'What is your investment horizon?', options: ['Less than 1 year', '1-3 years', '3-5 years', 'More than 5 years'] },
        { id: 'q3', text: 'How would you react to a 20% drop in your portfolio value?', options: ['Sell all investments', 'Sell some investments', 'Hold investments', 'Buy more investments'] },
        { id: 'q4', text: 'Which best describes your knowledge of investments?', options: ['None', 'Limited', 'Good', 'Extensive'] },
        { id: 'q5', text: 'How much of your income are you willing to risk for higher returns?', options: ['None', 'Less than 10%', '10-25%', 'More than 25%'] },
    ];

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Convert answers object to array format expected by backend
        const answersArray = questions.map(q => answers[q.id] || 1);
        updateRiskQuestionnaire(answersArray);
        
        console.log('Submitting risk questionnaire:', answersArray);
        setMessage('Calculating risk score...');
        
        // Simulate risk score calculation
        setTimeout(() => {
            const riskScore = Math.floor(Math.random() * 100);
            const riskLevel = riskScore < 30 ? 'Low' : riskScore < 70 ? 'Medium' : 'High';
            setMessage(`Your risk score is ${riskScore}, indicating a ${riskLevel} risk level.`);
            setShowMessageBox(true);
            
            // Navigate to data connection
            setTimeout(() => {
                navigate('/onboarding/data-connection');
            }, 2000);
        }, 1500);
    };

    const isFormValid = questions.every(q => answers[q.id]);

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 max-w-2xl w-full text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Risk Assessment Questionnaire</h1>
                <p className="text-gray-600 mb-8">Please answer the following questions to help us understand your risk tolerance and investment preferences.</p>

                <form onSubmit={handleSubmit} className="space-y-6 mb-6 text-left">
                    {questions.map((q) => (
                        <div key={q.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">{q.text}</h3>
                            <div className="space-y-3">
                                {q.options.map((option, index) => (
                                    <label key={index} className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name={q.id}
                                            value={option}
                                            checked={answers[q.id] === option}
                                            onChange={() => handleAnswerChange(q.id, option)}
                                            className="form-radio h-4 w-4 text-blue-600"
                                            required
                                        />
                                        <span className="ml-2 text-gray-700">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        type="submit"
                        className={`py-3 px-8 rounded-lg font-semibold transition-all duration-300 shadow-lg w-full ${isFormValid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        disabled={!isFormValid}
                    >
                        Calculate My Risk Profile
                    </button>
                </form>

                {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
            </div>
        </div>
    );
};

export default RiskQuestionnaire;