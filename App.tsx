import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { fetchTrends } from './services/geminiService';
import type { TrendReport, TrendItem, GroundingChunk, MentionedEntity, ReportData, HistoricalReport, TrendFilters } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TrendCard } from './components/TrendCard';
import { SourceLink } from './components/SourceLink';
import { GoogleIcon, TikTokIcon, RedditIcon, InstagramIcon, FacebookIcon, XIcon, ExportIcon } from './components/Icons';
import { TrendChart } from './components/TrendChart';
import { MentionsAnalysis } from './components/MentionsAnalysis';
import { AboutPage } from './components/AboutPage';
import { SearchHistory } from './components/SearchHistory';
import { OverallScores } from './components/OverallScores';
import { ErrorDisplay } from './components/ErrorDisplay';

type View = 'main' | 'about';


function App() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('main');

  const [country, setCountry] = useState<string>('Australia');
  const [timeRange, setTimeRange] = useState<string>('24 hours');
  const [language, setLanguage] = useState<string>('English');
  const [textDirection, setTextDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [inputDirection, setInputDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [keywords, setKeywords] = useState<string>('');
  const [keywordLogic, setKeywordLogic] = useState<'AND' | 'OR'>('OR');
  const [entityType, setEntityType] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'default' | 'alphabetical'>('default');

  const [searchHistory, setSearchHistory] = useState<HistoricalReport[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('aiTrendSpotterHistory');
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load search history from localStorage", e);
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
      const rtlLanguages = ['Arabic', 'Urdu', 'Hindi'];
      const isRtl = rtlLanguages.includes(language);
      setTextDirection(isRtl ? 'rtl' : 'ltr');
      setInputDirection(isRtl ? 'rtl' : 'ltr');
  }, [language]);


  const addToHistory = (filters: TrendFilters, reportData: ReportData) => {
    const newEntry: HistoricalReport = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      filters,
      reportData,
    };
    setSearchHistory(prev => {
      const updatedHistory = [newEntry, ...prev].slice(0, 10); // Keep last 10
      try {
        localStorage.setItem('aiTrendSpotterHistory', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error("Failed to save search history to localStorage", e);
      }
      return updatedHistory;
    });
  };

  const handleClearHistory = () => {
      setSearchHistory([]);
      try {
        localStorage.removeItem('aiTrendSpotterHistory');
      } catch (e) {
        console.error("Failed to clear search history from localStorage", e);
      }
  };


  const today = useMemo(() => new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
  }), []);
  
  const resetReports = () => {
    setReport(null);
    setError(null);
    setSortOrder('default');
  };

  const handleFetchTrends = useCallback(async () => {
    setIsLoading(true);
    resetReports();

    try {
      const filters = { country, timeRange, language, keywords, logic: keywordLogic, entityType };
      const fetchedReport = await fetchTrends(filters);
      setReport(fetchedReport);
      addToHistory(filters, fetchedReport);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }

    setIsLoading(false);
  }, [country, timeRange, language, keywords, keywordLogic, entityType]);


  const handleExportCSV = () => {
    if (!report) return;

    const escapeCsvCell = (cell: string | number | null | undefined): string => {
        if (cell === null || cell === undefined) return '';
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };
    
    const getPlatformName = (key: string) => ({
      googleTrends: 'Google',
      tiktokTrends: 'TikTok',
      redditTrends: 'Reddit',
      instagramTrends: 'Instagram',
      facebookTrends: 'Facebook',
      xTrends: 'X',
    }[key] || 'Unknown');

    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "Platform,Topic,Description,Sentiment,Excitement Level\r\n";
    Object.entries(report.trends).forEach(([platformKey, trendItems]) => {
        if (Array.isArray(trendItems)) {
            const platformName = getPlatformName(platformKey);
            trendItems.forEach(item => {
                const row = [platformName, item.topic, item.description, item.sentiment, item.excitementLevel].map(escapeCsvCell).join(',');
                csvContent += row + "\r\n";
            });
        }
    });
    csvContent += "\r\n";
    if (report.mentions.length > 0) {
        csvContent += "Mentioned Entity,Type,Influence Score\r\n";
        report.mentions.forEach(mention => {
            const row = [mention.name, mention.type, mention.influenceScore].map(escapeCsvCell).join(',');
            csvContent += row + "\r\n";
        });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `social_pulse_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedTrends = useMemo(() => {
    if (!report?.trends) return null;
    if (sortOrder === 'default') return report.trends;
    
    const sort = (trendList: TrendItem[] = []) => [...(trendList || [])].sort((a, b) => a.topic.localeCompare(b.topic));

    return {
      googleTrends: sort(report.trends.googleTrends),
      tiktokTrends: sort(report.trends.tiktokTrends),
      redditTrends: sort(report.trends.redditTrends),
      instagramTrends: sort(report.trends.instagramTrends),
      facebookTrends: sort(report.trends.facebookTrends),
      xTrends: sort(report.trends.xTrends),
    };
  }, [report, sortOrder]);
  
  const chartData = useMemo(() => {
    if (report?.trends) {
      return [
        { name: 'Google', count: report.trends.googleTrends?.length || 0 },
        { name: 'TikTok', count: report.trends.tiktokTrends?.length || 0 },
        { name: 'Reddit', count: report.trends.redditTrends?.length || 0 },
        { name: 'Instagram', count: report.trends.instagramTrends?.length || 0 },
        { name: 'Facebook', count: report.trends.facebookTrends?.length || 0 },
        { name: 'X', count: report.trends.xTrends?.length || 0 },
      ].filter(d => d.count > 0);
    }
    return [];
  }, [report]);

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} onRetry={handleFetchTrends} showTips />;
    
    if (report && sortedTrends) {
      const hasTrends = Object.values(sortedTrends).some(platformTrends => Array.isArray(platformTrends) && platformTrends.length > 0);
      if (!hasTrends) {
        return (
          <div className="text-center text-gray-400 bg-gray-800/50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">No Trends Found</h2>
            <p>Try adjusting your filters for a broader search.</p>
          </div>
        );
      }
      return (
        <div className="space-y-8 animate-fade-in">
          {chartData.length > 0 && <TrendChart data={chartData} />}
          <OverallScores reportData={report} />
          <div className="flex justify-end items-center gap-4">
            <button onClick={handleExportCSV} className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300 flex items-center gap-2 text-sm"><ExportIcon /> Export CSV</button>
            <span className="text-sm text-gray-400">Sort Trends:</span>
            <div className="bg-gray-800/50 p-1 rounded-lg flex text-sm border border-gray-700">
                <button onClick={() => setSortOrder('default')} className={`px-3 py-1 rounded-md transition-colors ${sortOrder === 'default' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Default</button>
                <button onClick={() => setSortOrder('alphabetical')} className={`px-3 py-1 rounded-md transition-colors ${sortOrder === 'alphabetical' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>A-Z</button>
            </div>
          </div>
          {report.mentions.length > 0 && <MentionsAnalysis mentions={report.mentions} entityTypeFilter={entityType} />}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTrends.googleTrends && sortedTrends.googleTrends.length > 0 && <TrendCard title="Google Trends" trends={sortedTrends.googleTrends} icon={<GoogleIcon />} />}
            {sortedTrends.tiktokTrends && sortedTrends.tiktokTrends.length > 0 && <TrendCard title="TikTok Trends" trends={sortedTrends.tiktokTrends} icon={<TikTokIcon />} />}
            {sortedTrends.redditTrends && sortedTrends.redditTrends.length > 0 && <TrendCard title="Reddit Trends" trends={sortedTrends.redditTrends} icon={<RedditIcon />} />}
            {sortedTrends.xTrends && sortedTrends.xTrends.length > 0 && <TrendCard title="X (Twitter) Trends" trends={sortedTrends.xTrends} icon={<XIcon />} />}
            {sortedTrends.instagramTrends && sortedTrends.instagramTrends.length > 0 && <TrendCard title="Instagram Trends" trends={sortedTrends.instagramTrends} icon={<InstagramIcon />} />}
            {sortedTrends.facebookTrends && sortedTrends.facebookTrends.length > 0 && <TrendCard title="Facebook Trends" trends={sortedTrends.facebookTrends} icon={<FacebookIcon />} />}
          </div>
        </div>
      );
    }

    if (!report && !isLoading) {
       return (
         <div className="text-center text-gray-400">
            <h2 className="text-2xl font-bold mb-2">Welcome to Social Pulse AI</h2>
            <p>Adjust the filters and click the button to discover the latest trends.</p>
          </div>
       );
    }
    
    return null;
  };

  const allSources = useMemo(() => {
    let sources: GroundingChunk[] = [];
    if (report) sources.push(...report.sources);
    return sources;
  }, [report]);

  if (view === 'about') {
    return <AboutPage onBack={() => setView('main')} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-8xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex justify-center items-center gap-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Social Pulse AI
            </h1>
            <button onClick={() => setView('about')} className="text-gray-400 hover:text-white transition-colors" aria-label="About this app">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-2">
            Leveraging Gemini with Google Search to bring you the latest digital zeitgeist.
          </p>
           <p className="text-sm text-gray-500 mt-2">{today}</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow">
                 <div className="bg-gray-800/50 p-4 sm:p-6 rounded-2xl mb-10 border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                        <div>
                            <label htmlFor="country-select" className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                            <select id="country-select" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2">
                                <option>🇦🇺 Australia</option>
                                <option>🇧🇷 Brazil</option>
                                <option>🇨🇦 Canada</option>
                                <option>🇫🇷 France</option>
                                <option>🇮🇳 India</option>
                                <option>🇮🇹 Italy</option>
                                <option>🇯🇵 Japan</option>
                                <option>🇵🇰 Pakistan</option>
                                <option>🇸🇦 Saudi Arabia</option>
                                <option>🇪🇸 Spain</option>
                                <option>🇦🇪 United Arab Emirates</option>
                                <option>🇬🇧 United Kingdom</option>
                                <option>🇺🇸 United States</option>
                                <option>🌍 Worldwide</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="time-range-select" className="block text-sm font-medium text-gray-300 mb-1">Time Range</label>
                             <select id="time-range-select" value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2">
                                <option value="24 hours">Last 24 Hours</option>
                                <option value="7 days">Last 7 Days</option>
                                <option value="30 days">Last 30 Days</option>
                                <option value="3 months">Last 3 Months</option>
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="language-select" className="block text-sm font-medium text-gray-300 mb-1">Language</label>
                            <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2">
                                <option>English</option>
                                <option>Arabic</option>
                                <option>Urdu</option>
                                <option>Hindi</option>
                                <option>French</option>
                                <option>Spanish</option>
                                <option>Italian</option>
                                <option>Portuguese</option>
                                <option>Japanese</option>
                            </select>
                        </div>

                         <div>
                            <label htmlFor="entity-type-select" className="block text-sm font-medium text-gray-300 mb-1">Focus On</label>
                             <select id="entity-type-select" value={entityType} onChange={(e) => setEntityType(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2">
                                <option value="All">All</option>
                                <option value="Brand">Brands</option>
                                <option value="Retailer">Retailers</option>
                                <option value="E-commerce Website">E-commerce</option>
                                <option value="Celebrity/Influencer">Celebrities/Influencers</option>
                            </select>
                        </div>
                        
                        <div className="md:col-span-2 lg:col-span-2">
                             <div className="flex justify-between items-center mb-1">
                                <label htmlFor="keywords-input" className="block text-sm font-medium text-gray-300">Keywords</label>
                            </div>
                            <div className="flex gap-2">
                                <input id="keywords-input" dir={inputDirection} type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={'e.g., "sustainable fashion"'} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2" />
                                <select aria-label="Keyword Logic" value={keywordLogic} onChange={(e) => setKeywordLogic(e.target.value as 'AND' | 'OR')} className="bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2">
                                    <option>OR</option>
                                    <option>AND</option>
                                </select>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                <strong>Pro Tip:</strong> Use quotes for phrases (e.g., "new gadgets") and commas for multiple terms. Use the dropdown to control the logic: <strong>OR</strong> finds trends related to <em>any</em> keyword, while <strong>AND</strong> requires <em>all</em> keywords to be related.
                            </p>
                        </div>
                    </div>
                </div>

              <div className="flex justify-center mb-10">
                <button onClick={handleFetchTrends} disabled={isLoading} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  {isLoading ? 'Scanning the Pulse...' : 'Generate Trend Report'}
                </button>
              </div>

              <div className="min-h-[300px]" dir={textDirection}>
                {renderContent()}
              </div>
              
              {allSources.length > 0 && !isLoading && (
                <div className="mt-12 pt-8 border-t border-gray-700 animate-fade-in">
                    <h3 className="text-xl font-semibold text-center text-gray-300 mb-4">Sources</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {allSources.map((source, index) => (
                            <SourceLink key={index} chunk={source} />
                        ))}
                    </div>
                </div>
              )}
            </div>

            <aside className="w-full lg:w-1/3 lg:min-w-[350px] lg:max-w-[400px]">
                <SearchHistory 
                    history={searchHistory}
                    onClearHistory={handleClearHistory}
                />
            </aside>
        </div>
      </div>
    </div>
  );
}

export default App;