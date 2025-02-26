import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function TokenChart({ tokenInfo, tokenAddress }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  console.log('TokenChart received tokenInfo:', tokenInfo);

  if (!tokenAddress || !tokenInfo) return null;

  const getChainIdentifier = (chainId) => {
    console.log('Processing chainId:', chainId);
    
    const chainMap = {
      'solana': 'sol',
      'ethereum': 'eth',  
      'base':'base',
      'bsc':'bsc'
    };
    return chainMap[chainId] || chainId;
  };

  const chainIdentifier = getChainIdentifier(tokenInfo.chainId);
  console.log('Using chainIdentifier:', chainIdentifier);

  return (
    <div>
    
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
          src={`https://www.gmgn.cc/kline/${chainIdentifier}/${tokenAddress}`}
          className={`w-full h-[500px] border-0 ${isLoading ? 'hidden' : 'block'}`}
          title={t('token.analytics.priceChart')}
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