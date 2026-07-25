import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from '@/app/router/AppRouter';
import { useTelegramTheme } from '@/shared/hooks/useTelegramTheme';
import { useTelegramAuth } from '@/features/auth/hooks/useAuth';
import { telegram } from '@/app/telegram/telegram';
import { ToastContainer } from '@/shared/ui/ToastContainer';
import { HomeSkeleton } from '@/shared/ui/HomeSkeleton';
import { useCartStore } from '@/features/orders/store/cartStore';

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

    // Prevent the pull-down-to-close gesture from accidentally exiting the
    // Mini App while the user scrolls a product list.
    telegram.disableVerticalSwipes();

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

  // Ask for confirmation before closing while the cart isn't empty, so a stray
  // swipe/back-gesture doesn't silently drop items the user meant to buy.
  const totalCartItems = useCartStore((s) => s.totalItems());
  useEffect(() => {
    if (totalCartItems > 0) {
      telegram.enableClosingConfirmation();
    } else {
      telegram.disableClosingConfirmation();
    }
  }, [totalCartItems]);

  if (!booted) {
    return <HomeSkeleton />;
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
