"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const localeMatch = pathname?.match(/^\/(en|sr)/);
  const locale = localeMatch ? localeMatch[1] : 'sr';
  const publicRoutes = [`/${locale}/login`, `/${locale}/forgot-password`, `/${locale}/reset-password`];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    // Don't redirect if still loading or on auth pages
    if (loading) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.push(`/${locale}/login`);
      return;
    }

    // Don't redirect away from reset-password page even if authenticated
    if (isAuthenticated && (pathname === `/${locale}/login` || pathname === `/${locale}/forgot-password`)) {
      router.push(`/${locale}`);
    }
  }, [isAuthenticated, loading, pathname, router, locale, isPublicRoute]);

  // Show loading state while checking authentication
  const loadingState = (
    <div className="flex align-items-center justify-content-center min-h-screen">
      <i className="pi pi-spin pi-spinner text-6xl text-primary"></i>
    </div>
  );

  if (loading || (!isAuthenticated && !isPublicRoute)) {
    return (
      loadingState
    );
  }
  return <>{children}</>;
}
