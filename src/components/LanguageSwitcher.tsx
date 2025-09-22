'use client';

import { useTranslation } from '../contexts/LanguageContext';
import { supportedLanguages } from '../locales';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'button' | 'dropdown';
}

export default function LanguageSwitcher({ 
  className = '', 
  variant = 'button' 
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = language === 'ro' ? 'ru' : 'ro';
    setLanguage(newLanguage);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        className={`
          flex items-center gap-2 px-4 py-2 
          bg-gray-800/80 hover:bg-gray-700/80 
          border border-yellow-400/30 hover:border-yellow-400/50
          text-yellow-400 hover:text-yellow-300
          rounded-lg transition-all duration-200
          backdrop-blur-sm
          ${className}
        `}
        title={`Switch to ${language === 'ro' ? 'Russian' : 'Romanian'}`}
      >
        <span className="text-lg">
          {language === 'ro' ? supportedLanguages.ru.flag : supportedLanguages.ro.flag}
        </span>
        <span className="font-medium">
          {t('language.switchTo')}
        </span>
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'ro' | 'ru')}
        className="
          appearance-none bg-gray-800/80 border border-yellow-400/30
          text-yellow-400 rounded-lg px-4 py-2 pr-8
          focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
          transition-all duration-200 backdrop-blur-sm
        "
      >
        <option value="ro">{supportedLanguages.ro.flag} {supportedLanguages.ro.name}</option>
        <option value="ru">{supportedLanguages.ru.flag} {supportedLanguages.ru.name}</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}