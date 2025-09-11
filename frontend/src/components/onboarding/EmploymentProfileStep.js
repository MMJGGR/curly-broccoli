/**
 * EmploymentProfileStep - Step 5 of onboarding
 * CFA-compliant employment profile for discount rate calculation
 */
import React, { useState, useEffect } from 'react';

const EmploymentProfileStep = ({ onboardingContext }) => {
  const { 
    employmentData, 
    updateEmploymentData, 
    saveStep 
  } = onboardingContext || {};
  
  const [formData, setFormData] = useState({
    industry_sector: employmentData?.industry_sector || '',
    job_role_level: employmentData?.job_role_level || '',
    employment_type: employmentData?.employment_type || '',
    company_size: employmentData?.company_size || 'medium',
    years_current_employer: employmentData?.years_current_employer || '',
    years_current_industry: employmentData?.years_current_industry || '',
    total_work_experience: employmentData?.total_work_experience || '',
    income_variability: employmentData?.income_variability || 'fixed',
    bonus_percentage: employmentData?.bonus_percentage || 0,
    work_location: employmentData?.work_location || '',
    skill_obsolescence_risk: employmentData?.skill_obsolescence_risk || 'medium',
    job_security_perception: employmentData?.job_security_perception || 'stable'
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    updateEmploymentData(formData);
  }, [formData, updateEmploymentData]);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.industry_sector) newErrors.industry_sector = 'Industry sector is required';
    if (!formData.job_role_level) newErrors.job_role_level = 'Job level is required';
    if (!formData.employment_type) newErrors.employment_type = 'Employment type is required';
    if (!formData.work_location) newErrors.work_location = 'Work location is required';
    
    // Validate numeric fields
    if (formData.years_current_employer && (isNaN(formData.years_current_employer) || formData.years_current_employer < 0)) {
      newErrors.years_current_employer = 'Must be a positive number';
    }
    if (formData.years_current_industry && (isNaN(formData.years_current_industry) || formData.years_current_industry < 0)) {
      newErrors.years_current_industry = 'Must be a positive number';
    }
    if (formData.total_work_experience && (isNaN(formData.total_work_experience) || formData.total_work_experience < 0)) {
      newErrors.total_work_experience = 'Must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSaveStep = async () => {
    if (validateForm()) {
      await saveStep(5, formData, true);
    }
  };
  
  const industryOptions = [
    { value: 'government', label: 'Government' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'legal', label: 'Legal' },
    { value: 'accounting', label: 'Accounting' },
    { value: 'financial_services', label: 'Financial Services' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'technology', label: 'Technology' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'construction', label: 'Construction' },
    { value: 'startup', label: 'Startup' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'tourism', label: 'Tourism' },
    { value: 'telecommunications', label: 'Telecommunications' },
    { value: 'retail', label: 'Retail' },
    { value: 'other', label: 'Other' }
  ];

  const jobLevelOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' },
    { value: 'owner', label: 'Business Owner' }
  ];

  const employmentTypeOptions = [
    { value: 'permanent', label: 'Permanent Employee' },
    { value: 'contract', label: 'Contract/Temporary' },
    { value: 'freelance', label: 'Freelancer/Consultant' },
    { value: 'business_owner', label: 'Business Owner' }
  ];

  const locationOptions = [
    { value: 'nairobi', label: 'Nairobi' },
    { value: 'mombasa', label: 'Mombasa' },
    { value: 'kisumu', label: 'Kisumu' },
    { value: 'nakuru', label: 'Nakuru' },
    { value: 'eldoret', label: 'Eldoret' },
    { value: 'rural', label: 'Rural Area' },
    { value: 'remote', label: 'Remote Work' },
    { value: 'other', label: 'Other' }
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Employment Profile</h3>
        <p className="text-sm text-gray-600 mt-1">
          Help us understand your career situation for better financial planning
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Industry Sector */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Industry Sector *
          </label>
          <select
            value={formData.industry_sector}
            onChange={(e) => handleChange('industry_sector', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.industry_sector ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Industry</option>
            {industryOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.industry_sector && (
            <p className="text-red-500 text-sm mt-1">{errors.industry_sector}</p>
          )}
        </div>

        {/* Job Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Job Level *
          </label>
          <select
            value={formData.job_role_level}
            onChange={(e) => handleChange('job_role_level', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.job_role_level ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Level</option>
            {jobLevelOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.job_role_level && (
            <p className="text-red-500 text-sm mt-1">{errors.job_role_level}</p>
          )}
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Employment Type *
          </label>
          <select
            value={formData.employment_type}
            onChange={(e) => handleChange('employment_type', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.employment_type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Type</option>
            {employmentTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.employment_type && (
            <p className="text-red-500 text-sm mt-1">{errors.employment_type}</p>
          )}
        </div>

        {/* Work Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Work Location *
          </label>
          <select
            value={formData.work_location}
            onChange={(e) => handleChange('work_location', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.work_location ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Location</option>
            {locationOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.work_location && (
            <p className="text-red-500 text-sm mt-1">{errors.work_location}</p>
          )}
        </div>

        {/* Years at Current Employer */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Years at Current Employer
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={formData.years_current_employer}
            onChange={(e) => handleChange('years_current_employer', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.years_current_employer ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 2.5"
          />
          {errors.years_current_employer && (
            <p className="text-red-500 text-sm mt-1">{errors.years_current_employer}</p>
          )}
        </div>

        {/* Years in Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Years in Current Industry
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={formData.years_current_industry}
            onChange={(e) => handleChange('years_current_industry', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.years_current_industry ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 5"
          />
          {errors.years_current_industry && (
            <p className="text-red-500 text-sm mt-1">{errors.years_current_industry}</p>
          )}
        </div>

        {/* Total Work Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Work Experience
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={formData.total_work_experience}
            onChange={(e) => handleChange('total_work_experience', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.total_work_experience ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 8"
          />
          {errors.total_work_experience && (
            <p className="text-red-500 text-sm mt-1">{errors.total_work_experience}</p>
          )}
        </div>

        {/* Income Variability */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Income Type
          </label>
          <select
            value={formData.income_variability}
            onChange={(e) => handleChange('income_variability', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="fixed">Fixed Salary</option>
            <option value="commission_based">Commission Based</option>
            <option value="seasonal">Seasonal</option>
            <option value="project_based">Project Based</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={handleSaveStep}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Employment Profile
        </button>
      </div>
    </div>
  );
};

export default EmploymentProfileStep;