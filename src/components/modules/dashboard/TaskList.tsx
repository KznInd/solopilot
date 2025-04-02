'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/common/Card';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Task, TaskStatus, Priority } from '@prisma/client';

interface TaskWithDetails extends Task {
  project: {
    id: string;
    name: string;
  };
  assignee: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

export default function TaskList() {
  const { data: tasks, isLoading } = useQuery<TaskWithDetails[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des tâches');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <Card>
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Aucune tâche trouvée
        </div>
      </Card>
    );
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'REVIEW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DONE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'URGENT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'À faire';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'REVIEW':
        return 'En révision';
      case 'DONE':
        return 'Terminé';
      default:
        return status;
    }
  };

  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case 'LOW':
        return 'Basse';
      case 'MEDIUM':
        return 'Moyenne';
      case 'HIGH':
        return 'Haute';
      case 'URGENT':
        return 'Urgente';
      default:
        return priority;
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {task.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {getPriorityText(task.priority)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {task.description || 'Aucune description'}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 dark:text-gray-400">
                    Projet : {task.project.name}
                  </span>
                  {task.assignee && (
                    <span className="text-gray-500 dark:text-gray-400">
                      Assigné à : {task.assignee.name || task.assignee.email}
                    </span>
                  )}
                </div>
                {task.dueDate && (
                  <span className="text-gray-500 dark:text-gray-400">
                    Échéance : {format(new Date(task.dueDate), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
} 