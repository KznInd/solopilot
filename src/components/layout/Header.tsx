'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserCircleIcon, 
  BellIcon,
} from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import ThemeToggle from '@/components/theme/ThemeToggle';
import GlobalSearch from '@/components/search/GlobalSearch';
import { motion } from 'framer-motion';

export default function Header() {
  const { data: session } = useSession();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 h-16 bg-background/80 dark:bg-black/30 backdrop-blur-xl border-b border-border/50 shadow-glow"
    >
      <div className="h-full px-4 mx-auto flex items-center justify-between">
        {/* Logo et recherche */}
        <div className="flex items-center flex-1 gap-4">
          <Link href="/dashboard">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              className="text-xl font-bold bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent animate-gradient"
            >
              SoloPilot
            </motion.div>
          </Link>
          <div className="hidden md:flex relative flex-1 max-w-md">
            <GlobalSearch />
          </div>
        </div>

        {/* Actions et profil */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-secondary/10 relative">
            <BellIcon className="h-5 w-5 text-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary-500 rounded-full"></span>
          </button>

          <ThemeToggle />
          
          {session?.user ? (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 rounded-lg hover:bg-secondary/10 p-1.5 transition-all duration-300">
                <span className="text-sm font-medium text-foreground hidden sm:inline-block">
                  {session.user.name || session.user.email}
                </span>
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-lg ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-primary-500" />
                )}
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-background/80 dark:bg-black/30 backdrop-blur-xl shadow-glow ring-1 ring-border/50 focus:outline-none divide-y divide-border/50">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link href="/profile">
                          <button className={`${
                            active ? 'bg-secondary/50 dark:bg-secondary-800/50' : ''
                          } group flex w-full items-center rounded-lg px-3 py-2 text-sm text-foreground transition-all duration-300`}>
                            Profil
                          </button>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link href="/settings">
                          <button className={`${
                            active ? 'bg-secondary/50 dark:bg-secondary-800/50' : ''
                          } group flex w-full items-center rounded-lg px-3 py-2 text-sm text-foreground transition-all duration-300`}>
                            Paramètres
                          </button>
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button 
                          onClick={() => signOut()}
                          className={`${
                            active ? 'bg-secondary/50 dark:bg-secondary-800/50' : ''
                          } group flex w-full items-center rounded-lg px-3 py-2 text-sm text-destructive transition-all duration-300`}
                        >
                          Déconnexion
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                Se connecter
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
} 