
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  count: number;
}

interface TrendChartProps {
  data: ChartData[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-lg p-4 sm:p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-100 mb-4 text-center">Trend Breakdown</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorTrends" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#d946ef" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 182, 255, 0.2)" />
            <XAxis dataKey="name" tick={{ fill: '#D5D1F5' }} />
            <YAxis allowDecimals={false} tick={{ fill: '#D5D1F5' }} />
            <Tooltip
              cursor={{ fill: 'rgba(216, 180, 254, 0.1)' }}
              contentStyle={{
                backgroundColor: 'rgba(30, 27, 75, 0.8)',
                borderColor: '#a78bfa',
                borderRadius: '0.5rem',
                backdropFilter: 'blur(4px)',
              }}
              labelStyle={{ color: '#f0edff' }}
            />
            <Bar dataKey="count" fill="url(#colorTrends)" name="Number of Trends" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
