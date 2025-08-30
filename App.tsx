import React, { useState, useCallback, useEffect } from 'react';
import { generateReadme } from './services/geminiService';
import { getRepoData } from './services/githubService';
import InputForm from './components/InputForm';
import ReadmeDisplay from './components/ReadmeDisplay';
import History from './components/History';
import { GitHubIcon } from './components/icons/GitHubIcon';
import type { HistoryItem } from './types';

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [tone, setTone] = useState<string>('Professional');
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeRepoUrl, setActiveRepoUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('readmeHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      localStorage.removeItem('readmeHistory');
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!repoUrl) {
      setError('Please enter a GitHub repository URL.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setReadmeContent(null);
    setActiveRepoUrl(repoUrl);

    try {
      setLoadingMessage('Fetching repository data from GitHub...');
      const repoData = await getRepoData(repoUrl);
      
      setLoadingMessage('AI is analyzing the repository...');
      const generatedMarkdown = await generateReadme(repoUrl, repoData, tone);
      setReadmeContent(generatedMarkdown);
      
      const newHistoryItem = { url: repoUrl, content: generatedMarkdown };
      const updatedHistory = [newHistoryItem, ...history.filter(item => item.url !== repoUrl)].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('readmeHistory', JSON.stringify(updatedHistory));

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate README. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [repoUrl, tone, history]);

  const handleSelectHistory = (item: HistoryItem) => {
    setRepoUrl(item.url);
    setActiveRepoUrl(item.url);
    setReadmeContent(item.content);
    setError(null);
    setIsLoading(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('readmeHistory');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="fixed inset-0 -z-10 bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-2">
            AI README Generator
          </h1>
          <p className="text-slate-400 text-lg">
            Instantly create professional README.md files for your GitHub projects.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-8">
             <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl shadow-indigo-900/10 p-6 border border-slate-700">
                <InputForm
                  repoUrl={repoUrl}
                  setRepoUrl={setRepoUrl}
                  tone={tone}
                  setTone={setTone}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                />
              </div>
              <History 
                items={history}
                onSelect={handleSelectHistory}
                onClear={handleClearHistory}
                activeUrl={activeRepoUrl}
              />
          </aside>

          <div className="lg:col-span-8 xl:col-span-9">
            <ReadmeDisplay 
              title={activeRepoUrl}
              content={readmeContent}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              error={error}
            />
          </div>
        </main>
        
        <footer className="text-center mt-12 text-slate-500">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-indigo-400 transition-colors">
                <GitHubIcon className="h-5 w-5" />
                <span>Powered by Generative AI</span>
            </a>
        </footer>
      </div>
    </div>
  );
};

export default App;