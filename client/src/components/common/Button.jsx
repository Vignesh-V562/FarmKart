import React from 'react';

const Button = ({ children, type = 'button', onClick, className = '', variant = 'primary' }) => {
  const baseStyles =
    'w-full py-3 px-4 rounded-lg font-medium text-base shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-md';

  const variants = {
    primary: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-300',
    google:
      'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600 focus:ring-blue-400 flex items-center justify-center gap-2',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;