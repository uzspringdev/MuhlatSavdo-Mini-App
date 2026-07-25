import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HomeSkeleton } from '@/shared/ui/HomeSkeleton';
import { ProtectedRoute } from '@/shared/ui/ProtectedRoute';

const HomePage = lazy(() => import('@/pages/HomePage'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));

export function AppRouter() {
  const location = useLocation();

  return (
    <Suspense fallback={<HomeSkeleton />}>
      {/* Keying by pathname remounts this wrapper on every navigation, replaying
          the fade+slide-in animation — disabled automatically under
          prefers-reduced-motion via the media query on .animate-page-in. */}
      <div key={location.pathname} className="animate-page-in">
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Suspense>
  );
}
