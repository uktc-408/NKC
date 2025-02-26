import React from 'react';
import { useTranslation } from 'react-i18next';

const Loading = ({ text, className = '' }) => {
  const { t } = useTranslation();
  
  return (
    <div className={`h-full w-full flex items-center justify-center ${className}`}>
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-500/40 animate-pulse delay-0"></span>
            <span className="h-2 w-2 rounded-full bg-cyan-500/40 animate-pulse delay-150"></span>
            <span className="h-2 w-2 rounded-full bg-cyan-500/40 animate-pulse delay-300"></span>
          </div>
          <span className="text-cyan-500/70 text-sm">
            {text || t('common.loading')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Loading; 