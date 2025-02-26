import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import GitHubPreview from './GitHubPreview';

export default function WebsitePreview({ url }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [markdownContent, setMarkdownContent] = useState('');

  useEffect(() => {
    if (isFullscreen) {
      setScrollPosition(window.pageYOffset);
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.overflowY = 'scroll';
    } else {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollPosition);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.overflowY = '';
      if (scrollPosition) {
        window.scrollTo(0, scrollPosition);
      }
    };
  }, [isFullscreen, scrollPosition]);

  useEffect(() => {
    const fetchGithubContent = async () => {
      if (!url) return;
      
      const githubRepoRegex = /github\.com\/([^\/]+\/[^\/]+)$/;
      const githubMatch = url.match(githubRepoRegex);
      
      if (githubMatch && githubMatch[1]) {
        try {
          setIsLoading(true);
          const response = await fetch(`https://raw.githubusercontent.com/${githubMatch[1]}/master/README.md`);
          const text = await response.text();
          setMarkdownContent(text);
          setHasError(false);
        } catch (error) {
          setHasError(true);
          console.error('Failed to fetch GitHub content:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchGithubContent();
  }, [url]);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // Handle YouTube links
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    // Make sure other links have https:// prefix
    return url.startsWith('http') ? url : `https://${url}`;
  };

  if (!url) return null;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Render GitHub repository content
  const renderGithubContent = () => {
    const githubRepoRegex = /github\.com\/([^\/]+\/[^\/]+)$/;
    const githubMatch = url?.match(githubRepoRegex);

    if (githubMatch) {
      return <GitHubPreview url={url} />;
    }

    // 对于非 GitHub 链接，使用普通的 iframe
    return (
      <iframe
        src={getEmbedUrl(url)}
        className={`w-full ${isLoading ? 'hidden' : 'block'} ${
          isFullscreen ? 'h-[calc(100vh-3rem)]' : 'h-[500px]'
        }`}
        title="Website Preview"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900/95 h-screen' : ''}`}>
      <h3 className={`text-xl font-bold text-gray-300 flex items-center gap-2 ${
        isFullscreen ? 'p-2 border-b border-gray-700/30 bg-gray-900/50 shadow-sm sticky top-0 z-10 backdrop-blur-sm' : ''
      }`}>
        {isFullscreen && (
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-600"/>
        )}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <div className="absolute inset-0 bg-cyan-400/20 blur-[6px] -z-10"></div>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div>{t('preview.websitePreview')}</div>
          <div className="group relative">
            <button className="w-5 h-5 rounded-full bg-gray-700/50 text-gray-400 hover:text-gray-200 flex items-center justify-center text-sm">
              ?
            </button>
            <div className="absolute left-0 top-full mt-2 w-80 p-3 bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-xl invisible group-hover:visible z-20 text-sm text-gray-400 font-normal">
              {t('preview.collapseHint')}
              <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-800/95 rotate-45 border-l border-t border-gray-700/50"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleOpenExternal}
            className="text-gray-400 hover:text-gray-200 transition-colors focus:outline-none"
            title={t('preview.openInNewTab')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="text-gray-400 hover:text-gray-200 transition-colors focus:outline-none"
            title={isFullscreen ? t('preview.exitFullscreen') : t('preview.enterFullscreen')}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
          {!isFullscreen && (
            <button
              onClick={handleToggleExpand}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium focus:outline-none"
            >
              {isExpanded ? t('common.expand.hide') : t('common.expand.show')}
            </button>
          )}
        </div>
      </h3>
      <div className={`bg-gray-900/50 relative border border-cyan-500/20 backdrop-blur-sm ${
        isFullscreen ? 'h-[calc(100vh-3rem)] shadow-lg' : ''
      }`}>
        {isFullscreen && (
          <>
            <div className="absolute -top-1 left-4 h-2 w-20 bg-blue-500/10 blur-sm"/>
            <div className="absolute -top-1 right-4 h-2 w-12 bg-blue-500/10 blur-sm"/>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-b from-blue-500/5 to-transparent opacity-50"/>
          </>
        )}
        {!isExpanded ? (
          <div 
            onClick={handleToggleExpand}
            className="p-4 text-center text-gray-400 cursor-pointer hover:bg-gray-800/30 transition-colors"
          >
            {t('preview.clickToExpand')}
          </div>
        ) : (
          <>
            {isLoading && (
              <div className={`flex items-center justify-center bg-gray-800/30 ${
                isFullscreen ? 'h-[calc(100vh-3rem)]' : 'h-[500px]'
              }`}>
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-blue-400"></div>
              </div>
            )}
            {hasError && (
              <div className={`flex items-center justify-center bg-gray-800/30 ${
                isFullscreen ? 'h-[calc(100vh-3rem)]' : 'h-[500px]'
              }`}>
                <div className="text-gray-400">{t('preview.loadingFailed')}</div>
              </div>
            )}
            {renderGithubContent()}
          </>
        )}
      </div>
    </div>
  );
} 