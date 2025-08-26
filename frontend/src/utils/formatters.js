/**
 * Utility functions for formatting currency, dates, and percentages
 * Used across Asset and Expense management components
 */

/**
 * Format currency values in KES (Kenyan Shillings)
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'KES 0.00';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'KES 0.00';
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

/**
 * Format date values for display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'Not specified';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Format date for datetime-local input fields
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted datetime string for input
 */
export const formatDateTimeLocal = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toISOString().slice(0, 16);
};

/**
 * Format percentage values
 * @param {number} percentage - The percentage to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (percentage, decimals = 1) => {
  if (percentage === null || percentage === undefined) return '0.0%';
  
  const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  if (isNaN(numPercentage)) return '0.0%';
  
  return `${numPercentage.toFixed(decimals)}%`;
};

/**
 * Format number with commas for thousands separator
 * @param {number|string} number - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  
  const numValue = typeof number === 'string' ? parseFloat(number) : number;
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('en-KE').format(numValue);
};

/**
 * Format relative time (e.g., "2 days ago", "in 3 months")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 0) return `${diffDays} days ago`;
  return `in ${Math.abs(diffDays)} days`;
};

/**
 * Format duration in months to human readable string
 * @param {number} months - Number of months
 * @returns {string} Human readable duration
 */
export const formatDuration = (months) => {
  if (!months || months <= 0) return 'Not specified';
  
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }
  
  const yearPart = years === 1 ? '1 year' : `${years} years`;
  const monthPart = remainingMonths === 1 ? '1 month' : `${remainingMonths} months`;
  
  return `${yearPart}, ${monthPart}`;
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};