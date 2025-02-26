import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function FullscreenPreview({ 
  url, 
  onClose,
  renderContent
}) {
  useEffect(() => {
    const scrollPosition = window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.overflowY = 'scroll';

    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollPosition);
    };
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-gray-50">
      <h3 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2 p-2 border-b bg-white shadow-sm relative">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-600"/>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        <div className="flex-1">
          <div>网站预览</div>
          <div className="text-sm text-gray-500 font-normal">
            (折叠可关闭声音,某些网站可能不支持嵌入显示，请尝试在新标签页中打开)
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleOpenExternal}
            className="text-gray-600 hover:text-blue-600 focus:outline-none"
            title="在新标签页中打开"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-blue-600 focus:outline-none"
            title="退出全屏"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </h3>
      <div className="h-[calc(100vh-64px)] mx-4 my-2 shadow-lg border border-gray-200 bg-white rounded-lg relative">
        <div className="absolute -top-1 left-4 h-2 w-20 bg-blue-500/10 rounded-b-full blur-sm"/>
        <div className="absolute -top-1 right-4 h-2 w-12 bg-blue-500/10 rounded-b-full blur-sm"/>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-b from-blue-50 to-transparent rounded-bl-full opacity-50"/>
        
        {renderContent()}
      </div>
    </div>,
    document.body
  );
} 