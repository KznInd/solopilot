'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import ProjectCard from '@/components/projects/ProjectCard';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import { Project, ProjectStatus, Priority } from '@prisma/client';

type ProjectWithDetails = Project & {
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
    comments: number;
  };
};

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredProjects = projects?.filter(project => {
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || project.priority === priorityFilter;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projets</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nouveau projet
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'ALL')}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="COMPLETED">Terminé</option>
          <option value="ON_HOLD">En pause</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | 'ALL')}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="ALL">Toutes les priorités</option>
          <option value="LOW">Basse</option>
          <option value="MEDIUM">Moyenne</option>
          <option value="HIGH">Haute</option>
        </select>

        <input
          type="text"
          placeholder="Rechercher un projet..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-lg flex-grow"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </motion.div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
} 