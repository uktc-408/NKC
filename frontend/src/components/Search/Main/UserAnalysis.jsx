import { useTranslation } from 'react-i18next';

export default function UserAnalysis({ analysis, searchAddress }) {
  const { t, i18n } = useTranslation();
  
  if (!analysis) return null;

  let analysisText;
  if (typeof analysis === 'object') {
    analysisText =
      i18n.language === 'en'
        ? (analysis.english || JSON.stringify(analysis, null, 2))
        : (analysis.chinese || JSON.stringify(analysis, null, 2));
  } else {
    analysisText = analysis;
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-2 text-gray-300 flex items-center gap-2">
        <div className="relative">
          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div className="absolute inset-0 bg-cyan-400/20 blur-[6px] -z-10"></div>
        </div>
        {t('analysis.title')}
      </h3>
      
      <div className="mb-3 text-amber-500/80 text-sm flex items-center gap-2 px-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{t('analysis.aiDisclaimer')}</span>
      </div>

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
          <div className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
            {analysisText}
          </div>
        </div>
      </div>
    </div>
  );
}