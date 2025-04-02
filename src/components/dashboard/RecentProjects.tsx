'use client';

import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
}

interface RecentProjectsProps {
  projects?: Project[];
  isLoading?: boolean;
}

export default function RecentProjects({ projects, isLoading }: RecentProjectsProps) {
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

  if (!projects?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary-600 dark:text-secondary-400">Aucun projet récent</p>
        <Link 
          href="/projects/new"
          className="inline-flex items-center mt-4 text-primary-500 hover:text-primary-600 transition-colors"
        >
          Créer un projet
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group p-4 rounded-lg bg-background/50 dark:bg-black/20 border border-primary-500/10 
                     hover:border-primary-500/30 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium group-hover:text-primary-500 transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                {project.description}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              project.status === 'ACTIVE' 
                ? 'bg-green-500/10 text-green-500'
                : project.status === 'ON_HOLD'
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-red-500/10 text-red-500'
            }`}>
              {project.status}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-primary-500/10 rounded-full">
                <div 
                  className="h-2 bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-sm text-secondary-600 dark:text-secondary-400">
                {project.progress}%
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 