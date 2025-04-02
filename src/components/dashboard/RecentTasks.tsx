'use client';

import { motion } from 'framer-motion';
import { ChevronRightIcon, CalendarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
  assignee: {
    name: string;
  };
}

interface RecentTasksProps {
  tasks?: Task[];
  isLoading?: boolean;
}

const priorityColors = {
  LOW: 'text-blue-500 bg-blue-500/10',
  MEDIUM: 'text-yellow-500 bg-yellow-500/10',
  HIGH: 'text-red-500 bg-red-500/10'
};

const statusColors = {
  TODO: 'text-secondary-600 bg-secondary-500/10',
  IN_PROGRESS: 'text-blue-500 bg-blue-500/10',
  DONE: 'text-green-500 bg-green-500/10'
};

export default function RecentTasks({ tasks, isLoading }: RecentTasksProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-primary-500/10 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary-600 dark:text-secondary-400">Aucune tâche récente</p>
        <Link 
          href="/tasks/new"
          className="inline-flex items-center mt-4 text-primary-500 hover:text-primary-600 transition-colors"
        >
          Créer une tâche
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group p-4 rounded-lg bg-background/50 dark:bg-black/20 border border-primary-500/10 
                     hover:border-primary-500/30 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium group-hover:text-primary-500 transition-colors">
                {task.title}
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                {task.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status]}`}>
                {task.status}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-secondary-600 dark:text-secondary-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <UserCircleIcon className="w-4 h-4" />
                <span>{task.assignee.name}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 