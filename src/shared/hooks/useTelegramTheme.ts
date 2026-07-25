import { useEffect } from 'react';
import { telegram } from '@/app/telegram/telegram';

function applyTheme() {
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

  if (app.colorScheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/** Sync Telegram theme params into CSS variables and keep them live across theme switches */
export function useTelegramTheme() {
  useEffect(() => {
    if (!telegram.app) return;

    applyTheme();
    telegram.onEvent('themeChanged', applyTheme);
    return () => telegram.offEvent('themeChanged', applyTheme);
  }, []);
}
