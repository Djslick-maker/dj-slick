import React, { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/styles/prism';
import { Source } from '../types';
import { SourceLinkIcon } from './Icons';

interface ResponseDisplayProps {
  response: string;
  isLoading: boolean;
  sources: Source[];
  error: string | null;
}

const SourceCard: React.FC<{ source: Source }> = ({ source }) => (
  <a
    href={source.uri}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-start p-3 bg-gray-800 hover:bg-gray-700/60 rounded-lg transition-colors duration-200 group"
  >
    <SourceLinkIcon className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
    <div className="ml-3 overflow-hidden">
      <p className="text-sm font-medium text-purple-300 truncate group-hover:underline">
        {source.title || 'Untitled Source'}
      </p>
      <p className="text-xs text-gray-500 truncate">{source.uri}</p>
    </div>
  </a>
);

const ParsedContent: React.FC<{ content: string }> = ({ content }) => {
  const parts = useMemo(() => {
    // Regex to split by code blocks, keeping the delimiters and filtering out empty strings
    return content.split(/(```[\s\S]*?```)/g).filter(Boolean);
  }, [content]);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const language = part.match(/^```(\w+)?\n/)?.[1] || 'text';
          const code = part.replace(/^```\w*\n/, '').replace(/```$/, '');
          return (
            <div key={index} className="bg-gray-950 rounded-lg my-4 relative text-sm">
              <div className="text-xs text-gray-400 px-4 py-2 bg-gray-800/50 rounded-t-lg flex justify-between items-center">
                <span>{language}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                  aria-label="Copy code to clipboard"
                >
                  Copy
                </button>
              </div>
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: '0 0 0.5rem 0.5rem',
                  padding: '1rem',
                }}
                codeTagProps={{
                  style: {
                    fontSize: '0.875rem'
                  },
                }}
              >
                {code.trim()}
              </SyntaxHighlighter>
            </div>
          );
        }
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </>
  );
};

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, isLoading, sources, error }) => {
  return (
    <div className="bg-gray-800/50 p-4 sm:p-6 rounded-lg min-h-[50vh] flex flex-col">
      <div className="flex-1 prose prose-invert max-w-none prose-p:text-gray-200 prose-headings:text-white">
        <ParsedContent content={response} />
        {isLoading && <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1" />}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {sources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Sources:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sources.map((source) => (
              <SourceCard key={source.uri} source={source} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
