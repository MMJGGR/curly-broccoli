import React, { useEffect, useState } from 'react';
import { getIncomeOverview, createIncomeSource, listIncomeSources } from '../../api';
import MessageBox from '../MessageBox';

const IncomeOverview = ({ onNextScreen }) => {
  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [overview, setOverview] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newSource, setNewSource] = useState({
    source_name: '',
    monthly_amount: '',
    frequency: 'monthly',
    source_type: 'salary'
  });

  const fetchIncomeData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [overviewData, sourcesData] = await Promise.all([
        getIncomeOverview(),
        listIncomeSources()
      ]);
      
      setOverview(overviewData);
      setSources(sourcesData.sources || []);
    } catch (err) {
      console.error('Error fetching income data:', err);
      showActionMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    fetchIncomeData();
  }, [fetchIncomeData]);

  const showActionMessage = (message) => {
    setMessage(message);
    setShowMessageBox(true);
  };

  const hideMessageBox = () => {
    setShowMessageBox(false);
    setMessage('');
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    
    if (!newSource.source_name || !newSource.monthly_amount) {
      showActionMessage('Please fill in all required fields');
      return;
    }

    try {
      const sourceData = {
        source_name: newSource.source_name,
        monthly_amount: parseFloat(newSource.monthly_amount),
        frequency: newSource.frequency,
        source_type: newSource.source_type
      };

      await createIncomeSource(null, sourceData);
      showActionMessage('Income source added successfully!');
      
      // Reset form and refresh data
      setNewSource({
        source_name: '',
        monthly_amount: '',
        frequency: 'monthly',
        source_type: 'salary'
      });
      setShowAddForm(false);
      await fetchIncomeData();
      
    } catch (err) {
      console.error('Error adding income source:', err);
      showActionMessage(`Error adding source: ${err.message}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // CFA-Level Income Analysis Functions
  const calculateIncomeStability = (sources) => {
    if (!sources || sources.length === 0) return 0;
    
    const totalIncome = sources.reduce((sum, source) => sum + (source.amount || 0), 0);
    if (totalIncome === 0) return 0;
    
    // Calculate Herfindahl-Hirschman Index for income concentration
    const hhi = sources.reduce((sum, source) => {
      const percentage = (source.amount || 0) / totalIncome;
      return sum + (percentage * percentage);
    }, 0);
    
    // Convert to stability score (lower HHI = higher stability)
    return Math.max(0, Math.min(100, (1 - hhi) * 100));
  };

  const getIncomeStabilityColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIncomeStabilityLabel = (score) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  const getIncomeBreakdown = (sources) => {
    if (!sources || sources.length === 0) return [];
    
    const totalIncome = sources.reduce((sum, source) => sum + (source.amount || 0), 0);
    if (totalIncome === 0) return [];
    
    const breakdown = {};
    sources.forEach(source => {
      const type = source.source_type || 'other';
      const category = getCategoryFromType(type);
      breakdown[category] = (breakdown[category] || 0) + (source.amount || 0);
    });
    
    return Object.entries(breakdown).map(([type, amount]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      percentage: Math.round((amount / totalIncome) * 100)
    })).sort((a, b) => b.percentage - a.percentage);
  };

  const getCategoryFromType = (type) => {
    const categories = {
      'salary': 'active',
      'freelance': 'active', 
      'business': 'mixed',
      'investment': 'passive',
      'rental': 'passive',
      'pension': 'fixed',
      'other': 'other'
    };
    return categories[type] || 'other';
  };

  const getCFARecommendations = (sources) => {
    const recommendations = [];
    const totalIncome = sources.reduce((sum, source) => sum + (source.amount || 0), 0);
    const stability = calculateIncomeStability(sources);
    
    if (stability < 40) {
      recommendations.push('Consider diversifying income sources to reduce risk');
    }
    
    if (sources.length === 1) {
      recommendations.push('Single income source increases financial risk - consider multiple streams');
    }
    
    const passiveIncome = sources.filter(s => ['investment', 'rental'].includes(s.source_type))
      .reduce((sum, source) => sum + (source.amount || 0), 0);
    const passivePercentage = totalIncome > 0 ? (passiveIncome / totalIncome) * 100 : 0;
    
    if (passivePercentage < 10) {
      recommendations.push('Build passive income sources for long-term financial security');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Good income diversification - maintain current strategy');
    }
    
    return recommendations;
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading income data...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Income Management</h1>
          <button
            className="bg-green-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Income Source'}
          </button>
        </div>

        {/* Income Overview Summary with CFA Analysis */}
        {overview && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Income Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(overview.monthly_totals?.total_monthly_income || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Active Sources</p>
                <p className="text-2xl font-bold text-blue-600">
                  {overview.summary?.total_sources || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Primary Source</p>
                <p className="text-lg font-semibold text-gray-800">
                  {overview.summary?.primary_source_name || 'None'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Income Stability</p>
                <p className={`text-2xl font-bold ${
                  getIncomeStabilityColor(calculateIncomeStability(sources))
                }`}>
                  {getIncomeStabilityLabel(calculateIncomeStability(sources))}
                </p>
              </div>
            </div>
            
            {/* CFA-Level Income Risk Assessment */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Professional Risk Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Income Diversification</h4>
                  <div className="space-y-1">
                    {getIncomeBreakdown(sources).map((breakdown, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-blue-700">{breakdown.type}:</span>
                        <span className="font-medium">{breakdown.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">CFA Recommendations</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {getCFARecommendations(sources).map((rec, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Source Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Income Source</h2>
            <form onSubmit={handleAddSource} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Name *
                </label>
                <input
                  type="text"
                  value={newSource.source_name}
                  onChange={(e) => setNewSource({...newSource, source_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Main Job, Freelance, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Amount (KES) *
                </label>
                <input
                  type="number"
                  value={newSource.monthly_amount}
                  onChange={(e) => setNewSource({...newSource, monthly_amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Type
                </label>
                <select
                  value={newSource.source_type}
                  onChange={(e) => setNewSource({...newSource, source_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="salary">Employment Salary (Active Income)</option>
                  <option value="freelance">Freelance/Contract (Active Income)</option>
                  <option value="business">Business Income (Active/Passive)</option>
                  <option value="investment">Investment Income (Passive)</option>
                  <option value="rental">Rental Income (Passive)</option>
                  <option value="pension">Pension/Retirement (Fixed)</option>
                  <option value="other">Other Income Source</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={newSource.frequency}
                  onChange={(e) => setNewSource({...newSource, frequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md"
                >
                  Add Source
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Income Sources List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sources.length > 0 ? (
            sources.map((source, index) => (
              <div key={source.id || index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{source.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {source.source_type || 'salary'}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(source.amount || 0)}
                  </p>
                  <p className="text-sm text-gray-600">per month</p>
                </div>
                <div className="text-sm text-gray-700">
                  <p>Frequency: {source.frequency || 'monthly'}</p>
                  {source.created_at && (
                    <p>Added: {new Date(source.created_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-3 text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Income Sources Yet</h3>
              <p className="text-gray-600 mb-4">
                Start by adding your income sources to track your financial progress.
              </p>
              <button
                className="bg-green-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg"
                onClick={() => setShowAddForm(true)}
              >
                Add Your First Income Source
              </button>
            </div>
          )}
        </div>
      </main>

      {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
    </div>
  );
};

export default IncomeOverview;