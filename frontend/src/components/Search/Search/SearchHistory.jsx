import React, { useState, useEffect } from 'react';
import SearchResults from './SearchResults';
import { useTranslation } from 'react-i18next';

const formatAddress = (address, isMobile) => {
  if (!address || address.length < 10) return address;
  return isMobile ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
};

export default function SearchHistory({ history, searchResults, isSearching, onSearch, onClear, visible, onClose }) {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (visible) {
      // Check if document is scrollable
      const isScrollable = document.documentElement.scrollHeight > document.documentElement.clientHeight;
      
      // Only disable background scroll when page is scrollable
      if (isScrollable) {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.overflowY = 'scroll';
      }
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.overflowY = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.overflowY = '';
    };
  }, [visible]);

  if (!visible) return null;

  const handleHistoryClick = (item) => {
    const searchParams = item.mode === 'contract' 
      ? { 
          address: item.query, 
          mode: 'contract',
          tokenName: item.tokenName,
          avatar: item.avatar,
          fromHistory: true
        }
      : { username: item.query, mode: 'username' };
    
    onSearch(searchParams);
    onClose?.();
  };

  return (
    <div className="absolute z-50 w-full bg-gray-800 shadow-lg border border-gray-700 max-h-[80vh] flex flex-col">
      {/* Loading state */}
      {isSearching && (
        <div className="p-4 text-center text-gray-400 border-b border-gray-700">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
          <p className="mt-2">{t('search.history.searching')}</p>
        </div>
      )}

      {/* Search results area */}
      <SearchResults results={searchResults} onSelect={onSearch} onClose={onClose} />

      {/* Search history area */}
      {history.length > 0 && (
        <div className="p-4 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-cyan-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-base font-semibold text-gray-200">{t('search.history.title')}</h3>
            </div>
            <button
              onClick={onClear}
              className="flex items-center space-x-1 text-sm text-red-400 hover:text-red-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{t('search.history.clear')}</span>
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain">
            {history.map((item, index) => (
              <div
                key={index}
                className="flex flex-col p-2 hover:bg-gray-700 rounded-md cursor-pointer transition-colors duration-200"
                onClick={() => handleHistoryClick(item)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {item.mode === 'contract' && (
                      item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.tokenName || item.query}
                          className="w-6 h-6 rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'/%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    )}
                    <div className="flex flex-col">
                      {item.tokenName && (
                        <span className="font-medium text-sm text-gray-200">
                          {item.tokenName}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {item.mode === 'contract' 
                          ? `${item.query.slice(0, 6)}...${item.query.slice(-4)}` 
                          : item.query}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {new Date(item.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 