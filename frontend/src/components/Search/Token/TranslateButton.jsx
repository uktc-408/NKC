import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import translate from 'translate';

translate.engine = 'google';
translate.from = 'en';
translate.to = 'zh';

export default function TranslateButton({ text, onTranslated }) {
  const { t } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);

  const handleTranslate = async () => {
    if (!text || isTranslating) return;
    
    if (translatedText) {
      setShowTranslation(!showTranslation);
      onTranslated(!showTranslation ? translatedText : null);
      return;
    }
    
    setIsTranslating(true);
    try {
      const result = await translate(text, { to: 'zh' });
      setTranslatedText(result);
      setShowTranslation(true);
      onTranslated(result);
    } catch (error) {
      console.error(t('common.error.translate'), error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <button
      onClick={handleTranslate}
      disabled={isTranslating}
      className={`text-[13px] px-2 py-0.5 rounded-md ${
        isTranslating 
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
      }`}
    >
      {isTranslating 
        ? t('common.translate.loading')
        : translatedText 
          ? (showTranslation ? t('common.translate.hide') : t('common.translate.show'))
          : t('common.translate.button')
      }
    </button>
  );
} 