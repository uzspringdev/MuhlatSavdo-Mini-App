import { type TelegramWebApp } from '@/shared/types';

const tg = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const telegram = {
  /** Returns the WebApp instance or null (browser fallback) */
  get app() {
    return tg();
  },

  /** Is the app running inside Telegram? */
  get isInTelegram(): boolean {
    return !!tg();
  },

  /** Raw initData string for backend auth */
  get initData(): string {
    return tg()?.initData ?? '';
  },

  /** Parsed initData object */
  get initDataUnsafe() {
    return tg()?.initDataUnsafe ?? null;
  },

  /** Telegram user from initData */
  get user() {
    return tg()?.initDataUnsafe?.user ?? null;
  },

  /** Color scheme: dark | light */
  get colorScheme(): 'light' | 'dark' {
    return tg()?.colorScheme ?? 'light';
  },

  /** Theme params */
  get themeParams() {
    return tg()?.themeParams ?? {};
  },

  /** Expand the mini app to full screen */
  expand() {
    tg()?.expand();
  },

  /** Signal that the app is ready (hides splash) */
  ready() {
    tg()?.ready();
  },

  /** Enable the back button */
  showBackButton(callback: () => void) {
    const app = tg();
    if (!app) return;
    app.BackButton.show();
    app.BackButton.onClick(callback);
    return () => app.BackButton.offClick(callback);
  },

  /** Hide back button */
  hideBackButton() {
    tg()?.BackButton.hide();
  },

  /** Disable pull-down-to-close vertical swipe (Bot API 7.7) */
  disableVerticalSwipes() {
    tg()?.disableVerticalSwipes?.();
  },

  /** Re-enable pull-down-to-close vertical swipe */
  enableVerticalSwipes() {
    tg()?.enableVerticalSwipes?.();
  },

  /** Ask for confirmation before closing the Mini App */
  enableClosingConfirmation() {
    tg()?.enableClosingConfirmation();
  },

  /** Remove the closing confirmation prompt */
  disableClosingConfirmation() {
    tg()?.disableClosingConfirmation();
  },

  /** Native Telegram alert, falls back to a callback-driven no-op outside Telegram */
  showAlert(message: string, callback?: () => void) {
    const app = tg();
    if (app?.showAlert) {
      app.showAlert(message, callback);
    } else {
      callback?.();
    }
  },

  /** Device safe-area insets reported by Telegram (Bot API 8.0), null if unavailable */
  get safeAreaInset() {
    return tg()?.safeAreaInset ?? null;
  },

  /** Subscribe to a native WebApp event (e.g. 'themeChanged') */
  onEvent(eventType: string, callback: () => void) {
    tg()?.onEvent(eventType, callback);
  },

  /** Unsubscribe from a native WebApp event */
  offEvent(eventType: string, callback: () => void) {
    tg()?.offEvent(eventType, callback);
  },

  /** Show main action button */
  showMainButton(text: string, callback: () => void) {
    const app = tg();
    if (!app) return;
    app.MainButton.setText(text).show().enable();
    app.MainButton.onClick(callback);
    return () => app.MainButton.offClick(callback);
  },

  /** Hide main button */
  hideMainButton() {
    tg()?.MainButton.hide();
  },

  /** Show loading state on main button */
  setMainButtonLoading(loading: boolean) {
    const app = tg();
    if (!app) return;
    if (loading) {
      app.MainButton.showProgress(false).disable();
    } else {
      app.MainButton.hideProgress().enable();
    }
  },

  /** Haptic feedback helpers */
  haptic: {
    light: () => tg()?.HapticFeedback?.impactOccurred('light'),
    medium: () => tg()?.HapticFeedback?.impactOccurred('medium'),
    heavy: () => tg()?.HapticFeedback?.impactOccurred('heavy'),
    success: () => tg()?.HapticFeedback?.notificationOccurred('success'),
    error: () => tg()?.HapticFeedback?.notificationOccurred('error'),
    warning: () => tg()?.HapticFeedback?.notificationOccurred('warning'),
    selection: () => tg()?.HapticFeedback?.selectionChanged(),
  },

  /** Parse initData string into a Map for backend POST */
  parseInitData(): Record<string, string> {
    const raw = tg()?.initData ?? '';
    if (!raw) return {};
    const params: Record<string, string> = {};
    raw.split('&').forEach((pair: string) => {
      const [k, v] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
    });
    return params;
  },
};
