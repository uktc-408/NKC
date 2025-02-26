import React, { useEffect, useRef } from 'react';
import SearchResults from './SearchResults';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { formatMarketCap } from '../../utils/time';
import MobileSearchResultItem from './MobileSearchResultItem';

const formatAddress = (address) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function MobileSearchHistory({ 
  history, 
  searchResults, 
  isSearching, 
  onSearch, 
  onClear, 
  visible, 
  onClose,
  searchInput,
  setSearchInput 
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  // 处理输入框聚焦
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70">
      <div 
        ref={modalRef}
        className="fixed bottom-0 left-0 right-0 bg-gray-800 rounded-t-2xl shadow-xl transform transition-transform duration-300 ease-in-out"
        style={{ maxHeight: '82vh' }}
      >
        {/* 顶部拖动条 */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
        </div>

        {/* 搜索框 */}
        <div className="px-4 py-2 border-b border-gray-700">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (searchInput && searchResults.length > 0) {
              // 如果有搜索结果，使用第一个结果
              onSearch({
                address: searchResults[0].baseToken.address,
                mode: 'contract',
                fromSearchButton: true
              });
              onClose?.();
            } else if (searchInput) {
              // 如果有输入但没有搜索结果，直接搜索输入内容
              onSearch({
                address: searchInput.trim(),
                mode: 'contract',
                fromSearchButton: true
              });
              onClose?.();
            }
          }}>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-10 px-4 bg-gray-700 border-none focus:ring-2 focus:ring-cyan-500/50 text-gray-200 placeholder-gray-500"
                placeholder="搜索代币"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 内容区域 */}
        <div className="flex flex-col" style={{ height: 'calc(82vh - 80px)' }}>
          {/* 加载状态 */}
          {isSearching && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="mt-2">正在搜索...</p>
            </div>
          )}

          {/* 搜索结果 - 独立滚动区域 */}
          {searchResults.length > 0 && (
            <div className="overflow-y-auto border-b border-gray-700">
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-cyan-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-base font-semibold text-gray-200">{t('search.searchResults')}</h3>
                </div>
                <div className="space-y-2">
                  {searchResults.map((token, index) => (
                    <MobileSearchResultItem
                      key={index}
                      token={token}
                      onSelect={(params) => {
                        onSearch(params);
                        onClose?.();
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 搜索历史 - 独立滚动区域 */}
          {history.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
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
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="pt-1 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                      onClick={() => {
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
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {item.mode === 'contract' && (
                            item.avatar ? (
                              <img
                                src={item.avatar}
                                alt={item.tokenName || item.query}
                                className="w-8 h-8 rounded-full"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "data:image/svg+xml,...";
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-400">?</span>
                              </div>
                            )
                          )}
                          <div className="flex flex-col">
                            {item.tokenName && (
                              <div className="font-medium text-sm text-gray-100">
                                {item.tokenName}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              {item.mode === 'contract' 
                                ? `${item.query.slice(0, 6)}...${item.query.slice(-4)}` 
                                : item.query}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 