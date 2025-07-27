import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdvisorServiceModel = () => {
  const [serviceModel, setServiceModel] = useState('');
  const [targetClientType, setTargetClientType] = useState('');
  const [minimumAUM, setMinimumAUM] = useState('');
  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  
  const navigate = useNavigate();

  const hideMessageBox = () => {
    setShowMessageBox(false);
    setMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!serviceModel || !targetClientType) {
      setMessage('Please select your service model and target client type');
      setShowMessageBox(true);
      return;
    }

    // Save service model data to localStorage
    const serviceData = {
      serviceModel,
      targetClientType,
      minimumAUM
    };
    
    localStorage.setItem('advisorServiceModel', JSON.stringify(serviceData));
    
    // Navigate to final step
    navigate('/onboarding/advisor/complete');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Service Model</h1>
          <p className="text-gray-600">Define how you work with clients</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Service Model *
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="serviceModel"
                  value="fee-only"
                  checked={serviceModel === 'fee-only'}
                  onChange={(e) => setServiceModel(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Fee-Only</div>
                  <div className="text-sm text-gray-600">Compensation through client fees only</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="serviceModel"
                  value="commission-based"
                  checked={serviceModel === 'commission-based'}
                  onChange={(e) => setServiceModel(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Commission-Based</div>
                  <div className="text-sm text-gray-600">Compensation through product commissions</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="serviceModel"
                  value="hybrid"
                  checked={serviceModel === 'hybrid'}
                  onChange={(e) => setServiceModel(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Hybrid</div>
                  <div className="text-sm text-gray-600">Combination of fees and commissions</div>
                </div>
              </label>
            </div>
          </div>

          {/* Target Client Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Primary Client Focus *
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="targetClientType"
                  value="young-professionals"
                  checked={targetClientType === 'young-professionals'}
                  onChange={(e) => setTargetClientType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Young Professionals</div>
                  <div className="text-sm text-gray-600">Early career, building wealth</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="targetClientType"
                  value="families"
                  checked={targetClientType === 'families'}
                  onChange={(e) => setTargetClientType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Families</div>
                  <div className="text-sm text-gray-600">Family planning, education savings</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="targetClientType"
                  value="pre-retirees"
                  checked={targetClientType === 'pre-retirees'}
                  onChange={(e) => setTargetClientType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Pre-Retirees</div>
                  <div className="text-sm text-gray-600">Retirement planning, wealth preservation</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="targetClientType"
                  value="high-net-worth"
                  checked={targetClientType === 'high-net-worth'}
                  onChange={(e) => setTargetClientType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">High Net Worth</div>
                  <div className="text-sm text-gray-600">Complex portfolios, estate planning</div>
                </div>
              </label>
            </div>
          </div>

          {/* Minimum AUM */}
          <div>
            <label htmlFor="minimumAUM" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum AUM (Optional)
            </label>
            <select
              id="minimumAUM"
              value={minimumAUM}
              onChange={(e) => setMinimumAUM(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select minimum AUM</option>
              <option value="no-minimum">No minimum</option>
              <option value="100k">KSh 100,000+</option>
              <option value="500k">KSh 500,000+</option>
              <option value="1m">KSh 1,000,000+</option>
              <option value="5m">KSh 5,000,000+</option>
              <option value="10m">KSh 10,000,000+</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Complete Setup
          </button>
        </form>

        {/* Progress indicator */}
        <div className="mt-6 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">Step 2 of 3</p>

        {showMessageBox && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <p className="text-gray-800 mb-4">{message}</p>
              <button
                onClick={hideMessageBox}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorServiceModel;