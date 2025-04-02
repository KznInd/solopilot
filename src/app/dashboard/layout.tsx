'use client';

import MainLayout from '@/components/layout/MainLayout';
import { SessionProvider } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <MainLayout>
        {children}
      </MainLayout>
    </SessionProvider>
  );
} 