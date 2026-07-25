import { useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import ru from './ru.json';
import uz from './uz.json';

export type Lang = 'ru' | 'uz';

type Dictionary = Record<string, string>;

const dictionaries: Record<Lang, Dictionary> = { ru, uz };

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

// Default is 'ru' regardless of device/Telegram language — a deliberate
// product decision, not an oversight. See PLAN.md decision Q2.
export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'ru',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'muhlatsavdo-lang' },
  ),
);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

/**
 * Translate a key in the currently selected language, falling back to Russian.
 * The returned function is only recreated when `lang` changes, so it's safe to
 * list as a dependency in effects/callbacks without causing extra re-runs.
 */
export function useT() {
  const lang = useLangStore((s) => s.lang);
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const template = dictionaries[lang][key] ?? dictionaries.ru[key] ?? key;
      return interpolate(template, vars);
    },
    [lang],
  );
}
