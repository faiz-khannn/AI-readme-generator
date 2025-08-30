import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { GitHubIcon } from './icons/GitHubIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ReadmeDisplayProps {
  title: string | null;
  content: string | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}

const ReadmeDisplay: React.FC<ReadmeDisplayProps> = ({ title, content, isLoading, loadingMessage, error }) => {
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (content) {
      // Delay showing content slightly to allow for fade-in animation
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [content]);


  const handleCopy = () => {
    if (content) {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRepoName = (url: string | null) => {
    if (!url) return 'README.md';
    try {
      const path = new URL(url).pathname;
      return path.substring(1) || 'README.md';
    } catch {
      return 'README.md';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
          <p className="mt-4 text-slate-300 font-medium">{loadingMessage}</p>
          <p className="mt-1 text-slate-400 text-sm">This may take a moment...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full p-8">
            <AlertTriangleIcon className="h-12 w-12 text-red-500 mb-4"/>
            <h3 className="text-lg font-semibold text-red-400">An Error Occurred</h3>
            <p className="mt-2 text-red-400/80">{error}</p>
        </div>
      );
    }
    
    if (content) {
      return (
        <div className={`p-6 prose prose-invert prose-sm sm:prose-base max-w-none prose-pre:bg-slate-800/50 prose-pre:p-4 prose-pre:rounded-lg overflow-y-auto h-full transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      );
    }

    return (
        <div className="flex flex-col items-center justify-center text-center h-full bg-slate-800/20 p-8">
            <GitHubIcon className="h-16 w-16 text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-300">Your README will appear here</h2>
            <p className="text-slate-500 mt-1">Enter a repository URL and select a tone to get started.</p>
        </div>
    );
  };
  

  return (
    <div className="relative bg-slate-850 border border-slate-700 rounded-xl shadow-lg h-[80vh] flex flex-col">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800 rounded-t-xl border-b border-slate-700 flex-shrink-0">
        <span className="text-sm font-semibold text-slate-300 truncate" title={getRepoName(title)}>
          {getRepoName(title)}
        </span>
        <button
          onClick={handleCopy}
          disabled={!content || isLoading}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 mr-2 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4 mr-2" />
              Copy Markdown
            </>
          )}
        </button>
      </div>
      <div className="flex-grow min-h-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default ReadmeDisplay;