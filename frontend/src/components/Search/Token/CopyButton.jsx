import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CopyButton({ text, className = "" }) {
  const { t } = useTranslation();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error(t('common.error.copy'), err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-blue-400 hover:text-blue-300 relative ${className}`}
      title={t('common.copy.button')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"/>
      </svg>
      {copySuccess && (
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {t('common.copy.success')}
        </span>
      )}
    </button>
  );
} 