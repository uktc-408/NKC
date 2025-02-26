import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function GitHubPreview({ url }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [repoFiles, setRepoFiles] = useState([]);

  useEffect(() => {
    const fetchRepoContent = async () => {
      if (!url) return;
      
      const githubRepoRegex = /github\.com\/([^\/]+\/[^\/]+)$/;
      const githubMatch = url.match(githubRepoRegex);
      
      if (githubMatch && githubMatch[1]) {
        try {
          setIsLoading(true);
          // Get README.md
          const readmeResponse = await fetch(`https://raw.githubusercontent.com/${githubMatch[1]}/master/README.md`);
          const readmeText = await readmeResponse.text();
          setMarkdownContent(readmeText);

          // Get repository file list
          const filesResponse = await fetch(`https://api.github.com/repos/${githubMatch[1]}/contents`);
          const filesData = await filesResponse.json();
          
          // Get last commit info for each file
          const filesWithCommits = await Promise.all(
            filesData.map(async (file) => {
              const commitsResponse = await fetch(`https://api.github.com/repos/${githubMatch[1]}/commits?path=${file.path}&page=1&per_page=1`);
              const commits = await commitsResponse.json();
              return {
                ...file,
                lastModified: commits[0]?.commit?.committer?.date
              };
            })
          );
          
          setRepoFiles(filesWithCommits);
          setHasError(false);
        } catch (error) {
          setHasError(true);
          console.error('获取 GitHub 内容失败:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchRepoContent();
  }, [url]);

  const renderFileTree = (files) => {
    const formatTime = (time) => {
      if (!time) return 'N/A';
      
      const now = new Date();
      const date = new Date(time);
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'today';
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return 'last week';
      if (diffDays < 60) return 'last month';
      return `${Math.floor(diffDays / 30)} months ago`;
    };
    
    return files.map((file, index) => (
      <div key={index} className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          {file.type === 'dir' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          <span className="text-sm text-gray-300">
            {file.name}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {formatTime(file.lastModified)}
        </span>
      </div>
    ));
  };

  if (!url) return null;

  const repoPath = url.match(/github\.com\/([^\/]+\/[^\/]+)$/)?.[1];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gray-800/30 rounded-2xl h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-blue-400"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center bg-gray-800/30 h-[500px]">
        <div className="text-gray-400">加载 GitHub 内容失败</div>
      </div>
    );
  }

  return (
    <div className="p-6 prose prose-invert max-w-none h-[500px] overflow-auto text-gray-300 bg-gray-900/30">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Repository Files
        </div>
        <div className="text-sm bg-gray-800/50 rounded-lg p-4 font-mono">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-blue-400">{repoPath}</span>
          </div>
          <div className="mt-2 ml-4 space-y-1">
            {renderFileTree(repoFiles)}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700/50 my-6"></div>
      
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        README
      </div>
      <ReactMarkdown
        components={{
          p: ({children}) => <p className="text-gray-300">{children}</p>,
          h1: ({children}) => <h1 className="text-gray-200 border-b border-gray-700/50 pb-2">{children}</h1>,
          h2: ({children}) => <h2 className="text-gray-200 border-b border-gray-700/50 pb-2">{children}</h2>,
          h3: ({children}) => <h3 className="text-gray-200">{children}</h3>,
          a: ({children, href}) => <a href={href} className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">{children}</a>,
          ul: ({children}) => <ul className="text-gray-300">{children}</ul>,
          ol: ({children}) => <ol className="text-gray-300">{children}</ol>,
          li: ({children}) => <li className="text-gray-300">{children}</li>,
          code: ({children}) => <code className="bg-gray-800 text-gray-300 px-1 rounded">{children}</code>,
          pre: ({children}) => <pre className="bg-gray-800/50 p-4 rounded-lg overflow-auto">{children}</pre>,
          blockquote: ({children}) => <blockquote className="border-l-4 border-gray-700 pl-4 text-gray-400">{children}</blockquote>,
          img: ({node, ...props}) => {
            const imgSrc = props.src;
            if (imgSrc.startsWith('http')) {
              return <img {...props} className="max-w-full rounded-lg" />;
            }
            const rawSrc = `https://raw.githubusercontent.com/${repoPath}/master/${imgSrc.replace(/^\//, '')}`;
            return <img {...props} src={rawSrc} className="max-w-full rounded-lg" />;
          }
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
} 