import { createContext, useContext, useEffect, useState } from 'react';

const TelegramContext = createContext(null);

const LIGHT_THEME = {
  bgColor: '#f5f7fb',
  secondaryBgColor: '#ffffff',
  textColor: '#0f172a',
  hintColor: '#64748b',
  linkColor: '#0f766e',
  buttonColor: '#0d9488',
  buttonTextColor: '#ffffff',
};

function applyLightTheme(root) {
  root.style.setProperty('--tg-theme-bg-color', LIGHT_THEME.bgColor);
  root.style.setProperty('--tg-theme-secondary-bg-color', LIGHT_THEME.secondaryBgColor);
  root.style.setProperty('--tg-theme-text-color', LIGHT_THEME.textColor);
  root.style.setProperty('--tg-theme-hint-color', LIGHT_THEME.hintColor);
  root.style.setProperty('--tg-theme-link-color', LIGHT_THEME.linkColor);
  root.style.setProperty('--tg-theme-button-color', LIGHT_THEME.buttonColor);
  root.style.setProperty('--tg-theme-button-text-color', LIGHT_THEME.buttonTextColor);
}

function parseUserFromInitData(initData) {
  if (!initData) return null;
  try {
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return JSON.parse(decodeURIComponent(userJson));
    }
  } catch {
    return null;
  }
}

function resolveTelegramUser(tg) {
  if (!tg) return null;

  const unsafeUser = tg.initDataUnsafe?.user;
  if (unsafeUser?.id) return unsafeUser;

  const fromInitData = parseUserFromInitData(tg.initData);
  if (fromInitData?.id) return fromInitData;

  return null;
}

function getDevUser() {
  const devId = import.meta.env.VITE_DEV_TELEGRAM_ID || '123456789';
  return {
    id: Number(devId),
    username: 'devuser',
    first_name: 'Dev',
    last_name: 'User',
  };
}

export function TelegramProvider({ children }) {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();

      const root = document.documentElement;
      applyLightTheme(root);

      if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor(LIGHT_THEME.secondaryBgColor);
      if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor(LIGHT_THEME.bgColor);
      if (typeof tg.setBottomBarColor === 'function') tg.setBottomBarColor(LIGHT_THEME.secondaryBgColor);

      setWebApp(tg);

      let resolved = resolveTelegramUser(tg);

      if (!resolved && import.meta.env.DEV) {
        resolved = getDevUser();
      }

      setUser(resolved);
      setReady(true);
      return;
    }

    if (import.meta.env.DEV) {
      setUser(getDevUser());
    }
    applyLightTheme(document.documentElement);
    setReady(true);
  }, []);

  const telegramId = user?.id != null ? String(user.id) : null;

  const haptic = (type = 'light') => {
    const feedback = webApp?.HapticFeedback;
    if (!feedback) return;

    if (type === 'success' || type === 'error' || type === 'warning') {
      feedback.notificationOccurred?.(type);
      return;
    }

    feedback.impactOccurred?.(type);
  };

  const value = {
    webApp,
    user,
    telegramId,
    ready,
    haptic,
  };

  return (
    <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>
  );
}

export function useTelegram() {
  const ctx = useContext(TelegramContext);
  if (!ctx) throw new Error('useTelegram must be used within TelegramProvider');
  return ctx;
}
