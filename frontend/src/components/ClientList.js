import React, { useState } from 'react';
import MessageBox from './MessageBox';

const ClientList = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    const showActionMessage = (actionName) => {
        setMessage('Action: ' + actionName + ' (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const clients = [
        { id: 'client1', name: 'Jamal Mwangi', netWorth: '-KES 230,000', nextReview: 'Aug 15, 2025', status: 'Needs Review' },
        { id: 'client2', name: 'Aisha Khan', netWorth: 'KES 1,200,000', nextReview: 'Sep 10, 2025', status: 'On Track' },
        { id: 'client3', name: 'David Kimani', netWorth: 'KES 50,000', nextReview: 'Jul 20, 2025', status: 'Urgent Action' },
        { id: 'client4', name: 'Grace Wanjiku', netWorth: 'KES 800,000', nextReview: 'Oct 01, 2025', status: 'On Track' },
    ];

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Clients</h1>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                        <input type="text" placeholder="Search clients..." className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 flex-grow" />
                        <select className="shadow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500">
                            <option>All Statuses</option>
                            <option>Needs Review</option>
                            <option>On Track</option>
                            <option>Urgent Action</option>
                        </select>
                        <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md" onClick={() => showActionMessage('Add New Client')}>
                            Add New Client
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left rounded-tl-lg">Date</th>
                                    <th className="py-3 px-6 text-left">Description</th>
                                    <th className="py-3 px-6 text-left">Amount</th>
                                    <th className="py-3 px-6 text-left">Category</th>
                                    <th className="py-3 px-6 text-left rounded-tr-lg">Account</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm font-light">
                                {clients.map((client) => (
                                    <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">{client.name}</td>
                                        <td className="py-3 px-6 text-left">{client.netWorth}</td>
                                        <td className="py-3 px-6 text-left">{client.nextReview}</td>
                                        <td className="py-3 px-6 text-left">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                client.status === 'Needs Review' ? 'bg-yellow-200 text-yellow-800' :
                                                client.status === 'On Track' ? 'bg-green-200 text-green-800' :
                                                'bg-red-200 text-red-800'
                                            }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <button className="text-blue-500 hover:text-blue-700 font-medium text-sm" onClick={() => onNextScreen('ClientProfile')}>
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default ClientList;
