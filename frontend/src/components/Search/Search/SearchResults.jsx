import React from 'react';
import { FaDollarSign, FaChartLine, FaChartBar, FaWater, FaFileContract } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { formatTimeAgo, formatMarketCap } from '../../utils/time';

export default function SearchResults({ results, onSelect, onClose }) {
  const { t } = useTranslation();
  
  if (!results || results.length === 0) return null;

  const handleSelect = (params) => {
    onSelect({ ...params, fromSearchResults: true });
    onClose?.();
  };

  return (
    <div className="p-4 border-b border-gray-700">
      <div className="flex items-center space-x-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
        </svg>
        <h3 className="text-base font-semibold text-gray-200">{t('search.searchResults')}</h3>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {results.map((token, index) => (
          <div
            key={index}
            className="flex items-start p-2 hover:bg-gray-700 rounded-md cursor-pointer transition-colors duration-200"
            onClick={() => handleSelect({ address: token.baseToken.address, mode: 'contract' })}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                {token.info?.imageUrl ? (
                  <img 
                    src={token.info.imageUrl} 
                    alt={token.baseToken.name}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'/%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="font-medium text-sm text-gray-100 break-all">{token.baseToken.name}</span>
                <span className="text-xs text-gray-500">({token.baseToken.symbol})</span>
              </div>
              <div className="text-xs text-gray-400 mt-1 flex items-center flex-wrap gap-2">
                <div className="flex items-center space-x-1 min-w-[90px]">
                  <FaDollarSign className="text-gray-500" />
                  <span>${parseFloat(token.priceUsd).toFixed(6)}</span>
                </div>
                <div className="flex items-center space-x-1 min-w-[80px]">
                  <FaChartLine className={`${token.priceChange.h24 >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                  <span className={`${token.priceChange.h24 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {token.priceChange.h24 >= 0 ? '+' : ''}{token.priceChange.h24}%
                  </span>
                </div>
                {token.marketCap && (
                  <div className="flex items-center space-x-1 min-w-[80px]">
                    <FaChartBar className="text-gray-400" />
                    <span>{formatMarketCap(token.marketCap)}</span>
                  </div>
                )}
                {token.liquidity?.usd && (
                  <div className="flex items-center space-x-1 min-w-[120px]">
                    <FaWater className="text-gray-400" />
                    <span>{formatMarketCap(token.liquidity.usd)}</span>
                    <span className="text-gray-400">
                      ({token.pairAddress.slice(0, 4)}...{token.pairAddress.slice(-4)})
                    </span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                <FaFileContract className="text-gray-500 shrink-0" />
                <span className="truncate">{token.baseToken.address}</span>
              </div>
            </div>
            <div className="text-sm text-gray-400 flex items-center space-x-2 flex-wrap gap-y-1 ml-2">
              <span className="px-2 py-1 bg-gray-600 rounded-md whitespace-nowrap">{token.chainId}</span>
              <span className="px-2 py-1 bg-cyan-900/50 text-cyan-400 rounded-md whitespace-nowrap">{token.dexId}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 