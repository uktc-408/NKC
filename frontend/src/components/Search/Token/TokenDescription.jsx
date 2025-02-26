import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TranslateButton from './TranslateButton';

export default function TokenDescription({ description, translatedText, setTranslatedText, showTranslate }) {
  const { t } = useTranslation();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!description) return null;

  const shouldTruncate = description.length > 200;
  const displayText = isDescriptionExpanded ? description : description.slice(0, 200);

  return (
    <div className="mt-2">
      <div className="md:flex md:items-center md:gap-3 text-[13px]">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span className="font-medium text-gray-300">{t('token.description.label')}</span>
          {showTranslate && (
            <TranslateButton 
              text={description} 
              onTranslated={(text) => setTranslatedText(text)}
            />
          )}
        </div>
      </div>
      <div className="relative pl-6">
        <p className="mt-1 break-words text-gray-400 text-[13px]">
          {displayText}
          {shouldTruncate && !isDescriptionExpanded && '...'}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="text-blue-500 hover:text-blue-400 text-[13px] mt-1"
          >
            {isDescriptionExpanded ? t('common.expand.hide') : t('common.expand.show')}
          </button>
        )}
      </div>
      {translatedText && (
        <div className="mt-2 p-3 bg-gray-800/50 rounded-md pl-6">
          <p className="break-words text-gray-400 text-[13px]">
            {translatedText}
          </p>
        </div>
      )}
    </div>
  );
} 