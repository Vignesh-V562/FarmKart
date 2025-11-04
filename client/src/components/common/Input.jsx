import React from 'react';

const Input = ({ id, label, type = 'text', placeholder, icon, required = false, ...props }) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-gray-600 font-medium mb-1 text-sm"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-gray-800 text-base ${
            icon ? 'pl-10 pr-3' : ''
          }`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;