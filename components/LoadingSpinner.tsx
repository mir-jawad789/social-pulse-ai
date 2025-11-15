import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4" aria-live="polite" aria-busy="true">
    <div className="w-24 h-24">
      <svg viewBox="0 0 100 100" className="animate-spin" style={{ animationDuration: '4s' }}>
        <defs>
          <linearGradient id="galaxyArm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67e8f9" /> 
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g style={{ filter: 'url(#glow)' }}>
          {/* Main spiral arms */}
          <path d="M50 50 C 80 20, 80 80, 50 50" stroke="url(#galaxyArm)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M50 50 C 20 80, 20 20, 50 50" stroke="url(#galaxyArm)" strokeWidth="6" fill="none" strokeLinecap="round" />
          
          {/* Central point */}
          <circle cx="50" cy="50" r="5" fill="#67e8f9" />
          
          {/* Smaller outer stars/dots */}
          <circle cx="20" cy="20" r="2" fill="#f0abfc" />
          <circle cx="80" cy="80" r="2" fill="#f0abfc" />
          <circle cx="75" cy="25" r="1.5" fill="#a5f3fc" />
          <circle cx="25" cy="75" r="1.5" fill="#a5f3fc" />
        </g>
      </svg>
    </div>
    <p className="text-lg text-gray-200">Analyzing the digital cosmos...</p>
  </div>
);