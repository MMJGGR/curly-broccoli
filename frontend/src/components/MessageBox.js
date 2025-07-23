// TODO: Replace placeholder text with API-driven messages (Epic 6 Story 4, ~90% completion)
import React from 'react';

const MessageBox = ({ message, onClose }) => {
    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose}></div>
            {/* Message Box */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-2xl z-50 text-center max-w-sm border border-gray-200">
                <p className="text-gray-800 text-lg font-medium mb-4">{message}</p>
                <button className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200" onClick={onClose}>OK</button>
            </div>
        </>
    );
};

export default MessageBox;
