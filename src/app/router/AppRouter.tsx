import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { ProtectedRoute } from '@/shared/ui/ProtectedRoute';

const HomePage = lazy(() => import('@/pages/HomePage'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col justify-center px-4">
      <LoadingSkeleton count={6} />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
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
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Suspense>
  );
}
