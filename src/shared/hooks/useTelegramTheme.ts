import { useEffect } from 'react';
import { telegram } from '@/app/telegram/telegram';

/** Sync Telegram theme params into CSS variables */
export function useTelegramTheme() {
  useEffect(() => {
    const app = telegram.app;
    if (!app) return;

    const theme = app.themeParams;
    const root = document.documentElement;

    if (theme.bg_color) root.style.setProperty('--tg-bg', theme.bg_color);
    if (theme.text_color)
      root.style.setProperty('--tg-text', theme.text_color);
    if (theme.button_color)
      root.style.setProperty('--tg-button', theme.button_color);
    if (theme.button_text_color)
      root.style.setProperty('--tg-button-text', theme.button_text_color);
    if (theme.secondary_bg_color)
      root.style.setProperty('--tg-secondary-bg', theme.secondary_bg_color);
    if (theme.hint_color)
      root.style.setProperty('--tg-hint', theme.hint_color);

    // Apply dark mode class
    if (app.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
}
