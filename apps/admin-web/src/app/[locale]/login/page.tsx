"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuth();
  const t = useTranslations('auth');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      router.push(`/${locale}`);
    } catch (err: unknown) {
      const error = err as {response?: {data?: {message?: string}}};
      setError(error.response?.data?.message || t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card className="w-full max-w-30rem shadow-8">
        <div className="text-center mb-5">
          <div className="text-900 text-4xl font-bold mb-2">🏡</div>
          <div className="text-900 text-3xl font-bold mb-3">Real Estate Admin</div>
          <span className="text-600 font-medium">{t('login')}</span>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <Message severity="error" text={error} className="w-full mb-3" />
          )}

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 border-round" style={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }}>
              <div className="flex align-items-center mb-2">
                <i className="pi pi-info-circle text-blue-500 mr-2"></i>
                <strong className="text-blue-800">{t('devCredentials') || 'Development Credentials'}</strong>
              </div>
              <div className="text-sm text-blue-700">
                <div className="mb-1">
                  <strong>{t('username')}:</strong> admin@google.com
                </div>
                <div>
                  <strong>{t('password')}:</strong> admin123
                </div>
              </div>
            </div>
          )}

          <div className="field mb-4">
            <label htmlFor="username" className="block text-900 font-medium mb-2">
              {t('username')}
            </label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full"
              placeholder={t('username')}
            />
          </div>

          <div className="field mb-4">
            <label htmlFor="password" className="block text-900 font-medium mb-2">
              {t('password')}
            </label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              inputClassName="w-full"
              placeholder={t('password')}
              feedback={false}
              toggleMask
            />
          </div>

          <Button
            type="submit"
            label={t('login')}
            icon="pi pi-sign-in"
            loading={loading}
            className="w-full mb-3"
            size="large"
          />

          <div className="text-center">
            <Link 
              href={`/${locale}/forgot-password`} 
              className="text-primary hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
