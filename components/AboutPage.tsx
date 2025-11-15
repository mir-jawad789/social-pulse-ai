import React from 'react';
import { FAQItem } from './FAQItem';

interface AboutPageProps {
  onBack: () => void;
}

const faqs = [
  {
    question: "How up-to-date is the trend data?",
    answer: "The data is highly current. By using Google's Gemini API with Google Search grounding, the application accesses and analyzes information that is often as recent as the last 24 hours. This ensures the trends reflect the very latest conversations and events happening online."
  },
  {
    question: "What do the 'Sentiment' and 'Excitement Level' scores mean?",
    answer: "These are AI-generated metrics on a scale of 0-100, visually represented by a color-coded heatmap from purple (low) to pink (mid) to green (high). 'Sentiment' gauges emotional tone: 0-40 is Negative, 41-60 is Neutral, and 61-100 is Positive. 'Excitement Level' measures public buzz: 0-40 is Low, 41-60 is Moderate, and 61-100 is High. The 'Overall Analysis' section provides an average score for all trends in a report."
  },
  {
    question: "How does the Search History work?",
    answer: "The app automatically saves your last 10 generated reports to the 'Search History' panel. This history is stored locally in your browser, so it's private to you. It allows you to quickly revisit past findings and, more importantly, use them as a baseline for historical comparisons to track how trends evolve."
  },
  {
    question: "What kind of trend comparisons can I perform?",
    answer: "The app offers multiple comparison modes. You can compare trends for two different sets of keywords in real-time by checking the 'Compare' box. Additionally, you can use the 'Search History' panel to compare a past report against live data ('Compare to Now') or to compare any two historical reports side-by-side to track changes over time."
  },
  {
    question: "What does the 'NEW' badge on a trend mean?",
    answer: "The 'NEW' badge appears during a historical comparison (e.g., 'Compare to Now'). It highlights a trend that is present in the more recent report but was not found in the older report it's being compared against. It's a quick visual indicator of emerging topics and conversations that have gained traction since the earlier snapshot."
  },
  {
    question: "How is the 'Influence Score' for commercial mentions calculated?",
    answer: "The 'Influence Score' is another AI-generated metric. It's not a measure of market share but rather an indicator of a brand or retailer's relevance within the context of the analyzed trends. The AI calculates this score based on the frequency and prominence of mentions, with a higher score signifying greater influence in the current digital conversation."
  },
  {
    question: "Why did my search return 'No Trends Found'?",
    answer: "This usually happens when the filter combination is too specific. For example, using multiple niche keywords with 'AND' logic over a 'Last 24 Hours' time range might not yield any results. Try broadening your search by using 'OR' logic, expanding the time range, or simplifying your keywords."
  },
  {
    question: "What is the 'monthlyBreakdown' chart shown on some trends?",
    answer: "This chart appears when you select the 'Last 3 Months' time range. It provides a time-series analysis, showing the trend's relative popularity (on a scale of 1-100) for each of the last three months. It's a great way to visualize a trend's momentum—whether it's growing, stable, or fading."
  },
  {
    question: "Does this application require an API key to work?",
    answer: "Yes, this application requires a Google AI API key to communicate with the Gemini model. The key is securely managed as an environment variable within the application's environment. You do not need to enter it manually as it's pre-configured for you."
  }
];


export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 font-sans animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
              About Social Pulse AI
            </h1>
            <p className="text-lg text-gray-300">
                Understanding the technology and methodology behind the insights.
            </p>
        </header>

        <main className="space-y-12">
            <section>
                <h2 className="text-3xl font-bold mb-4 border-b-2 border-purple-500 pb-2">Data Methodology</h2>
                <div className="space-y-4 text-gray-300">
                    <p>Social Pulse AI is an advanced analytics tool designed to provide a real-time snapshot of the digital zeitgeist. Its methodology is rooted in the powerful capabilities of Google's Gemini API, combined with a sophisticated data processing pipeline.</p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li><strong>Core Engine:</strong> The application is powered by the <code className="bg-gray-700 text-pink-400 px-1 rounded">gemini-2.5-flash</code> model, chosen for its speed, accuracy, and ability to process complex, multi-faceted prompts.</li>
                        <li><strong>Data Sources:</strong> The AI actively scans and analyzes emerging patterns across a diverse set of major digital platforms: <strong>Google Search, TikTok, Reddit, X (formerly Twitter), Instagram, and Facebook</strong>.</li>
                        <li><strong>Real-time Grounding:</strong> To ensure the data is always fresh and relevant, every query is grounded using <strong>Google Search</strong>. This technique allows the AI to access and incorporate the very latest information from the web, preventing it from relying on outdated knowledge.</li>
                        <li><strong>Intelligent Analysis:</strong> The AI is given a detailed prompt that instructs it to act as an expert trend analyst. It identifies top trends based on the user's filters (country, time range, keywords) and extracts key data points including the topic, a descriptive summary, sentiment scores, and excitement levels. It also performs a secondary analysis to identify and score the influence of any mentioned commercial entities.</li>
                        <li><strong>Robust & Structured Output:</strong> The AI is instructed to return its findings in a strict JSON format. The application includes a self-correction mechanism where, if the initial response is malformed, it re-prompts the AI to fix its own syntax, ensuring a high degree of reliability.</li>
                    </ul>
                </div>
            </section>
             <section>
                <h2 className="text-3xl font-bold mb-6 border-b-2 border-purple-500 pb-2">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-bold mb-4 border-b-2 border-purple-500 pb-2">About the Architect</h2>
                <div className="space-y-4 text-gray-300">
                    <p>
                        I’m an insights specialist and AI enthusiast with a passion for understanding online user behavior. I specialize in turning data into actionable strategies, with a focus on market research, e-commerce trends, and digital growth. I enjoy testing the limits of AI’s creativity it never disappoints and keeps getting better. I love exploring the intersection of technology, economy, and human behavior to drive smarter, more informed decisions.
                    </p>
                    <p className="mt-4">
                        <strong>Mir Jawad</strong><br />
                        Sydney, Australia<br />
                        Email: <a href="mailto:mir.jawad87@gmail.com" className="text-purple-400 underline hover:text-purple-300">mir.jawad87@gmail.com</a><br />
                        Feel free to connect: <a href="https://www.linkedin.com/in/mirjawad/" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">https://www.linkedin.com/in/mirjawad/</a>
                    </p>
                </div>
            </section>
        </main>

        <footer className="text-center mt-12">
            <button 
                onClick={onBack} 
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out"
            >
               &larr; Back to Social Pulse
            </button>
        </footer>
      </div>
    </div>
  );
};