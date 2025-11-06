
import React, { useState, useCallback, useRef } from 'react';
import { streamResponse } from './services/geminiService';
import { Source } from './types';
import { SparklesIcon, SendIcon, SearchIcon, CodeIcon } from './components/Icons';
import { ResponseDisplay } from './components/ResponseDisplay';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setStreamingResponse('');
    setSources([]);

    try {
      const stream = streamResponse(prompt);
      for await (const chunk of stream) {
        setStreamingResponse((prev) => prev + chunk.text);
        if (chunk.sources) {
          // A simple way to merge sources without deep object comparison for this app
          setSources(prevSources => {
            const newSources = [...prevSources];
            chunk.sources.forEach(newSource => {
              if (!newSources.some(s => s.uri === newSource.uri)) {
                newSources.push(newSource);
              }
            });
            return newSources;
          });
        }
      }
    } catch (e) {
      setError('An error occurred while fetching the response. Please check your API key and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="p-4 border-b border-gray-700 shadow-md">
        <div className="container mx-auto flex items-center justify-center">
          <SparklesIcon className="w-8 h-8 text-purple-400 mr-3" />
          <h1 className="text-2xl font-bold tracking-wider text-white">
            Gemini Pro Streaming Chat
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          <ResponseDisplay 
            response={streamingResponse} 
            isLoading={isLoading} 
            sources={sources}
            error={error}
          />
        </div>
      </main>

      <footer className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
        <div className="container mx-auto max-w-4xl">
           <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
            <p className="flex items-center"><CodeIcon className="w-4 h-4 mr-1.5"/> Code Execution</p>
            <p className="flex items-center"><SearchIcon className="w-4 h-4 mr-1.5"/> Google Search</p>
           </div>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your prompt here..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 pr-16 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none transition-all duration-200"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-full text-white hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
              aria-label="Generate response"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
