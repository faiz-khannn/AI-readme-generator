import React from 'react';
import type { HistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon';
import { GitHubIcon } from './icons/GitHubIcon';

interface HistoryProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  activeUrl: string | null;
}

const History: React.FC<HistoryProps> = ({ items, onSelect, onClear, activeUrl }) => {
  const getRepoName = (url: string) => {
    try {
      return new URL(url).pathname.substring(1);
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700">
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-200">History</h3>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClear}
            title="Clear History"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="p-2 max-h-80 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-4">No history yet.</p>
        ) : (
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => onSelect(item)}
                  className={`w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors text-sm ${
                    activeUrl === item.url 
                    ? 'bg-indigo-600 text-white font-semibold' 
                    : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <GitHubIcon className="w-4 h-4 flex-shrink-0" /> 
                  <span className="truncate" title={getRepoName(item.url)}>
                    {getRepoName(item.url)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default History;