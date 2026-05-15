import { useTranslation } from 'react-i18next';

const LOCALE_MAP: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  zh: 'zh-CN',
};

export function applyHtmlLang(lang: string) {
  document.documentElement.lang = LOCALE_MAP[lang] ?? lang;
}

export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    applyHtmlLang(lang);
  };

  return {
    currentLanguage: i18n.language,
    currentLocale: LOCALE_MAP[i18n.language] ?? i18n.language,
    changeLanguage,
  };
}
