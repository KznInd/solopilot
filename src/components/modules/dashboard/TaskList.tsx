'use client';

import { useQuery } from 'react-query';
import { Card } from '@/components/common/Card';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string | null;
  project: {
    id: string;
    name: string;
  };
}

export function TaskList() {
  const { data: tasks, isLoading } = useQuery<Task[]>('tasks', async () => {
    const response = await fetch('/api/tasks');
    return response.json();
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  const priorityColors = {
    LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  };

  const statusLabels = {
    TODO: 'À faire',
    IN_PROGRESS: 'En cours',
    REVIEW: 'En révision',
    DONE: 'Terminé',
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Tâches récentes
          </h2>
          <Link
            href="/tasks"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Voir tout
          </Link>
        </div>

        <div className="space-y-4">
          {tasks?.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{task.project.name}</span>
                    {task.dueDate && (
                      <>
                        <span className="mx-2">•</span>
                        <span>
                          Échéance :{' '}
                          {format(new Date(task.dueDate), 'dd MMM yyyy', {
                            locale: fr,
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === 'DONE'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {statusLabels[task.status]}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
} 