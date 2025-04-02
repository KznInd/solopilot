'use client';

import { motion } from 'framer-motion';

export default function TicketsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Service Après-Vente</h1>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          Nouveau ticket
        </button>
      </div>
      <div className="grid gap-6">
        <div className="p-6 rounded-xl bg-background/50 dark:bg-black/20 border border-border/50">
          <p className="text-muted-foreground">La liste des tickets sera bientôt disponible.</p>
        </div>
      </div>
    </motion.div>
  );
} 