import React, { useState } from 'react';

export default function ScraperPage() {
  const [keyword, setKeyword] = useState('');
  const [key, setKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleScrape = async () => {
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, key }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'An unknown error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Is it running?');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#181824] text-white p-8">
      <div className="w-full max-w-md bg-[#232135] p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-400">Web Scraper</h1>
        <div className="space-y-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keyword (e.g., 'photographe')"
            className="w-full bg-[#23213a] text-gray-200 rounded-lg px-4 py-3 outline-none border-none placeholder-gray-400"
          />
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter key (e.g., 'photographe')"
            className="w-full bg-[#23213a] text-gray-200 rounded-lg px-4 py-3 outline-none border-none placeholder-gray-400"
          />
          <button
            onClick={handleScrape}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Run Scraper
          </button>
        </div>
        {message && <p className="mt-4 text-center text-green-400">{message}</p>}
        {error && <p className="mt-4 text-center text-red-400">{error}</p>}
      </div>
    </div>
  );
}
