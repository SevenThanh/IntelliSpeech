import React from 'react';

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  error,
  label,
  ...props 
}) => {
  const baseClasses = 'w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 text-gray-900 placeholder-gray-500 focus:outline-none';
  const stateClasses = error 
    ? 'border-red-300 focus:border-red-500 bg-red-50' 
    : 'border-gray-200 focus:border-blue-500 bg-white hover:border-gray-300';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${baseClasses} ${stateClasses} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input; 