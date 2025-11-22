import React, { useState } from 'react';
import { Star, GitFork, Eye, Code, AlertTriangle } from 'lucide-react';
import { GitHubRepo } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface RepoCardProps {
  repo: GitHubRepo;
  onClick: (repo: GitHubRepo) => void;
}

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  React: '#61dafb',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Swift: '#ffac45',
  Kotlin: '#A97BFF'
};

export const RepoCard: React.FC<RepoCardProps> = ({ repo, onClick }) => {
  const { t } = useLanguage();
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Threshold for long description set to approx 100 lines (5000 chars)
  const isLongDescription = (repo.description?.length || 0) > 5000;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger modal if clicking the "Show" button inside
    if ((e.target as HTMLElement).closest('.desc-toggle')) return;
    onClick(repo);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-5 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-900/10 flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-blue-400 group-hover:text-blue-300 truncate pr-2">
            {repo.name}
          </h3>
          <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-700">
            {repo.private ? t.private : t.public}
          </span>
        </div>
        
        <div className="mb-4">
          {isLongDescription && !showFullDesc ? (
             <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2 text-yellow-500 mb-2">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                    <p className="text-xs leading-relaxed">{t.longDescWarning}</p>
                </div>
                <button 
                    onClick={() => setShowFullDesc(true)}
                    className="desc-toggle text-xs font-semibold text-yellow-400 hover:text-yellow-300 hover:underline"
                >
                    {t.yesShow}
                </button>
             </div>
          ) : (
            <p className="text-slate-400 text-sm break-words">
               {repo.description || t.noDesc}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-slate-500 text-xs mt-auto pt-4">
        <div className="flex items-center gap-4">
            {repo.language && (
                <div className="flex items-center gap-1.5">
                    <span 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: languageColors[repo.language] || '#ccc' }}
                    ></span>
                    <span>{repo.language}</span>
                </div>
            )}
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 hover:text-yellow-400 transition-colors">
                <Star size={14} />
                <span>{repo.stargazers_count}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                <GitFork size={14} />
                <span>{repo.forks_count}</span>
            </div>
        </div>
      </div>
    </div>
  );
};