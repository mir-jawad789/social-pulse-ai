
import React from 'react';
import type { HistoricalReport } from '../types';
import { HistoryIcon } from './Icons';

interface SearchHistoryProps {
  history: HistoricalReport[];
  onClearHistory: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onClearHistory }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <div className="text-purple-400">
          <HistoryIcon />
        </div>
        <h2 className="text-2xl font-bold ml-3 text-gray-100">Search History</h2>
      </div>
      
      {history.length > 0 ? (
        <>
            <div className="flex-grow space-y-3 overflow-y-auto pr-2">
            {history.map(item => (
                <div key={item.id} className="p-3 rounded-lg bg-gray-700/50 border border-gray-600">
                    <p className="font-semibold text-white break-words">"{item.filters.keywords || 'All Trends'}"</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                </div>
            ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
                 <button 
                    onClick={onClearHistory}
                    className="w-full text-center px-4 py-2 text-sm bg-red-800/60 text-red-200 rounded-md hover:bg-red-700/80 transition-colors"
                >
                    Clear History
                </button>
            </div>
        </>
      ) : (
        <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-400 text-center">Your search history will appear here.</p>
        </div>
      )}
    </div>
  );
};
