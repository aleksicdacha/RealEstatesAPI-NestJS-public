"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if still loading or on auth pages
    if (loading) return;

    // Extract locale from pathname (e.g., /sr/login -> sr)
    const localeMatch = pathname?.match(/^\/(en|sr)/);
    const locale = localeMatch ? localeMatch[1] : 'sr';

    const publicRoutes = [`/${locale}/login`, `/${locale}/forgot-password`, `/${locale}/reset-password`];
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

    if (!isAuthenticated && !isPublicRoute) {
      router.push(`/${locale}/login`);
    }

    // Don't redirect away from reset-password page even if authenticated
    if (isAuthenticated && (pathname === `/${locale}/login` || pathname === `/${locale}/forgot-password`)) {
      router.push(`/${locale}`);
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-6xl text-primary"></i>
      </div>
    );
  }

  return <>{children}</>;
}
