'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useEffect } from 'react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
    if (isAuthenticated && pathname === '/login') {
      router.push('/');
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/login') {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
