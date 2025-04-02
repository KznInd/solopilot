'use client';

import { useQuery } from 'react-query';
import { Card } from '@/components/common/Card';

interface Stats {
  activeProjects: number;
  ongoingTasks: number;
  totalDocuments: number;
  teamMembers: number;
}

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery<Stats>('dashboardStats', async () => {
    const response = await fetch('/api/dashboard/stats');
    return response.json();
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Projets actifs
          </h3>
          <p className="mt-2 text-3xl font-semibold text-primary-600 dark:text-primary-400">
            {stats?.activeProjects || 0}
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Tâches en cours
          </h3>
          <p className="mt-2 text-3xl font-semibold text-primary-600 dark:text-primary-400">
            {stats?.ongoingTasks || 0}
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Documents
          </h3>
          <p className="mt-2 text-3xl font-semibold text-primary-600 dark:text-primary-400">
            {stats?.totalDocuments || 0}
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Membres
          </h3>
          <p className="mt-2 text-3xl font-semibold text-primary-600 dark:text-primary-400">
            {stats?.teamMembers || 0}
          </p>
        </div>
      </Card>
    </div>
  );
} 