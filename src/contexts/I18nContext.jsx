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
  const [language, setLanguage] = useState(() => {
    // Initialize from localStorage
    const savedLang = localStorage.getItem('language');
    console.log('I18nContext: Initializing language from localStorage:', savedLang);
    return savedLang && translations[savedLang] ? savedLang : 'it';
  });

  // Load language from user preferences when user logs in or preferences change
  useEffect(() => {
    const loadUserLanguage = async () => {
      if (user?.id) {
        try {
          console.log('I18nContext: User detected, checking preferences');

          // Get preferences directly from user object (it's already fetched by AuthContext)
          let prefs = user.preferences || {};

          console.log('I18nContext: Raw preferences from user object:', prefs);

          if (typeof prefs === 'string') {
            try {
              prefs = JSON.parse(prefs);
              console.log('I18nContext: Parsed preferences from JSON string:', prefs);
            } catch (e) {
              console.error('I18nContext: Error parsing preferences', e);
              prefs = {};
            }
          } else {
            console.log('I18nContext: Preferences already object:', prefs);
          }

          if (prefs.language && prefs.language !== language) {
            console.log('I18nContext: Loading user language from preferences:', prefs.language, '(current:', language + ')');
            setLanguage(prefs.language);
          } else if (prefs.language === language) {
            console.log('I18nContext: Language already set to:', language, '- no change needed');
          } else {
            console.log('I18nContext: No language in preferences, keeping current:', language);
          }
        } catch (error) {
          console.error('I18nContext: Error loading user language:', error);
        }
      } else {
        console.log('I18nContext: No user, checking localStorage');
        const savedLang = localStorage.getItem('language');
        if (savedLang && translations[savedLang]) {
          console.log('I18nContext: Loading language from localStorage:', savedLang);
          setLanguage(savedLang);
        }
      }
    };

    loadUserLanguage();
  }, [user]);

  // Save to localStorage when language changes
  useEffect(() => {
    console.log('I18nContext: Language changed, saving to localStorage:', language);
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
    console.log('I18nContext: changeLanguage called with:', newLanguage);
    if (translations[newLanguage]) {
      console.log('I18nContext: Language is supported, changing from', language, 'to', newLanguage);
      setLanguage(newLanguage);
    } else {
      console.error(`I18nContext: Language not supported: ${newLanguage}`);
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
