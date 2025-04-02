'use client';

import { useQuery } from 'react-query';
import { Card } from '@/components/common/Card';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  tasks: {
    id: string;
    status: string;
  }[];
}

export function ProjectList() {
  const { data: projects, isLoading } = useQuery<Project[]>('projects', async () => {
    const response = await fetch('/api/projects');
    return response.json();
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Projets récents
          </h2>
          <Link
            href="/projects"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Voir tout
          </Link>
        </div>

        <div className="space-y-4">
          {projects?.map((project) => {
            const activeTasks = project.tasks.filter(
              (task) => task.status !== 'DONE'
            ).length;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : project.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {project.status === 'ACTIVE'
                      ? 'Actif'
                      : project.status === 'COMPLETED'
                      ? 'Terminé'
                      : 'Archivé'}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>{activeTasks} tâches en cours</span>
                  <span className="mx-2">•</span>
                  <span>
                    Créé le{' '}
                    {format(new Date(project.createdAt), 'dd MMM yyyy', {
                      locale: fr,
                    })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
} 