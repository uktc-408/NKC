import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TokenChart from './TokenChart';
import BubbleMap from './BubbleMap';

export default function TokenAnalytics({ tokenInfo, tokenAddress }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('chart');

  if (!tokenAddress || !tokenInfo) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'chart'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/80'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          {t('token.analytics.priceChart')}
        </button>
        <button
          onClick={() => setActiveTab('bubble')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'bubble'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/80'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          {t('token.analytics.distribution')}
        </button>
      </div>

      <div className="relative">
        <div
          className={`transition-all duration-300 ${
            activeTab === 'chart'
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none hidden'
          }`}
        >
          <TokenChart tokenInfo={tokenInfo} tokenAddress={tokenAddress} />
        </div>
        <div
          className={`transition-all duration-300 ${
            activeTab === 'bubble'
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none hidden'
          }`}
        >
          <BubbleMap tokenInfo={tokenInfo} tokenAddress={tokenAddress} />
        </div>
      </div>
    </div>
  );
} 