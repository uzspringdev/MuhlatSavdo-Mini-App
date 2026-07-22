import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from '@/app/router/AppRouter';
import { useTelegramTheme } from '@/shared/hooks/useTelegramTheme';
import { useTelegramAuth } from '@/features/auth/hooks/useAuth';
import { telegram } from '@/app/telegram/telegram';
import { ToastContainer } from '@/shared/ui/ToastContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

function AppContent() {
  useTelegramTheme();
  const { mutate: telegramAuth } = useTelegramAuth();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    // Expand to full screen in Telegram
    telegram.expand();
    telegram.ready();

    // Disable overscroll bounce
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    // Attempt Telegram auth if initData available
    if (telegram.isInTelegram && telegram.initData) {
      telegramAuth(undefined, { onSettled: () => setBooted(true) });
    } else {
      setBooted(true);
    }
  }, []);

  if (!booted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-di-red to-red-700 flex items-center justify-center shadow-xl shadow-di-red/30">
            <span className="text-2xl font-black text-white">MS</span>
          </div>
          <div className="w-6 h-6 border-3 border-di-red border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <AppRouter />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
