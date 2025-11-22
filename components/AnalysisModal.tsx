import React, { useState, useEffect } from 'react';
import { X, Bot, Sparkles, BookOpen, ExternalLink, Calendar, Scale, Server } from 'lucide-react';
import { GitHubRepo, AIAnalysisResult, AnalysisStatus } from '../types';
import { fetchReadme } from '../services/githubService';
import { analyzeRepository } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface AnalysisModalProps {
  repo: GitHubRepo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ repo, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'ai'>('details');
  const [readme, setReadme] = useState<string>('');
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  
  const { t, language } = useLanguage();

  useEffect(() => {
    if (isOpen && repo) {
      // Reset states on open
      setActiveTab('details');
      setAnalysis(null);
      setStatus(AnalysisStatus.IDLE);
      setReadme('');
      
      // Fetch Readme immediately
      fetchReadme(repo.owner.login, repo.name, repo.default_branch).then(setReadme);
    }
  }, [isOpen, repo]);

  const handleAnalyze = async () => {
    if (!repo) return;
    setStatus(AnalysisStatus.LOADING);
    try {
      const result = await analyzeRepository(
        repo.name,
        repo.description || '',
        repo.language || 'Unknown',
        readme,
        language
      );
      setAnalysis(result);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  if (!isOpen || !repo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
          <div>
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {repo.name}
                <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors">
                    <ExternalLink size={18} />
                </a>
             </h2>
             <p className="text-slate-400 text-sm mt-1">{repo.full_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/30">
            <button 
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-4 text-sm font-medium transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === 'details' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
                <BookOpen size={16} />
                {t.overview}
            </button>
            <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-4 text-sm font-medium transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
                <Bot size={16} />
                {t.aiAnalysis}
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0f172a]">
            {activeTab === 'details' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <span className="text-xs text-slate-500 block mb-1">{t.created}</span>
                            <span className="text-sm font-medium text-slate-200 flex items-center gap-2">
                                <Calendar size={14} />
                                {new Date(repo.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                            </span>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <span className="text-xs text-slate-500 block mb-1">{t.size}</span>
                            <span className="text-sm font-medium text-slate-200 flex items-center gap-2">
                                <Server size={14} />
                                {Math.round(repo.size / 1024)} MB
                            </span>
                        </div>
                         <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <span className="text-xs text-slate-500 block mb-1">{t.license}</span>
                            <span className="text-sm font-medium text-slate-200 flex items-center gap-2">
                                <Scale size={14} />
                                {repo.private ? 'None' : 'MIT*'}
                            </span>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <span className="text-xs text-slate-500 block mb-1">{t.defaultBranch}</span>
                            <span className="text-sm font-medium text-slate-200 font-mono">
                                {repo.default_branch}
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
                        <h3 className="text-lg font-semibold text-white mb-3">{t.readmePreview}</h3>
                        <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-light">
                            {readme ? (
                                <div className="whitespace-pre-wrap font-mono text-xs opacity-80 max-h-[300px] overflow-y-auto">
                                    {readme.slice(0, 1000)}... 
                                    <br/><br/>
                                    <span className="text-blue-400 italic">({t.viewFull})</span>
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">{t.readmeEmpty}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ai' && (
                <div className="h-full flex flex-col items-center">
                    {status === AnalysisStatus.IDLE && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-400">
                                <Sparkles size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t.analyzeTitle}</h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-8">
                                {t.analyzeDesc}
                            </p>
                            <button 
                                onClick={handleAnalyze}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105"
                            >
                                {t.analyzeBtn}
                            </button>
                        </div>
                    )}

                    {status === AnalysisStatus.LOADING && (
                        <div className="text-center py-20 animate-pulse">
                            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-300">{t.analyzing}</p>
                            <p className="text-xs text-slate-500 mt-2">{t.analyzingDesc}</p>
                        </div>
                    )}
                    
                    {status === AnalysisStatus.ERROR && (
                         <div className="text-center py-12">
                             <p className="text-red-400 mb-4">{t.analyzeError}</p>
                             <button onClick={handleAnalyze} className="text-sm underline text-slate-400">{t.retry}</button>
                         </div>
                    )}

                    {status === AnalysisStatus.SUCCESS && analysis && (
                        <div className="w-full space-y-6 animate-fade-in-up">
                            
                            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-purple-500/20 rounded-xl p-6">
                                <h4 className="flex items-center gap-2 text-purple-300 font-semibold mb-3">
                                    <Bot size={18} />
                                    {t.aiSummary}
                                </h4>
                                <p className="text-slate-200 leading-relaxed">{analysis.summary}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
                                    <h4 className="text-slate-300 font-semibold mb-3">{t.complexity}</h4>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className={`text-4xl font-bold ${analysis.complexityScore > 7 ? 'text-red-400' : analysis.complexityScore > 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                                            {analysis.complexityScore}
                                        </span>
                                        <span className="text-slate-500 mb-1">/ 10</span>
                                    </div>
                                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${analysis.complexityScore > 7 ? 'bg-red-500' : analysis.complexityScore > 4 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                            style={{ width: `${analysis.complexityScore * 10}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
                                    <h4 className="text-slate-300 font-semibold mb-3">{t.techStack}</h4>
                                    <p className="text-sm text-slate-400">{analysis.techStackAnalysis}</p>
                                </div>
                            </div>

                            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
                                <h4 className="text-slate-300 font-semibold mb-4">{t.useCases}</h4>
                                <ul className="space-y-2">
                                    {analysis.suggestedUseCases.map((useCase, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                                            {useCase}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};