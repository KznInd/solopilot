'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/common/Card';

interface Stats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  upcomingDeadlines: number;
}

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-gray-100 dark:bg-gray-800">
            <div />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Projets</h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">{stats.totalProjects}</p>
        </div>
      </Card>
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tâches</h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">{stats.totalTasks}</p>
        </div>
      </Card>
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tâches terminées</h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">{stats.completedTasks}</p>
        </div>
      </Card>
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Échéances à venir</h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">{stats.upcomingDeadlines}</p>
        </div>
      </Card>
    </div>
  );
} 