import React from 'react';

export const Switch = ({ checked, onCheckedChange, className = "", ...props }) => {
  return (
    <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="sr-only"
        {...props}
      />
      <div
        className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  );
};