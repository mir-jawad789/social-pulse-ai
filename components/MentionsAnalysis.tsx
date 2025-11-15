
import React, { useMemo } from 'react';
import type { MentionedEntity } from '../types';
import { SparklesIcon, InfoIcon } from './Icons';

interface MentionsAnalysisProps {
  mentions: MentionedEntity[];
  entityTypeFilter: string;
}

const InfluenceBar: React.FC<{ score: number }> = ({ score }) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
            className="bg-gradient-to-r from-magenta-500 to-pink-500 h-2.5 rounded-full" 
            style={{ 
                width: `${score}%`,
                backgroundImage: 'linear-gradient(to right, #d946ef, #f472b6)'
            }}
        ></div>
    </div>
);

const MentionList: React.FC<{ title: string; items: MentionedEntity[] }> = ({ title, items }) => {
    if (items.length === 0) return null;
    return (
        <div>
            <h4 className="font-semibold text-lg text-gray-300 mb-3">{title}</h4>
            <div className="flex justify-between items-center mb-2 text-xs text-gray-400 uppercase tracking-wider">
                <span>Entity</span>
                <div className="relative flex items-center gap-1 group cursor-help">
                    <span>Influence Score</span>
                    <InfoIcon />
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-sm text-center text-gray-200 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        The influence score (1-100) is determined by the AI, based on the frequency and context of each entity's mention within the identified trends.
                    </div>
                </div>
            </div>
            <ul className="space-y-4">
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-white">{item.name}</span>
                            <span className="text-sm font-bold text-gray-200">{item.influenceScore}</span>
                        </div>
                        <InfluenceBar score={item.influenceScore} />
                    </li>
                ))}
            </ul>
        </div>
    );
};


export const MentionsAnalysis: React.FC<MentionsAnalysisProps> = ({ mentions, entityTypeFilter }) => {
  const { brands, retailers, websites, celebrities } = useMemo(() => {
    const categorized: {
        brands: MentionedEntity[],
        retailers: MentionedEntity[],
        websites: MentionedEntity[],
        celebrities: MentionedEntity[]
    } = { brands: [], retailers: [], websites: [], celebrities: [] };

    mentions.forEach(mention => {
      if (mention.type === 'Brand') categorized.brands.push(mention);
      else if (mention.type === 'Retailer') categorized.retailers.push(mention);
      else if (mention.type === 'E-commerce Website') categorized.websites.push(mention);
      else if (mention.type === 'Celebrity/Influencer') categorized.celebrities.push(mention);
    });

    // Sort each category by influenceScore descending
    categorized.brands.sort((a, b) => b.influenceScore - a.influenceScore);
    categorized.retailers.sort((a, b) => b.influenceScore - a.influenceScore);
    categorized.websites.sort((a, b) => b.influenceScore - a.influenceScore);
    categorized.celebrities.sort((a, b) => b.influenceScore - a.influenceScore);


    return categorized;
  }, [mentions]);

  const showAll = entityTypeFilter === 'All';

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-lg p-6 hover:border-pink-400 transition-all duration-300">
      <div className="flex items-center mb-6">
        <div className="text-cyan-400">
            <SparklesIcon />
        </div>
        <h2 className="text-2xl font-bold ml-3 text-gray-100">Key Mentions</h2>
      </div>

      <div className={`grid grid-cols-1 ${showAll ? 'md:grid-cols-2' : ''} gap-8`}>
        {(showAll || entityTypeFilter === 'Brand') && <MentionList title="Top Brands" items={brands} />}
        {(showAll || entityTypeFilter === 'Retailer') && <MentionList title="Top Retailers" items={retailers} />}
        {(showAll || entityTypeFilter === 'E-commerce Website') && <MentionList title="Top E-commerce Websites" items={websites} />}
        {(showAll || entityTypeFilter === 'Celebrity/Influencer') && <MentionList title="Top Celebrities/Influencers" items={celebrities} />}
      </div>
    </div>
  );
};
