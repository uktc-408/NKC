import { useState, useEffect } from 'react';
import translate from 'translate';
import { useTranslation } from 'react-i18next';
// import DevTokensPopup from './DevTokensPopup';
import { analyzeLinks, botLinks, priceAnalyzeLinks } from './config/links';
import config from '@/config';
import DevTokensList from './DevTokensList';
import TokenLinks from './TokenLinks';
import CopyButton from './CopyButton';
import TranslateButton from './TranslateButton';
import TokenDescription from './TokenDescription';
import { createPortal } from 'react-dom';
import ImagePreviewModal from './ImagePreviewModal';

translate.engine = 'google';
translate.from = 'en';
translate.to = 'zh';

const chainExplorerMap = {
  'solana': 'https://solscan.io/account/',
  'ethereum': 'https://etherscan.io/address/',
  'bsc': 'https://bscscan.com/address/',
  'base': 'https://basescan.org/address/'
};

export default function TokenInfo({ tokenInfo, searchAddress, onRefresh }) {
  const { t, i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [devTokens, setDevTokens] = useState([]);
  const [isLoadingDevTokens, setIsLoadingDevTokens] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [promotionInfo, setPromotionInfo] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    const fetchPromotionInfo = async () => {
      if (!searchAddress) return;
      
      try {
        console.log('正在请求推广信息:', `${config.api.contract}/${searchAddress}`);
        const response = await fetch(`${config.api.contract}/${searchAddress}`);
        if (response.ok) {
          const data = await response.json();
          console.log('获取到的推广信息:', data);
          setPromotionInfo(data);
        }
      } catch (error) {
        console.error('获取推广信息失败:', error);
      }
    };

    fetchPromotionInfo();
  }, [searchAddress]);

  const handleAddressClick = (address, isDev = false) => {
    if (!tokenInfo.chainId) return;
    
    const chainId = tokenInfo.chainId.toLowerCase();
    
    if (chainId === 'solana' && isDev) {
      window.open(`${chainExplorerMap[chainId]}${address}?token_address=${searchAddress}#transfers`, '_blank');
      return;
    }
    
    const explorerPrefix = chainExplorerMap[chainId];
    if (explorerPrefix) {
      window.open(`${explorerPrefix}${address}`, '_blank');
    }
  };

  const handleRefresh = async () => {
    if (!searchAddress || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch(`${config.api.tokenInfo}/${searchAddress}`);
      if (response.ok) {
        const data = await response.json();
        onRefresh(data);
      }
    } catch (error) {
      console.error('刷新代币信息失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!tokenInfo) return null;

  return (
    <div>
      <div className="flex flex-col space-y-2 mb-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold text-gray-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="absolute inset-0 bg-cyan-400/20 blur-[6px] -z-10"></div>
              </div>
              {t('log.tokenInfo')}
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-2 py-1 text-sm text-cyan-400 hover:text-cyan-300 disabled:text-gray-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </h3>

          <TokenLinks searchAddress={searchAddress} tokenInfo={tokenInfo} />
          
          <div className="relative bg-gray-900/50 rounded-lg shadow-lg border border-cyan-500/20 backdrop-blur-sm">
            <div className="absolute left-0 top-0 h-full w-16 overflow-hidden">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-cyan-500/20"></div>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-[4px] h-[4px] bg-cyan-500/40 rounded-full animate-pulse"></div>
            </div>

            <div className="absolute right-0 top-0 h-full w-16 overflow-hidden">
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-cyan-500/20"></div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-[4px] h-[4px] bg-cyan-500/40 rounded-full animate-pulse"></div>
            </div>

            <div className="absolute inset-0 flex justify-between opacity-10">
              <div className="w-32 h-full bg-gradient-to-r from-blue-400/20 to-transparent"></div>
              <div className="w-32 h-full bg-gradient-to-l from-blue-400/20 to-transparent"></div>
            </div>

            <div className="relative py-4 px-6">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold flex flex-col gap-2 text-gray-200">
                    {tokenInfo.name || t('log.unknownToken')}
                    <span className="text-sm font-normal text-gray-400 flex flex-wrap items-center gap-2">
                      {tokenInfo.createdAt && (
                        <span className="flex items-center gap-1">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 text-purple-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                            />
                          </svg>
                          <span className="bg-purple-400/10 text-purple-300 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                            {t('log.created')}: {tokenInfo.createdAt}
                          </span>
                        </span>
                      )}

                      {promotionInfo?.promotionCount > 0 && (
                        <span className="flex items-center gap-1">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 text-cyan-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" 
                            />
                          </svg>
                          <span className="bg-cyan-400/10 text-cyan-300 px-2 py-0.5 rounded-full text-xs font-medium">
                            {t('log.promotionCount', { count: promotionInfo.promotionCount })}
                          </span>
                        </span>
                      )}

                      {promotionInfo?.smartMoneyCount > 0 && (
                        <span className="flex items-center gap-1">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 text-yellow-500" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full text-xs font-medium">
                            {t('log.smartMoneyCount', { count: promotionInfo.smartMoneyCount })}
                          </span>
                        </span>
                      )}

                      {(promotionInfo?.promotionCount  || promotionInfo?.smartMoneyCount ) && (
                        <span className="text-gray-500 text-xs whitespace-nowrap">(48h)</span>
                      )}
                    </span>
                  </h4>
                  
                  <div className="mt-2 space-y-2">
                    {tokenInfo.marketCap && (
                      <div className="md:flex md:items-center md:gap-3 grid grid-cols-2 gap-3 text-[13px]">
                        <p className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z M14 13.5h-4l2-6" />
                          </svg>
                          <span className="font-medium text-gray-300">MC:</span>
                          <span className="text-gray-400">{tokenInfo.marketCap}</span>
                        </p>
                        
                        {tokenInfo.volume && (
                          <>
                            <span className="text-gray-600 hidden md:inline">|</span>
                            <p className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span className="font-medium text-gray-300">Vol:</span>
                              <span className="text-gray-400">{tokenInfo.volume}</span>
                            </p>
                          </>
                        )}
                        
                        {tokenInfo.liquidity && (
                          <>
                            <span className="text-gray-600 hidden md:inline">|</span>
                            <p className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zm0 4h18M9 7v10m6-10v10" />
                              </svg>
                              <span className="font-medium text-gray-300">Liq:</span>
                              <span className="text-gray-400">{tokenInfo.liquidity}</span>
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {tokenInfo.priceChange && (
                      <div className="md:flex md:items-center md:gap-3 grid grid-cols-2 gap-3 text-[13px]">
                        <p className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-400">${Number(tokenInfo.price).toFixed(8)}</span>
                        </p>

                        {tokenInfo.priceChange.h1 !== null && (
                          <>
                            <span className="text-gray-600 hidden md:inline">|</span>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-indigo-400">1h:</span>
                              <span className={`${tokenInfo.priceChange.h1 >= 0 ? 'text-green-500/90' : 'text-red-500/90'}`}>
                                {tokenInfo.priceChange.h1 >= 0 ? '+' : ''}{tokenInfo.priceChange.h1.toFixed(2)}%
                              </span>
                            </div>
                          </>
                        )}

                        {tokenInfo.priceChange.h24 !== null && (
                          <>
                            <span className="text-gray-600 hidden md:inline">|</span>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-indigo-400">24h:</span>
                              <span className={`${tokenInfo.priceChange.h24 >= 0 ? 'text-green-500/90' : 'text-red-500/90'}`}>
                                {tokenInfo.priceChange.h24 >= 0 ? '+' : ''}{tokenInfo.priceChange.h24.toFixed(2)}%
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <TokenDescription 
                    description={tokenInfo.description}
                    translatedText={translatedText} 
                    setTranslatedText={setTranslatedText}
                    showTranslate={i18n.language !== 'en'}
                  />

                  <div className="mt-4">
                    <div className="flex flex-col gap-3">
                      {searchAddress && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <span 
                              onClick={() => handleAddressClick(searchAddress)}
                              className="text-[13px] text-gray-400 break-all cursor-pointer hover:text-cyan-400 transition-colors"
                            >
                              {searchAddress}
                              <span className="text-gray-500 ml-1">({tokenInfo.chainId})</span>
                            </span>
                            <CopyButton text={searchAddress} />
                          </div>
                        </div>
                      )}

                      {tokenInfo.creator && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <span 
                              onClick={() => handleAddressClick(tokenInfo.creator, true)}
                              className="text-[13px] text-gray-400 break-all cursor-pointer hover:text-cyan-400 transition-colors"
                            >
                              {tokenInfo.creator}
                              <span className="text-gray-500 ml-1">(dev)</span>
                            </span>
                            <CopyButton text={tokenInfo.creator} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(tokenInfo.twitterLink || tokenInfo.websiteLink || tokenInfo.telegramLink) && (
                    <>
                      <hr className="my-3 border-gray-700" />
                      <div className="flex gap-2">
                        {tokenInfo.twitterLink && (
                          <a 
                            href={tokenInfo.twitterLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title={tokenInfo.twitterLink}
                          >
                            <svg width='20' height='20' viewBox='0 0 24 24' style={{transform: 'scale(0.9)'}}>
                              <path 
                                fill='currentColor' 
                                d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
                              />
                            </svg>
                          </a>
                        )}
                        
                        {tokenInfo.websiteLink && (
                          <a 
                            href={tokenInfo.websiteLink.startsWith('http') 
                              ? tokenInfo.websiteLink 
                              : `https://${tokenInfo.websiteLink}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title={tokenInfo.websiteLink}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          </a>
                        )}
                        
                        {tokenInfo.telegramLink && (
                          <a 
                            href={tokenInfo.telegramLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title={tokenInfo.telegramLink}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {tokenInfo.name === null ? (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gray-200 flex items-center justify-center border border-cyan-500/20">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                ) : tokenInfo.avatar ? (
                  <>
                    <img
                      src={tokenInfo.avatar}
                      alt={tokenInfo.name}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover border border-cyan-500/20 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowAvatarModal(true)}
                    />
                    {showAvatarModal && (
                      <ImagePreviewModal
                        image={tokenInfo.avatar}
                        alt={tokenInfo.name}
                        onClose={() => setShowAvatarModal(false)}
                      />
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {tokenInfo?.creator && (
        <DevTokensList 
          creator={tokenInfo.creator} 
          searchAddress={searchAddress} 
        />
      )}
    </div>
  );
} 