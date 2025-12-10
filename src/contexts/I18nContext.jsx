import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import itTranslations from '../locales/it.json';
import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';

const translations = {
  it: itTranslations,
  en: enTranslations,
  fr: frTranslations,
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const { user } = useAuth();
  const [language, setLanguage] = useState('it');

  // Load language from user preferences or localStorage
  useEffect(() => {
    if (user?.preferences?.language) {
      setLanguage(user.preferences.language);
    } else {
      const savedLang = localStorage.getItem('language');
      if (savedLang && translations[savedLang]) {
        setLanguage(savedLang);
      }
    }
  }, [user]);

  // Save to localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  /**
   * Get translation by key path (e.g., "common.save", "dashboard.title")
   * @param {string} key - Translation key path
   * @param {Object} params - Optional parameters for interpolation
   * @returns {string} Translated text
   */
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return key;
      }
    }

    // Handle interpolation if params provided
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value || key;
  };

  /**
   * Change current language
   * @param {string} newLanguage - Language code (it, en, fr)
   */
  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    } else {
      console.error(`Language not supported: ${newLanguage}`);
    }
  };

  const value = {
    language,
    t,
    changeLanguage,
    availableLanguages: ['it', 'en', 'fr'],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to use i18n in components
 * @returns {Object} i18n utilities
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
