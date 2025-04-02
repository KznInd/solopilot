'use client';

import { motion } from 'framer-motion';
import CalendarView from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <CalendarView />
    </motion.div>
  );
} 