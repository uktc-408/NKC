import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function BubbleMap({ tokenInfo, tokenAddress }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!tokenAddress || !tokenInfo) return null;

  // 获取链标识符
  const getChainIdentifier = (chainId) => {
    const chainMap = {
      'solana': 'sol',
      'ethereum': 'eth',
      'base': 'base',
      'bsc': 'bsc'
    };
    return chainMap[chainId] || chainId;
  };

  const chainIdentifier = getChainIdentifier(tokenInfo.chainId);

  return (
    <div>
      {/* <h3 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
        代币分布
      </h3> */}
      
      <div className="rounded-lg overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center h-[500px] bg-gray-800/30">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-blue-400"></div>
          </div>
        )}
        {hasError && (
          <div className="flex items-center justify-center h-[500px] bg-gray-800/30">
            <div className="text-gray-400">{t('token.chart.error')}</div>
          </div>
        )}
        <iframe
          src={`https://app.bubblemaps.io/${chainIdentifier}/token/${tokenAddress}`}
          className={`w-full h-[500px] border-0 ${isLoading ? 'hidden' : 'block'}`}
          title={t('token.analytics.distribution')}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
    </div>
  );
} 