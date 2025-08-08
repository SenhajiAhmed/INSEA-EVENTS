import React, { useState, useEffect, useRef } from 'react';

interface ScraperPageProps {
  isScraping: boolean;
  logs: string[];
  message: string;
  handleScrape: (keyword: string) => Promise<void>;
}

const ScraperPage: React.FC<ScraperPageProps> = ({
  isScraping,
  logs,
  message,
  handleScrape,
}) => {
  const [keyword, setKeyword] = useState<string>('');
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [logs]);

  const onScrapeClick = () => {
    handleScrape(keyword);
  };

  return (
    <div className="flex flex-col h-full p-6 bg-[#181824] text-white">
      <div className="flex-grow flex flex-col bg-[#232135] rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">Scraper Control</h2>
        <div className="mb-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keyword (e.g., 'data science')"
            className="w-full p-2 rounded bg-[#181824] border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={isScraping}
          />
        </div>
        <button
          onClick={onScrapeClick}
          disabled={isScraping}
          className="w-full p-2 mb-4 rounded bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 transition-colors duration-300"
        >
          {isScraping ? 'Scraping in Progress...' : 'Start Scraping'}
        </button>
        {message && <p className="text-center text-yellow-300 mb-4">{message}</p>}

        <h3 className="text-xl font-semibold mb-2 border-t border-gray-600 pt-4">Live Logs</h3>
        <div className="flex-grow bg-[#181824] p-4 rounded-lg overflow-y-auto font-mono text-sm text-gray-300 h-64 min-h-[100px]">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default ScraperPage;
