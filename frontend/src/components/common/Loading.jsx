import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Loading = ({ message = 'Loading...', fullScreen = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <FaSpinner className="text-5xl text-blue-600 animate-spin" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{message}</h3>
        <p className="text-gray-600 text-sm">Please wait while we process your request</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 flex justify-center">
      {content}
    </div>
  );
};

export default Loading;