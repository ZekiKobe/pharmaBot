import { createContext, useContext, useEffect, useState } from 'react';

const TelegramContext = createContext(null);

export function TelegramProvider({ children }) {
  const [webApp, setWebApp] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
    } else {
      // Dev fallback when not in Telegram
      setUser({
        id: 123456789,
        username: 'devuser',
        first_name: 'Dev',
        last_name: 'User',
      });
    }
  }, []);

  const value = {
    webApp,
    user,
    telegramId: user?.id?.toString(),
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
