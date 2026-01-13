"use client";

import React, { useEffect, useState } from "react";
import {NextIntlClientProvider} from 'next-intl';
import { PrimeReactProvider } from 'primereact/api';
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { useRouter, usePathname } from "next/navigation";
import { Providers } from "../../providers/query-provider";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useLocale, useTranslations } from 'next-intl';
import { io, Socket } from 'socket.io-client';

// PrimeReact CSS
import "primereact/resources/themes/mira/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.min.css";
import "../globals.css";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { logout, user } = useAuth();
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const [unreadCount, setUnreadCount] = useState(0);

  // Don't show header/footer on auth pages
  const isAuthPage = pathname?.includes('/login') || 
                     pathname?.includes('/forgot-password') || 
                     pathname?.includes('/reset-password');

  // WebSocket connection for agent chat notifications
  useEffect(() => {
    if (!user || isAuthPage) return;

    const socket: Socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/agent-chat`, {
      auth: {
        token: localStorage.getItem('accessToken')
      }
    });

    socket.on('connect', () => {
      console.log('Connected to agent-chat namespace for notifications');
    });

    socket.on('new-conversation-request', (data: { conversationId: number }) => {
      console.log('New conversation request:', data);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, isAuthPage]);

  // Reset counter when navigating to agent-chat page
  useEffect(() => {
    if (pathname?.includes('/agent-chat')) {
      setUnreadCount(0);
    }
  }, [pathname]);

  const menuItems = [
    { 
      label: t('dashboard'), 
      icon: "pi pi-home", 
      command: () => router.push(`/${locale}`) 
    },
    { 
      label: t('properties'), 
      icon: "pi pi-building", 
      command: () => router.push(`/${locale}/properties`) 
    },
    { 
      label: t('clients'), 
      icon: "pi pi-users", 
      command: () => router.push(`/${locale}/clients`) 
    },
    { 
      label: t('users'), 
      icon: "pi pi-user", 
      command: () => router.push(`/${locale}/users`) 
    },
    { 
      label: t('agentChat'), 
      icon: "pi pi-comments", 
      command: () => router.push(`/${locale}/agent-chat`),
      badge: unreadCount > 0 ? unreadCount.toString() : undefined,
      badgeClassName: 'p-badge-danger'
    },
    { 
      label: t('newsletter'), 
      icon: "pi pi-envelope", 
      command: () => router.push(`/${locale}/newsletter`) 
    },
  ];

  const switchLanguage = (newLocale: string) => {
    const currentPath = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${currentPath}`);
  };

  const languageOptions = [
    { label: 'Srpski', value: 'sr', icon: 'pi-language' },
    { label: 'English', value: 'en', icon: 'pi-globe' }
  ];

  const currentLanguage = languageOptions.find(lang => lang.value === locale) || languageOptions[0];

  const endTemplate = (
    <div className="flex align-items-center gap-2">
      <div className="relative" style={{ minWidth: '120px' }}>
        <div style={{ position: 'relative' }}>
          <i 
            className={`pi ${currentLanguage.icon}`} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#6b7280',
              fontSize: '14px',
              pointerEvents: 'none',
              zIndex: 1
            }}
          ></i>
          <select
            value={locale}
            onChange={(e) => switchLanguage(e.target.value)}
            style={{
              padding: '8px 32px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
              transition: 'all 0.2s ease',
              outline: 'none',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {languageOptions.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {user && (
        <span className="text-sm text-600 mr-2">
          {tAuth('welcome')}, <strong>{user.username}</strong>
        </span>
      )}
      <Button 
        icon="pi pi-sign-out" 
        text 
        severity="danger" 
        tooltip={tAuth('logout')}
        onClick={logout}
      />
    </div>
  );

  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-column">
      <header className="border-bottom-1 surface-border">
        <Menubar 
          model={menuItems} 
          end={endTemplate}
          className="border-none"
        />
      </header>

      <main className="flex-1 p-4">
        {children}
      </main>

      <footer className="border-top-1 surface-border p-3 text-center text-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Real Estate Admin. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = React.use(params);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    // Dynamically import messages based on locale
    import(`../../../messages/${locale}.json`)
      .then((module) => {
        setMessages(module.default);
      })
      .catch((error) => console.error('Failed to load messages:', error));
  }, [locale]);

  if (!messages) {
    return (
      <div className="flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
          <p className="mt-3 text-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PrimeReactProvider>
        <Providers>
          <AuthProvider>
            <ProtectedRoute>
              <LayoutContent>{children}</LayoutContent>
            </ProtectedRoute>
          </AuthProvider>
        </Providers>
      </PrimeReactProvider>
    </NextIntlClientProvider>
  );
}
