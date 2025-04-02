'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-gray-900 dark:to-black flex relative overflow-hidden">
      {/* Effet de fond animé */}
      <div className="absolute inset-0 bg-gradient-radial from-primary-500/10 via-transparent to-transparent dark:from-primary-500/5 animate-pulse-slow" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <Sidebar />
      <div className="flex-1 relative">
        <Header />
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-6 md:p-8 relative z-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
} 