// TODO: Use listMilestones() for timeline events (Epic 2 Story 1, ~75% once connected)
import React, { useEffect, useState } from 'react';
import MessageBox from './MessageBox';
import { useTimeline } from '../contexts/TimelineContext';

const LifetimeJourneyTimeline = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const { milestones, loadTimelineJourney, addMilestone } = useTimeline();

    const showActionMessage = (actionName) => {
        setMessage('Viewing details for: ' + actionName + ' (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    useEffect(() => {
        if (process.env.NODE_ENV === 'test') return;
        loadTimelineJourney();
    }, [loadTimelineJourney]);

    const addOne = async () => {
        showActionMessage('Add Custom Milestone');
        const localItem = { title: 'New Milestone', target_amount: 0, target_age: 0, category: 'general', priority: 'medium' };
        // optimistic UI not necessary; load after create
        try {
            await addMilestone(localItem);
            await loadTimelineJourney();
        } catch (err) {
            console.error(err);
            loadTimelineJourney();
        }
    };

    const updateOne = async (index) => {
        // Editing milestones is not yet supported via clean endpoints
        showActionMessage('Milestone editing coming soon');
    };

    const removeOne = async (index) => {
        // Deleting milestones is not yet supported via clean endpoints
        showActionMessage('Milestone deletion not available in this phase');
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
