'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  progress: number;
  teamSize: number;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const fetchProjects = async (): Promise<Project[]> => {
  // Simuler un appel API
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    {
      id: '1',
      name: 'Refonte Site Web',
      description: 'Modernisation complète du site web corporate',
      status: 'ACTIVE',
      progress: 75,
      teamSize: 4,
      dueDate: '2024-04-15',
      priority: 'HIGH'
    },
    {
      id: '2',
      name: 'App Mobile v2',
      description: 'Nouvelle version de l\'application mobile',
      status: 'ACTIVE',
      progress: 45,
      teamSize: 6,
      dueDate: '2024-05-30',
      priority: 'MEDIUM'
    },
    {
      id: '3',
      name: 'Migration Base de Données',
      description: 'Migration vers une nouvelle architecture cloud',
      status: 'ON_HOLD',
      progress: 30,
      teamSize: 3,
      dueDate: '2024-06-15',
      priority: 'HIGH'
    }
  ];
};

const statusColors = {
  ACTIVE: 'bg-green-500/10 text-green-500',
  COMPLETED: 'bg-blue-500/10 text-blue-500',
  ON_HOLD: 'bg-orange-500/10 text-orange-500'
};

const priorityColors = {
  LOW: 'bg-blue-500/10 text-blue-500',
  MEDIUM: 'bg-orange-500/10 text-orange-500',
  HIGH: 'bg-red-500/10 text-red-500'
};

export default function ProjectsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: fetchProjects
  });

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Projets</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <PlusIcon className="w-5 h-5" />
          Nouveau Projet
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary-500/10 bg-background focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary-500/10 bg-background hover:border-primary-500 transition-colors">
            <FunnelIcon className="w-5 h-5" />
            Statut
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 gap-6">
        {filteredProjects?.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-background/50 dark:bg-black/20 border border-primary-500/10 hover:border-primary-500/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{project.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[project.status]}`}>
                  {project.status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${priorityColors[project.priority]}`}>
                  {project.priority}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-8 mt-6">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-secondary-400" />
                <span>{project.teamSize} membres</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-secondary-400" />
                <span>Échéance : {new Date(project.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-secondary-400" />
                <span>{project.progress}% complété</span>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mt-4 h-2 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 