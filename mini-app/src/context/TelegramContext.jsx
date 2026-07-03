import { createContext, useContext, useEffect, useState } from 'react';

const TelegramContext = createContext(null);

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

      const params = tg.themeParams || {};
      const root = document.documentElement;

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--tg-theme-${key.replace(/_/g, '-')}`, value);
        }
      });

      const bg = params.bg_color || '#0f172a';
      const secondary = params.secondary_bg_color || '#1e293b';

      if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor(secondary);
      if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor(bg);
      if (typeof tg.setBottomBarColor === 'function') tg.setBottomBarColor(secondary);

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
    setReady(true);
  }, []);

  const telegramId = user?.id != null ? String(user.id) : null;

  const value = {
    webApp,
    user,
    telegramId,
    ready,
    haptic: (type = 'light') => webApp?.HapticFeedback?.impactOccurred(type),
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
