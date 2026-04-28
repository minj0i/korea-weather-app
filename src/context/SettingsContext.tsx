import React, { createContext, useContext, useState } from 'react';
import { Language, TranslationKey, translations } from '../constants/i18n';
import { CITIES, City } from '../constants/cities';

export type TempUnit = 'C' | 'F';

interface Settings {
  language:    Language;
  tempUnit:    TempUnit;
  defaultCity: City;
}

interface SettingsContextValue extends Settings {
  setLanguage:    (lang: Language) => void;
  setTempUnit:    (unit: TempUnit) => void;
  setDefaultCity: (city: City) => void;
  t: (key: TranslationKey) => string;
  formatTemp: (celsius: number) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language,    setLanguage]    = useState<Language>('ko');
  const [tempUnit,    setTempUnit]    = useState<TempUnit>('C');
  const [defaultCity, setDefaultCity] = useState<City>(CITIES[0]);

  function t(key: TranslationKey): string {
    return translations[language][key] as string;
  }

  function formatTemp(celsius: number): string {
    if (tempUnit === 'F') {
      const f = Math.round(celsius * 9 / 5 + 32);
      return `${f}°F`;
    }
    return `${celsius}°C`;
  }

  return (
    <SettingsContext.Provider value={{
      language, setLanguage,
      tempUnit, setTempUnit,
      defaultCity, setDefaultCity,
      t, formatTemp,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
