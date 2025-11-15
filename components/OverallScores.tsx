import React, { useMemo } from 'react';
import type { ReportData } from '../types';
import { getHeatmapColor } from '../utils/colors';

interface OverallScoresProps {
  reportData: ReportData;
}

const ScoreDisplay: React.FC<{ label: string; score: number }> = ({ label, score }) => {
    const color = getHeatmapColor(score);
    const tooltipText = label.includes('Sentiment')
    ? 'Sentiment (0-100): Measures the emotional tone. 0-40 is Negative, 41-60 is Neutral, and 61-100 is Positive.'
    : 'Excitement (0-100): Measures public buzz and engagement. 0-40 is Low, 41-60 is Moderate, and 61-100 is High.';

    return (
        <div className="relative group flex flex-col items-center text-center cursor-help">
            <span className="text-base sm:text-lg font-semibold text-gray-200">{label}</span>
            <div 
                className="mt-2 text-xl sm:text-2xl font-bold px-4 py-1.5 rounded-full" 
                style={{ 
                    backgroundColor: `${color}20`, 
                    border: `1px solid ${color}`, 
                    color 
                }}
            >
                {score}
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-center text-white bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                {tooltipText}
            </div>
        </div>
    );
};

export const OverallScores: React.FC<OverallScoresProps> = ({ reportData }) => {
  const { averageSentiment, averageExcitement } = useMemo(() => {
    const sentiments: number[] = [];
    const excitements: number[] = [];

    if (!reportData) return { averageSentiment: null, averageExcitement: null };

    Object.values(reportData.trends).forEach(trendItems => {
        if (Array.isArray(trendItems)) {
            trendItems.forEach(item => {
                if (typeof item.sentiment === 'number') {
                    sentiments.push(item.sentiment);
                }
                if (typeof item.excitementLevel === 'number') {
                    excitements.push(item.excitementLevel);
                }
            });
        }
    });

    const calculateAverage = (arr: number[]) => {
        if (arr.length === 0) return null;
        const sum = arr.reduce((acc, val) => acc + val, 0);
        return Math.round(sum / arr.length);
    };

    return {
        averageSentiment: calculateAverage(sentiments),
        averageExcitement: calculateAverage(excitements),
    };
  }, [reportData]);

  if (averageSentiment === null && averageExcitement === null) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-lg p-4 sm:p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-100 mb-4 text-center">Overall Analysis</h3>
      <div className="flex justify-around items-center gap-4">
        {averageSentiment !== null && <ScoreDisplay label="Overall Sentiment" score={averageSentiment} />}
        {averageExcitement !== null && <ScoreDisplay label="Overall Excitement" score={averageExcitement} />}
      </div>
    </div>
  );
};