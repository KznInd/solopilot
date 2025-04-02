'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  SparklesIcon,
  CubeIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  VideoCameraIcon,
  UserPlusIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Vue d\'ensemble', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Projets', href: '/dashboard/projects', icon: ClipboardDocumentListIcon },
  { name: 'Tâches', href: '/dashboard/tasks', icon: CheckCircleIcon },
  { name: 'Calendrier', href: '/dashboard/calendar', icon: CalendarIcon },
  { name: 'Équipe', href: '/dashboard/team', icon: UserGroupIcon },
  { name: 'Communication', href: '/dashboard/communication', icon: PhoneIcon },
  { name: 'SAV', href: '/dashboard/sav/tickets', icon: WrenchScrewdriverIcon },
  { name: 'Stock', href: '/dashboard/inventory', icon: CubeIcon },
  { name: 'Ressources Humaines', href: '/dashboard/hr', icon: UserIcon },
  { name: 'Assistant IA', href: '/dashboard/ai-assistant', icon: SparklesIcon },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
};

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href + '/') || pathname === href;
  };

  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ 
        x: 0,
        width: isCollapsed ? '4rem' : '16rem',
      }}
      transition={{ duration: 0.3 }}
      className={`flex h-full flex-col bg-background/80 dark:bg-black/30 backdrop-blur-xl border-r border-border/50 shadow-glow relative ${className}`}
    >
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard">
            <h1 className={`text-2xl font-bold transition-all duration-300 ${isCollapsed ? 'scale-0' : 'scale-100'}`}>
              {!isCollapsed && 'SoloPilot'}
            </h1>
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        <nav className="space-y-2">
          {navigation.map((item, i) => {
            const active = isActive(item.href);
            
            return (
              <motion.div 
                key={item.name}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
              >
                <Link
                  href={item.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? isCollapsed 
                        ? 'bg-primary-500/20 text-primary-500'
                        : 'bg-primary-500 text-white'
                      : 'text-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0 ${
                      active && isCollapsed ? 'text-primary-500' : ''
                    }`}
                    aria-hidden="true"
                  />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
} 