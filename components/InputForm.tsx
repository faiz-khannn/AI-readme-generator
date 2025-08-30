import React from 'react';
import { GitHubIcon } from './icons/GitHubIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { XIcon } from './icons/XIcon';

interface InputFormProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  tone: string;
  setTone: (tone: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const TONES = ["Professional", "Casual", "Minimalist", "Playful"];

const InputForm: React.FC<InputFormProps> = ({ repoUrl, setRepoUrl, tone, setTone, onGenerate, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label htmlFor="repo-url" className="block text-sm font-medium text-slate-300 mb-2">
          GitHub Repository URL
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <GitHubIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="url"
            id="repo-url"
            className="block w-full bg-slate-900/50 border border-slate-600 rounded-lg py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="https://github.com/user/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
            disabled={isLoading}
          />
          {repoUrl && !isLoading && (
            <button
              type="button"
              onClick={() => setRepoUrl('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              aria-label="Clear input"
            >
              <XIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Tone
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TONES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              disabled={isLoading}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:opacity-50 ${
                tone === t
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-all duration-300 group"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2 -ml-1 text-yellow-300 group-hover:scale-110 transition-transform" />
            Generate README
          </>
        )}
      </button>
    </form>
  );
};

export default InputForm;