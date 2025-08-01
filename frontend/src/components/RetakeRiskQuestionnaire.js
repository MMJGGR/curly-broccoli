import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';

const RetakeRiskQuestionnaire = () => {
    const [answers, setAnswers] = useState({});
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const navigate = useNavigate();

    // Calculate risk score deterministically based on answers
    const calculateRiskScore = (answersArray) => {
        // Each answer contributes to risk score (1-4 scale mapped to 0-100)
        const weights = [25, 20, 30, 15, 10]; // Different weights for each question
        let totalScore = 0;
        
        answersArray.forEach((answer, index) => {
            const normalizedAnswer = (answer - 1) / 3; // Convert 1-4 to 0-1
            totalScore += normalizedAnswer * weights[index];
        });
        
        return Math.round(totalScore);
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Convert answers object to array format expected by backend
        const answersArray = questions.map(q => {
            const answer = answers[q.id];
            if (!answer) return 1; // Default to first option
            // Convert text option to numeric value (1-4)
            const optionIndex = q.options.indexOf(answer);
            return optionIndex >= 0 ? optionIndex + 1 : 1;
        });
        
        console.log('Submitting risk questionnaire:', answersArray);
        console.log('Answers object:', answers);
        setMessage('Calculating risk score...');
        
        // Calculate risk score based on answers
        const riskScore = calculateRiskScore(answersArray);
        console.log('Calculated risk score:', riskScore);
        const riskLevel = riskScore < 30 ? 'Low' : riskScore < 70 ? 'Medium' : 'High';
        
        try {
            // Submit to backend to update user profile
            const jwt = localStorage.getItem('jwt');
            if (jwt) {
                const API_BASE = 'http://localhost:8000';
                const response = await fetch(`${API_BASE}/auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${jwt}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        questionnaire: answersArray,
                        risk_score: riskScore,
                        risk_level: riskLevel
                    })
                });

                if (response.ok) {
                    setMessage(`Risk assessment updated! Your risk score is ${riskScore}, indicating a ${riskLevel} risk level.`);
                } else {
                    setMessage(`Risk score calculated: ${riskScore} (${riskLevel} risk level). Profile update may have failed.`);
                }
            } else {
                setMessage(`Your risk score is ${riskScore}, indicating a ${riskLevel} risk level.`);
            }
        } catch (error) {
            console.error('Error updating risk profile:', error);
            setMessage(`Your risk score is ${riskScore}, indicating a ${riskLevel} risk level. Profile update may have failed.`);
        }
        
        setShowMessageBox(true);
        
        // Navigate back to profile after a delay
        setTimeout(() => {
            navigate('/app/profile');
        }, 3000);
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

                    <div className="flex flex-col md:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/app/profile')}
                            className="bg-gray-300 text-gray-700 py-3 px-8 rounded-lg font-semibold hover:bg-gray-400 transition-all duration-300 shadow-lg flex-1"
                        >
                            ← Back to Profile
                        </button>
                        <button
                            type="submit"
                            className={`py-3 px-8 rounded-lg font-semibold transition-all duration-300 shadow-lg flex-1 ${isFormValid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            disabled={!isFormValid}
                        >
                            Update My Risk Profile
                        </button>
                    </div>
                </form>

                {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
            </div>
        </div>
    );
};

export default RetakeRiskQuestionnaire;