
import React from 'react';
import type { TrendItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getHeatmapColor } from '../utils/colors';

interface TrendCardProps {
  title: string;
  trends: TrendItem[];
  icon: React.ReactNode;
}

const HeatmapBadge: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  const color = getHeatmapColor(score);
  const tooltipText = label === 'Sentiment'
    ? 'Sentiment (0-100): Measures the emotional tone. 0-40 is Negative, 41-60 is Neutral, and 61-100 is Positive.'
    : 'Excitement (0-100): Measures public buzz and engagement. 0-40 is Low, 41-60 is Moderate, and 61-100 is High.';

  return (
    <div className="relative group flex items-center gap-2 text-xs font-semibold cursor-help">
      <span className="text-gray-300">{label}:</span>
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}`}}>
        <span style={{ color }}>{score}</span>
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-center text-white bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            {tooltipText}
      </div>
    </div>
  );
};


export const TrendCard: React.FC<TrendCardProps> = ({ title, trends, icon }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-lg p-6 hover:border-pink-400 hover:scale-[1.02] transform transition-all duration-300 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <div className="text-cyan-400">{icon}</div>
        <h2 className="text-2xl font-bold ml-3 text-gray-100">{title}</h2>
      </div>
      <ul className="space-y-6 flex-grow">
        {trends.map((item, index) => {
            const breakdownData = item.monthlyBreakdown && Object.keys(item.monthlyBreakdown).length > 0
                ? Object.entries(item.monthlyBreakdown).map(([name, score]) => ({ name, score }))
                : null;

            return (
              <li key={index} className="border-l-4 border-pink-500 pl-4 py-2">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-white">{item.topic}</h3>
                </div>
                <p className="text-gray-400 mt-1">{item.description}</p>
                
                {(typeof item.sentiment === 'number' || typeof item.excitementLevel === 'number') && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                        {typeof item.sentiment === 'number' && <HeatmapBadge label="Sentiment" score={item.sentiment} />}
                        {typeof item.excitementLevel === 'number' && <HeatmapBadge label="Excitement" score={item.excitementLevel} />}
                    </div>
                )}
                
                 {breakdownData && (
                    <div className="mt-3" style={{ width: '100%', height: 100 }}>
                        <ResponsiveContainer>
                            <BarChart data={breakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" fontSize={12} tick={{ fill: '#B8B2E0' }} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tick={{ fill: '#B8B2E0' }} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(219, 39, 119, 0.1)' }}
                                    contentStyle={{ backgroundColor: 'rgba(30, 27, 75, 0.8)', borderColor: '#a78bfa', borderRadius: '0.5rem', backdropFilter: 'blur(4px)' }}
                                    labelStyle={{ color: '#f0edff' }}
                                />
                                <Bar dataKey="score" fill="#d946ef" name="Popularity" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
              </li>
            )
        })}
      </ul>
    </div>
  );
};
