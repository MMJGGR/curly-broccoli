// TODO: POST personal details to profile API (Epic 1 Story 2, ~90% when wired)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';
import { useOnboarding } from '../contexts/OnboardingContext';

const PersonalDetailsForm = () => {
    const { personalDetails, updatePersonalDetails, updateProfile } = useOnboarding();
    const [firstName, setFirstName] = useState(personalDetails.firstName || '');
    const [lastName, setLastName] = useState(personalDetails.lastName || '');
    const [dob, setDob] = useState(personalDetails.dob || '');
    const [kraPin, setKraPin] = useState(personalDetails.kraPin || '');
    const [nationalId, setNationalId] = useState(personalDetails.nationalId || '');
    const [dependents, setDependents] = useState(personalDetails.dependents || '');
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const navigate = useNavigate();

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!firstName || !lastName || !dob) {
            setMessage('Please fill in all required fields');
            setShowMessageBox(true);
            return;
        }
        
        // Save to onboarding context
        const personalData = { firstName, lastName, dob, kraPin, nationalId, dependents };
        updatePersonalDetails(personalData);
        
        console.log('Saving personal details:', personalData);
        setMessage('Saving personal details...');
        setShowMessageBox(true);
        
        // Save to backend immediately
        try {
            const result = await updateProfile(true); // Skip onboarding completion
            if (result && result.success) {
                setMessage('Personal details saved successfully!');
                setShowMessageBox(true);
                
                // Navigate to risk questionnaire
                setTimeout(() => {
                    navigate('/onboarding/risk-questionnaire');
                }, 1000);
            } else {
                setMessage('Personal details saved locally. Will sync when onboarding is complete.');
                setShowMessageBox(true);
                
                // Navigate anyway but data will be saved at the end
                setTimeout(() => {
                    navigate('/onboarding/risk-questionnaire');
                }, 1000);
            }
        } catch (error) {
            console.error('Failed to save personal details to backend:', error);
            setMessage('Personal details saved locally. Will sync when onboarding is complete.');
            setShowMessageBox(true);
            
            // Navigate anyway but data will be saved at the end
            setTimeout(() => {
                navigate('/onboarding/risk-questionnaire');
            }, 1000);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 max-w-2xl w-full text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Tell Us About Yourself</h1>
                <p className="text-gray-600 mb-8">Please provide your personal details to help us personalize your financial journey.</p>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                    <div className="bg-blue-600 h-2.5 rounded-full w-[20%]"></div>
                    <p className="text-sm text-gray-600 mt-2">Step 1 of 5</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mb-6 text-left">
                    <div>
                        <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">First Name *</label>
                        <input
                            type="text"
                            id="firstName"
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">Last Name *</label>
                        <input
                            type="text"
                            id="lastName"
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="dob" className="block text-gray-700 text-sm font-bold mb-2">Date of Birth *</label>
                        <input
                            type="date"
                            id="dob"
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="nationalId" className="block text-gray-700 text-sm font-bold mb-2">National ID</label>
                        <input
                            type="text"
                            id="nationalId"
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="12345678"
                            value={nationalId}
                            onChange={(e) => setNationalId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="kraPin" className="block text-gray-700 text-sm font-bold mb-2">KRA Pin (Optional)</label>
                        <input
                            type="text"
                            id="kraPin"
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="A123456789Z"
                            value={kraPin}
                            onChange={(e) => setKraPin(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="dependents" className="block text-gray-700 text-sm font-bold mb-2">Number of Dependents</label>
                        <input
                            type="number"
                            id="dependents"
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="0"
                            value={dependents}
                            onChange={(e) => setDependents(e.target.value)}
                            min="0"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/auth')}
                            className="bg-gray-300 text-gray-700 py-3 px-8 rounded-lg font-semibold hover:bg-gray-400 transition-all duration-300 shadow-lg flex-1"
                        >
                            ← Back to Login
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg flex-1"
                        >
                            Next: Risk Questionnaire
                        </button>
                    </div>
                </form>

                {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
            </div>
        </div>
    );
};

export default PersonalDetailsForm;