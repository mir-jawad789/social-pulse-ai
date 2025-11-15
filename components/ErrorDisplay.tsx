import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  showTips?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, showTips }) => {
  return (
    <div className="text-center text-red-300 bg-red-900/40 p-6 rounded-lg border border-red-700/50 flex flex-col items-center gap-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold">An Error Occurred</h3>
      </div>
      <p className="max-w-md">{message}</p>
      
      {showTips && (
        <div className="text-sm text-yellow-300 bg-yellow-900/30 p-3 rounded-md mt-2">
            <h4 className="font-bold mb-1">💡 Quick Tips:</h4>
            <ul className="list-disc list-inside text-left text-xs">
                <li>Try simplifying your keywords or check for typos.</li>
                <li>Consider using OR logic instead of AND for broader results.</li>
                <li>Try selecting a longer time range, like "Last 7 Days".</li>
            </ul>
        </div>
      )}
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-4 px-5 py-2 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition-colors duration-300 flex items-center gap-2 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
};
