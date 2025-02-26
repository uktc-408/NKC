import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import config from '@/config';
import TwitterAvatar from '../Common/TwitterAvatar';
import { formatTimeAgo } from '@/components/utils/time';
import CopyButton from './CopyButton';

const DevTokensList = ({ creator, searchAddress }) => {
  const { t } = useTranslation();
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevTokens = async () => {
      if (!creator) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${config.api.devTokens}/${creator}?limit=10&offset=0&includeNsfw=true&exclude=${searchAddress}`
        );
        if (!response.ok) {
          throw new Error(t('common.error.server'));
        }
        const data = await response.json();
        setTokens(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(t('common.error.fetch'), error);
        setError(t('common.error.fetch'));
        setTokens([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevTokens();
  }, [creator, searchAddress]);

  const toggleDescription = (mint) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [mint]: !prev[mint]
    }));
  };

  const renderDescription = (token) => {
    if (!token.description) return null;

    const shouldTruncate = token.description.length > 100;
    const isExpanded = expandedDescriptions[token.mint];
    const displayText = shouldTruncate && !isExpanded 
      ? `${token.description.slice(0, 100)}...` 
      : token.description;

    return (
      <div className="flex-1">
        <p className="text-sm text-gray-500 leading-5">
          {displayText}
        </p>
        {shouldTruncate && (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleDescription(token.mint);
            }}
            className="text-blue-600 hover:text-blue-800 text-xs mt-1"
          >
            {isExpanded ? t('common.expand.hide') : t('common.expand.show')}
          </button>
        )}
      </div>
    );
  };

  if (!creator) return null;

  return (
    <div className="flex flex-col space-y-2 mt-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-gray-300 flex items-center gap-2">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div className="absolute inset-0 bg-cyan-400/20 blur-[6px] -z-10"></div>
          </div>
          {t('token.devTokens.title')}
        </h3>
      </div>

      <div className="relative bg-gray-900/50 rounded-lg shadow-lg border border-cyan-500/20 backdrop-blur-sm">
        {/* 左侧装饰 */}
        <div className="absolute left-0 top-0 h-full w-16 overflow-hidden">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-cyan-500/20"></div>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-[4px] h-[4px] bg-cyan-500/40 rounded-full animate-pulse"></div>
        </div>

        {/* 右侧装饰 */}
        <div className="absolute right-0 top-0 h-full w-16 overflow-hidden">
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-cyan-500/20"></div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-[4px] h-[4px] bg-cyan-500/40 rounded-full animate-pulse"></div>
        </div>

        {/* 背景装饰 */}
        <div className="absolute inset-0 flex justify-between opacity-10">
          <div className="w-32 h-full bg-gradient-to-r from-blue-400/20 to-transparent"></div>
          <div className="w-32 h-full bg-gradient-to-l from-blue-400/20 to-transparent"></div>
        </div>

        <div className="relative">
          <div className="max-h-[500px] overflow-y-auto pr-2 overscroll-contain">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500/40 animate-pulse"></span>
                    <span className="text-cyan-500/70 text-sm">
                      {t('token.devTokens.loading')}
                    </span>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">
                {error}
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {t('token.devTokens.empty')}
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {tokens.map((token) => (
                  <div
                    key={token.mint}
                    className="block py-4 px-6 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <TwitterAvatar
                          imageUrl={token.image_uri}
                          name={token.name}
                          size="lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-200 truncate">
                            {token.name}
                          </h4>
                          <span className="text-sm text-gray-400">
                            ({token.symbol})
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(token.created_timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <a
                            href={`https://pump.fun/coin/${token.mint}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 truncate flex-1 hover:text-cyan-400"
                          >
                            {token.mint}
                          </a>
                          <div>
                            <CopyButton 
                              text={token.mint}
                              className="p-1"
                            />
                          </div>
                        </div>
                        {token.description && (
                          <div className="flex items-start gap-2 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm text-gray-400 leading-5">
                                {expandedDescriptions[token.mint] 
                                  ? token.description 
                                  : token.description.length > 100 
                                    ? `${token.description.slice(0, 100)}...` 
                                    : token.description
                                }
                              </p>
                              {token.description.length > 100 && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleDescription(token.mint);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-xs mt-1"
                                >
                                  {expandedDescriptions[token.mint] ? '收起' : '展开'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevTokensList; 