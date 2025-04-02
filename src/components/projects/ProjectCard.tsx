import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ChatBubbleLeftIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
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
    completedTasks: number;
  };
};

interface ProjectCardProps {
  project: ProjectWithDetails;
}

const statusColors = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
  ON_HOLD: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PLANNING: 'bg-purple-50 text-purple-700 border-purple-200'
} as const;

const priorityColors = {
  LOW: 'bg-gray-50 text-gray-700 border-gray-200',
  MEDIUM: 'bg-orange-50 text-orange-700 border-orange-200',
  HIGH: 'bg-red-50 text-red-700 border-red-200',
  URGENT: 'bg-red-100 text-red-800 border-red-300'
} as const;

const statusLabels = {
  ACTIVE: 'En cours',
  COMPLETED: 'Terminé',
  ON_HOLD: 'En attente',
  PLANNING: 'Planification'
} as const;

const priorityLabels = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente'
} as const;

function getProgressColor(taskCount: number, completedTasks: number) {
  const progress = taskCount === 0 ? 0 : (completedTasks / taskCount) * 100;
  if (progress >= 75) return 'bg-green-500';
  if (progress >= 50) return 'bg-blue-500';
  if (progress >= 25) return 'bg-yellow-500';
  return 'bg-gray-500';
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const completedTasks = project._count.completedTasks || 0;
  const progress = project._count.tasks === 0 
    ? 0 
    : Math.round((completedTasks / project._count.tasks) * 100);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <Link href={`/dashboard/projects/${project.id}`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 line-clamp-1 mb-2">
                {project.name}
              </h2>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[project.status]}`}>
                  {statusLabels[project.status]}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[project.priority]}`}>
                  {priorityLabels[project.priority]}
                </span>
              </div>
            </div>
            <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100">
              <ChartBarIcon className={`w-6 h-6 ${getProgressColor(project._count.tasks, completedTasks)}`} />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1 text-xs font-medium border border-gray-100">
                {progress}%
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-6 line-clamp-2 min-h-[3rem]">
            {project.description || 'Aucune description'}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <div className="p-2 rounded-lg bg-gray-50">
                <ClipboardDocumentListIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{project._count.tasks}</div>
                <div className="text-xs text-gray-500">Tâches</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <div className="p-2 rounded-lg bg-gray-50">
                <ChatBubbleLeftIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{project._count.comments}</div>
                <div className="text-xs text-gray-500">Commentaires</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="relative flex -space-x-2">
                {project.teamMembers.slice(0, 3).map((member) => (
                  <div
                    key={member.user.id}
                    className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-50"
                    title={member.user.name || member.user.email}
                  >
                    {member.user.image ? (
                      <Image
                        src={member.user.image}
                        alt={member.user.name || member.user.email}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">
                        {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                {project.teamMembers.length > 3 && (
                  <div className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-xs text-gray-500 font-medium">
                    +{project.teamMembers.length - 3}
                  </div>
                )}
              </div>
            </div>
            {project.dueDate && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <ClockIcon className="w-4 h-4" />
                <span>{new Date(project.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
} 