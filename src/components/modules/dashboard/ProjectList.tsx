'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/common/Card';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Project, ProjectStatus, Priority } from '@prisma/client';

interface ProjectWithDetails extends Project {
  owner: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  teamMembers: {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }[];
  _count: {
    tasks: number;
    completedTasks: number;
  };
}

export default function ProjectList() {
  const { data: projects, isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des projets');
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

  if (!projects?.length) {
    return (
      <Card>
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Aucun projet trouvé
        </div>
      </Card>
    );
  }

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'PLANNING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ACTIVE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ON_HOLD':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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

  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case 'PLANNING':
        return 'En planification';
      case 'ACTIVE':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminé';
      case 'ON_HOLD':
        return 'En pause';
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
      {projects.map((project) => (
        <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {project.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {getPriorityText(project.priority)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {project.description || 'Aucune description'}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 dark:text-gray-400">
                    Tâches : {project._count.tasks}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Terminées : {project._count.completedTasks}
                  </span>
                </div>
                {project.dueDate && (
                  <span className="text-gray-500 dark:text-gray-400">
                    Échéance : {format(new Date(project.dueDate), 'dd MMMM yyyy', { locale: fr })}
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