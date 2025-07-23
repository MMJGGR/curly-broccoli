// TODO: Use listMilestones() for timeline events (Epic 2 Story 1, ~75% once connected)
import React, { useEffect, useState } from 'react';
import MessageBox from './MessageBox';
import { listMilestones, createMilestone, updateMilestone, deleteMilestone } from '../api';

const LifetimeJourneyTimeline = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [milestones, setMilestones] = useState([]);

    const showActionMessage = (actionName) => {
        setMessage('Viewing details for: ' + actionName + ' (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const fetchMilestones = async () => {
        try {
            const data = await listMilestones();
            if (Array.isArray(data)) setMilestones(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (process.env.NODE_ENV === 'test') return;
        fetchMilestones();
    }, []);

    const addOne = async () => {
        showActionMessage('Add Custom Milestone');
        const newItem = { age: 0, phase: 'Custom', event: 'New Milestone', assets: '', liabs: '', netWorth: '', advice: '' };
        setMilestones(m => [...m, newItem]);
        try {
            const created = await createMilestone(undefined, newItem);
            if (created && created.id) {
                setMilestones(m => m.map(item => item === newItem ? created : item));
            }
        } catch (err) {
            console.error(err);
            fetchMilestones();
        }
    };

    const updateOne = async (index) => {
        const item = milestones[index];
        const updated = { ...item, age: item.age + 1 };
        setMilestones(m => m.map((it, i) => i === index ? updated : it));
        try {
            await updateMilestone(undefined, item.id || index, updated);
        } catch (err) {
            console.error(err);
            fetchMilestones();
        }
    };

    const removeOne = async (index) => {
        const item = milestones[index];
        const prev = [...milestones];
        setMilestones(m => m.filter((_, i) => i !== index));
        try {
            await deleteMilestone(undefined, item.id || index);
        } catch (err) {
            console.error(err);
            setMilestones(prev);
        }
    };


    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Lifetime Financial Journey</h1>

                <div className="relative py-8">
                    {/* Timeline Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-blue-300 h-full hidden md:block"></div>

                    <div className="flex flex-col items-center md:items-stretch">
                        {milestones.map((item, index) => (
                            <div key={index} className={`flex w-full ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-8`}>
                                <div className="hidden md:block w-1/2"></div> {/* Empty div for spacing on one side */}
                                <div className="z-10 flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full shadow-lg flex-shrink-0 text-white font-bold text-sm">
                                    {item.age}
                                </div>
                                <div className={`flex-grow bg-white rounded-xl shadow-lg p-6 mx-4 w-full md:w-1/2 ${index % 2 === 0 ? 'md:ml-8' : 'md:mr-8'}`}>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.event}</h3>
                                    <p className="text-sm text-gray-600 mb-3">Age: {item.age} | Phase: {item.phase}</p>
                                    <div className="text-gray-700 text-sm mb-3">
                                        <p><strong>Assets:</strong> {item.assets}</p>
                                        <p><strong>Liabilities:</strong> {item.liabs}</p>
                                        <p><strong>Net Worth:</strong> {item.netWorth}</p>
                                    </div>
                                    <p className="text-blue-700 text-sm italic mb-4">{item.advice}</p>
                                    <button
                                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md text-sm"
                                        onClick={() => updateOne(index)}
                                    >
                                        Take Action on this Advice
                                    </button>
                                    <button
                                        className="ml-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md text-sm"
                                        onClick={() => removeOne(index)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-8">
                    <button className="bg-green-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg" onClick={addOne}>
                        + Add Custom Milestone
                    </button>
                </div>
            </main>

            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default LifetimeJourneyTimeline;
