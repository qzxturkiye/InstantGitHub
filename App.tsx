import React, { useState, FormEvent, useCallback, useRef, useEffect } from 'react';
import { Search, Github, MapPin, Users, Link as LinkIcon, AlertCircle, Globe, Archive, ChevronDown, FolderGit2, ArrowRight, ChevronDown as ChevronDownIcon } from 'lucide-react';
import { fetchGithubRepos, fetchGithubUser, searchGlobalRepos } from './services/githubService';
import { GitHubRepo, GitHubUser } from './types';
import { RepoCard } from './components/RepoCard';
import { AnalysisModal } from './components/AnalysisModal';
import { useLanguage, languages } from './contexts/LanguageContext';

function App() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setUser(null);
    setRepos([]);
    setIsArchiveView(false);
    setPage(1);
    setHasMore(true);

    try {
      // 1. Try to find as User or Organization
      const userData = await fetchGithubUser(query);
      
      if (userData) {
        // Found User/Org
        setUser(userData);
        const reposData = await fetchGithubRepos(query, 1);
        setRepos(reposData);
        if (reposData.length < 100) setHasMore(false);
      } else {
        // 2. User not found, fallback to Global Search (Archive Mode -> Repositories Mode)
        const searchResults = await searchGlobalRepos(query, 1);
        
        if (searchResults.length > 0) {
            setIsArchiveView(true);
            setRepos(searchResults);
            if (searchResults.length < 100) setHasMore(false);
            
            // Create a "Virtual" user for the profile view
            const virtualUser: GitHubUser = {
                login: query,
                id: 0,
                avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
                html_url: `https://github.com/search?q=${query}`,
                name: t.archiveResults, // "Depolar" or "Repositories"
                company: "GitHub",
                blog: null,
                location: t.archiveLocation,
                email: null,
                bio: t.archiveBio.replace('{query}', query),
                public_repos: searchResults.length, // Approximate for display
                followers: 0,
                following: 0,
                created_at: new Date().toISOString()
            };
            setUser(virtualUser);
        } else {
            setError(t.notFound);
        }
      }
    } catch (err) {
      setError(t.connectionError);
    } finally {
      setLoading(false);
    }
  }, [query, t]);

  const handleLoadMore = async () => {
    if (!user || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
        let newRepos: GitHubRepo[] = [];
        if (isArchiveView) {
            newRepos = await searchGlobalRepos(query, nextPage);
        } else {
            newRepos = await fetchGithubRepos(query, nextPage);
        }

        if (newRepos.length > 0) {
            setRepos(prev => [...prev, ...newRepos]);
            setPage(nextPage);
            if (newRepos.length < 100) setHasMore(false);
        } else {
            setHasMore(false);
        }
    } catch (err) {
        console.error("Error loading more repos", err);
    } finally {
        setLoadingMore(false);
    }
  };

  const handleForceGlobalSearch = async () => {
    setLoading(true);
    setRepos([]);
    setPage(1);
    setHasMore(true);
    
    try {
        const searchResults = await searchGlobalRepos(query, 1);
        
        if (searchResults.length > 0) {
            setIsArchiveView(true);
            setRepos(searchResults);
            if (searchResults.length < 100) setHasMore(false);
            
            // Create a "Virtual" user for the profile view
            const virtualUser: GitHubUser = {
                login: query,
                id: 0,
                avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
                html_url: `https://github.com/search?q=${query}`,
                name: t.archiveResults,
                company: "GitHub",
                blog: null,
                location: t.archiveLocation,
                email: null,
                bio: t.archiveBio.replace('{query}', query),
                public_repos: searchResults.length, // approximate
                followers: 0,
                following: 0,
                created_at: new Date().toISOString()
            };
            setUser(virtualUser);
        } else {
            setError(t.notFound);
        }
    } catch (err) {
        setError(t.connectionError);
    } finally {
        setLoading(false);
    }
  };

  const openRepoDetails = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setIsModalOpen(true);
  };

  const activeLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-200">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight shrink-0">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Github size={20} className="text-white" />
            </div>
            <span className="hidden sm:inline">InstantGitHub</span>
          </div>

          <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          {/* Language Switcher */}
          <div className="relative" ref={langMenuRef}>
            <button 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-colors text-xs font-medium text-slate-300 min-w-[80px] justify-between"
            >
              <div className="flex items-center gap-2">
                 <span className="text-base">{activeLang.flag}</span>
                 <span>{activeLang.code.toUpperCase()}</span>
              </div>
              <ChevronDown size={14} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-700 transition-colors ${language === lang.code ? 'bg-slate-700/50 text-blue-400' : 'text-slate-300'}`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search (visible only on small screens) */}
      <div className="sm:hidden p-4 bg-slate-900/50 border-b border-slate-800">
        <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholderMobile}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
        </form>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 animate-pulse">{t.fetching}</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t.errorTitle}</h3>
            <p className="text-slate-400">{error}</p>
          </div>
        )}

        {!loading && !error && !user && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
              <Github size={80} className="text-slate-700 relative z-10" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              {t.heroTitle}
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto text-lg">
              {t.heroSubtitle}
            </p>
          </div>
        )}

        {!loading && !error && user && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
            
            {/* Left Sidebar: Profile */}
            <div className="lg:col-span-3">
              <div className="sticky top-24">
                <div className={`bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm ${isArchiveView ? 'border-purple-500/30' : ''}`}>
                  
                  {/* Archive/Repo Badge */}
                  {isArchiveView && (
                      <div className="mb-4 flex justify-center">
                          <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 border border-purple-500/30">
                              <FolderGit2 size={12} />
                              {t.archiveResults}
                          </div>
                      </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <img 
                      src={user.avatar_url} 
                      alt={user.login} 
                      className={`w-32 h-32 rounded-full border-4 shadow-2xl mb-4 ${isArchiveView ? 'border-purple-500/50 p-1 bg-white' : 'border-slate-700'}`}
                    />
                    <h2 className="text-2xl font-bold text-white">{user.name || user.login}</h2>
                    {!isArchiveView && <p className="text-slate-400 text-sm mb-4">@{user.login}</p>}
                    
                    {user.bio && (
                      <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                        {user.bio}
                      </p>
                    )}

                    <div className="w-full space-y-3">
                        {!isArchiveView && (
                            <div className="flex items-center gap-3 text-slate-400 text-sm">
                                <Users size={16} className="text-blue-500" />
                                <span className="font-semibold text-white">{user.followers}</span> 
                                <span>{t.followers}</span>
                                <span className="text-slate-600">•</span>
                                <span className="font-semibold text-white">{user.following}</span> 
                                <span>{t.following}</span>
                            </div>
                        )}
                        {user.location && (
                            <div className="flex items-center gap-3 text-slate-400 text-sm justify-center lg:justify-start">
                                <MapPin size={16} className={isArchiveView ? "text-purple-500" : "text-purple-500"} />
                                <span>{user.location}</span>
                            </div>
                        )}
                        {user.blog && (
                            <div className="flex items-center gap-3 text-slate-400 text-sm truncate w-full justify-center lg:justify-start">
                                <LinkIcon size={16} className="text-green-500 flex-shrink-0" />
                                <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors truncate">
                                    {user.blog}
                                </a>
                            </div>
                        )}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-700/50">
                    <div className="flex flex-wrap gap-3 justify-center">
                        <div className="flex-1 min-w-[45%] bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
                            <span className="block text-2xl font-bold text-white">{user.public_repos}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-normal">{t.repos}</span>
                        </div>
                        {!isArchiveView && (
                            <div className="flex-1 min-w-[45%] bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
                                <span className="block text-2xl font-bold text-white">
                                    {new Date(user.created_at).getFullYear()}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-normal">{t.joined}</span>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content: Repos */}
            <div className="lg:col-span-9 flex flex-col">
                
                {/* Suggestion Banner */}
                {!isArchiveView && !query.includes('/') && (
                  <div className="mb-6 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
                         <Archive size={20} />
                      </div>
                      <p className="text-blue-200 font-medium">
                        {t.searchAsRepoQuestion}
                      </p>
                    </div>
                    <button 
                      onClick={handleForceGlobalSearch}
                      className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      {t.yesButton}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {t.repos}
                        <span className="text-sm font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                            {repos.length}
                        </span>
                    </h3>
                    <div className="text-sm text-slate-500 hidden sm:block">
                        {isArchiveView ? t.sortedBy.replace('updated', 'stars') : t.sortedBy}
                    </div>
                </div>

                {repos.length === 0 ? (
                    <div className="bg-slate-800/30 rounded-2xl p-8 text-center border border-slate-700/50 border-dashed">
                        <p className="text-slate-500">{t.noRepos}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                            {repos.map((repo, idx) => (
                                <RepoCard key={`${repo.id}-${idx}`} repo={repo} onClick={openRepoDetails} />
                            ))}
                        </div>
                        
                        {hasMore && (
                            <div className="flex justify-center mb-8">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold transition-all flex items-center gap-2 border border-slate-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingMore ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <ChevronDownIcon size={20} />
                                    )}
                                    {loadingMore ? t.fetching : t.loadMore}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

          </div>
        )}
      </main>

      <AnalysisModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        repo={selectedRepo} 
      />

    </div>
  );
}

export default App;