import React from 'react';
import { formatMarketCap } from '../../utils/time';

export default function MobileSearchResultItem({ token, onSelect }) {
  return (
    <div
      className="pt-1 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
      onClick={() => onSelect({
        address: token.baseToken.address,
        mode: 'contract',
        fromSearchButton: true
      })}
    >
      <div className="flex flex-col p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {token.info?.imageUrl ? (
              <img
                src={token.info.imageUrl}
                alt={token.baseToken.name}
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
            )}
            <div className="flex flex-col">
              <div className="font-medium text-sm text-gray-100">
                {token.baseToken.name} 
                <span className="text-xs text-gray-500 ml-1">({token.baseToken.symbol})</span>
              </div>
              <div className="text-xs text-gray-400">
                {token.baseToken.address.slice(0, 6)}...{token.baseToken.address.slice(-4)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1">
              <span className="text-xs px-2 py-0.5 bg-gray-600 rounded text-gray-300">{token.chainId}</span>
              <span className="text-xs px-2 py-0.5 bg-cyan-900/50 text-cyan-400 rounded">{token.dexId}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-300">${parseFloat(token.priceUsd).toFixed(6)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className={`${token.priceChange.h24 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {token.priceChange.h24 >= 0 ? '+' : ''}{token.priceChange.h24}%
            </span>
          </div>
          {token.marketCap && (
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-gray-300">MCap: {formatMarketCap(token.marketCap)}</span>
            </div>
          )}
          {token.liquidity?.usd && (
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-gray-300">Liq: {formatMarketCap(token.liquidity.usd)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 