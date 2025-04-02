'use client';

import { motion } from 'framer-motion';
import { Switch } from '@headlessui/react';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function SettingsPage() {
  const { preferences, updatePreferences } = useUserPreferences();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </div>
      
      <div className="grid gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Préférences d'affichage</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Module de démarrage rapide</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Afficher ou masquer le module de démarrage rapide sur le tableau de bord</p>
              </div>
              <Switch
                checked={preferences.showQuickStart}
                onChange={(checked) => updatePreferences({ showQuickStart: checked })}
                className={`${
                  preferences.showQuickStart ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span className="sr-only">Afficher le module de démarrage rapide</span>
                <span
                  className={`${
                    preferences.showQuickStart ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 