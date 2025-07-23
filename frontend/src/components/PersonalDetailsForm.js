import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';

const PersonalDetailsForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState('');
    const [kraPin, setKraPin] = useState('');
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const navigate = useNavigate();

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Saving personal details:', { firstName, lastName, dob, kraPin });
        setMessage('Saving personal details...');
        // Simulate successful save and navigate to risk questionnaire
        setTimeout(() => {
            setMessage('Personal details saved!');
            setShowMessageBox(true);
            navigate('/onboarding/risk-questionnaire');
        }, 1000);
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 max-w-2xl w-full text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Tell Us About Yourself</h1>
                <p className="text-gray-600 mb-8">Please provide your personal details to help us personalize your financial journey.</p>

                <form onSubmit={handleSubmit} className="space-y-6 mb-6 text-left">
                    <div>
                        <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
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
                        <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
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
                        <label htmlFor="dob" className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
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
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full"
                    >
                        Next: Risk Questionnaire
                    </button>
                </form>

                {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
            </div>
        </div>
    );
};

export default PersonalDetailsForm;