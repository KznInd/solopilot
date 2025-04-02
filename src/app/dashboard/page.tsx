'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  FunnelIcon,
  DocumentPlusIcon,
  UserPlusIcon,
  BellIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  RocketLaunchIcon,
  BookOpenIcon,
  VideoCameraIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useUserPreferences } from '@/hooks/useUserPreferences';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Notification {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  type: 'MEETING' | 'TASK' | 'PROJECT' | 'OTHER';
  project: {
    id: string;
    name: string;
  } | null;
  task: {
    id: string;
    title: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  teamMembers: number;
  hoursLogged: number;
  projectsTrend: number;
  tasksTrend: number;
  membersTrend: number;
  hoursTrend: number;
  recentActivities: Array<{
    id: string;
    type: 'project' | 'task' | 'comment';
    description: string;
    user: string;
    time: string;
  }>;
  priorityTasks: Array<{
    id: string;
    title: string;
    project: string;
    dueDate: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  activityData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
    }[];
  };
  projectStatusData: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
    }[];
  };
  taskDistributionData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
  notifications: Notification[];
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Simuler un appel API
  return {
    totalProjects: 12,
    activeProjects: 5,
    totalTasks: 48,
    completedTasks: 28,
    teamMembers: 8,
    hoursLogged: 164,
    projectsTrend: 15,
    tasksTrend: -5,
    membersTrend: 10,
    hoursTrend: 8,
    recentActivities: [
      {
        id: '1',
        type: 'project',
        description: 'Nouveau projet créé : Site E-commerce',
        user: 'Sophie Martin',
        time: 'Il y a 2h'
      },
      {
        id: '2',
        type: 'task',
        description: 'Tâche terminée : Intégration API',
        user: 'Thomas Bernard',
        time: 'Il y a 3h'
      },
      {
        id: '3',
        type: 'comment',
        description: 'Commentaire ajouté sur : Design System',
        user: 'Julie Dubois',
        time: 'Il y a 5h'
      }
    ],
    priorityTasks: [
      {
        id: '1',
        title: 'Finaliser la présentation client',
        project: 'Refonte Site Web',
        dueDate: '2024-04-05',
        priority: 'HIGH'
      },
      {
        id: '2',
        title: 'Corriger les bugs de production',
        project: 'Application Mobile',
        dueDate: '2024-04-06',
        priority: 'HIGH'
      },
      {
        id: '3',
        title: 'Mettre à jour la documentation',
        project: 'API REST',
        dueDate: '2024-04-07',
        priority: 'MEDIUM'
      }
    ],
    activityData: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [
        {
          label: 'Tâches complétées',
          data: [4, 6, 8, 7, 9, 5, 3],
          backgroundColor: ['rgba(59, 130, 246, 0.5)']
        }
      ]
    },
    projectStatusData: {
      labels: ['En cours', 'En pause', 'Terminé'],
      datasets: [{
        data: [5, 3, 4],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ]
      }]
    },
    taskDistributionData: {
      labels: ['À faire', 'En cours', 'En révision', 'Terminé'],
      datasets: [{
        label: 'Tâches par statut',
        data: [15, 8, 5, 20],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ]
      }]
    },
    notifications: [
      {
        id: '1',
        title: 'Réunion de projet',
        description: 'Réunion de suivi du projet "Application Mobile" à 14h',
        startDate: new Date(Date.now() + 3600000).toISOString(),
        endDate: new Date(Date.now() + 7200000).toISOString(),
        type: 'MEETING',
        project: {
          id: '1',
          name: 'Application Mobile'
        },
        task: null,
        createdBy: {
          id: '1',
          name: 'Sophie Martin',
          email: 'sophie.martin@example.com',
          image: null
        },
        status: 'PENDING'
      },
      {
        id: '2',
        title: 'Nouvelle tâche urgente',
        description: 'Correction de bugs critiques sur la page d\'accueil',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        type: 'TASK',
        project: {
          id: '2',
          name: 'Site E-commerce'
        },
        task: {
          id: '1',
          title: 'Correction bugs page d\'accueil'
        },
        createdBy: {
          id: '2',
          name: 'Thomas Bernard',
          email: 'thomas.bernard@example.com',
          image: null
        },
        status: 'PENDING'
      },
      {
        id: '3',
        title: 'Tâche terminée',
        description: 'La tâche "Intégration API" a été marquée comme terminée',
        startDate: '2024-04-01T08:45:00',
        endDate: '2024-04-01T08:45:00',
        type: 'TASK',
        project: {
          id: '2',
          name: 'Application Mobile'
        },
        task: {
          id: '2',
          title: 'Intégration API'
        },
        createdBy: {
          id: '3',
          name: 'Julie Dubois',
          email: 'julie.dubois@example.com',
          image: null
        },
        status: 'ACCEPTED'
      },
    ],
  };
};

const QuickAction = ({ icon: Icon, label, onClick }: {
  icon: any;
  label: string;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all"
    onClick={onClick}
  >
    <Icon className="w-5 h-5 text-blue-500" />
    <span className="text-sm font-medium">{label}</span>
  </motion.button>
);

const StatCard = ({ title, value, trend, icon: Icon, color }: { 
  title: string; 
  value: number | string;
  trend?: number;
  icon: any;
  color: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
              <span className="text-sm">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const ActivityItem = ({ activity }: { activity: DashboardStats['recentActivities'][0] }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
  >
    <div className="flex-grow">
      <p className="text-sm font-medium">{activity.description}</p>
      <p className="text-xs text-gray-500 mt-1">par {activity.user} • {activity.time}</p>
    </div>
  </motion.div>
);

const PriorityTask = ({ task }: { task: DashboardStats['priorityTasks'][0] }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium">{task.title}</h4>
        <p className="text-sm text-gray-500 mt-1">{task.project}</p>
      </div>
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
        task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        {task.priority}
      </div>
    </div>
    <p className="text-xs text-gray-500 mt-2">
      Échéance : {new Date(task.dueDate).toLocaleDateString()}
    </p>
  </motion.div>
);

const NotificationItem = ({ 
  notification, 
  onDelete 
}: { 
  notification: Notification;
  onDelete: (id: string) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      onDelete(notification.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-medium">{notification.title}</h3>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDeleting ? 'animate-spin' : ''
              }`}
              title="Supprimer la notification"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          {notification.description && (
            <p className="mt-1 text-sm text-gray-500">{notification.description}</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
        <div>
          {format(new Date(notification.startDate), 'PPP', { locale: fr })}
          {' à '}
          {format(new Date(notification.startDate), 'HH:mm')}
        </div>
        {notification.project && (
          <div>
            Projet : {notification.project.name}
          </div>
        )}
        {notification.task && (
          <div>
            Tâche : {notification.task.title}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          {notification.createdBy.image ? (
            <img
              src={notification.createdBy.image}
              alt={notification.createdBy.name}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
              <span className="text-xs text-gray-500">
                {notification.createdBy.name?.charAt(0)}
              </span>
            </div>
          )}
          <span>Créé par {notification.createdBy.name}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [activityFilter, setActivityFilter] = useState<'all' | 'project' | 'task' | 'comment'>('all');
  const [isNotificationsCollapsed, setIsNotificationsCollapsed] = useState(false);
  const { preferences } = useUserPreferences();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Réunion de projet',
      description: 'Réunion de suivi du projet "Application Mobile" à 14h',
      startDate: new Date(Date.now() + 3600000).toISOString(),
      endDate: new Date(Date.now() + 7200000).toISOString(),
      type: 'MEETING',
      project: {
        id: '1',
        name: 'Application Mobile'
      },
      task: null,
      createdBy: {
        id: '1',
        name: 'Sophie Martin',
        email: 'sophie.martin@example.com',
        image: null
      },
      status: 'PENDING'
    },
    {
      id: '2',
      title: 'Nouvelle tâche urgente',
      description: 'Correction de bugs critiques sur la page d\'accueil',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      type: 'TASK',
      project: {
        id: '2',
        name: 'Site E-commerce'
      },
      task: {
        id: '1',
        title: 'Correction bugs page d\'accueil'
      },
      createdBy: {
        id: '2',
        name: 'Thomas Bernard',
        email: 'thomas.bernard@example.com',
        image: null
      },
      status: 'PENDING'
    }
  ]);

  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleDeleteAllNotifications = () => {
    setNotifications([]);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  };

  const filteredActivities = stats?.recentActivities.filter(activity => 
    activityFilter === 'all' || activity.type === activityFilter
  );

  const handleQuickAction = (action: string) => {
    // Gérer les actions rapides
    console.log('Action:', action);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Section de bienvenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bonjour 👋</h1>
            <p className="mt-2 text-blue-100">Voici un aperçu de votre activité aujourd'hui</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="mt-2 flex items-center gap-2 justify-end">
              <span className="px-3 py-1 bg-blue-700 rounded-full text-sm">
                {stats.activeProjects} projets actifs
              </span>
              <span className="px-3 py-1 bg-green-600 rounded-full text-sm">
                {stats.completedTasks} tâches terminées
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section de démarrage rapide */}
      {preferences.showQuickStart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <RocketLaunchIcon className="w-6 h-6" />
            <h2 className="text-xl font-bold">Démarrage Rapide</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all"
              onClick={() => handleQuickAction('getting-started')}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-md">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Guide de démarrage</h4>
                  <p className="text-xs text-white/80">Apprenez les bases</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all"
              onClick={() => handleQuickAction('video-tutorials')}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-md">
                  <VideoCameraIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Tutoriels vidéo</h4>
                  <p className="text-xs text-white/80">Découvrez nos fonctionnalités</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all"
              onClick={() => handleQuickAction('best-practices')}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-md">
                  <AcademicCapIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Bonnes pratiques</h4>
                  <p className="text-xs text-white/80">Conseils d'utilisation</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm p-3 rounded-lg cursor-pointer hover:bg-white/20 transition-all"
              onClick={() => handleQuickAction('collaboration')}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-md">
                  <UserGroupIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Collaboration</h4>
                  <p className="text-xs text-white/80">Travail en équipe</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Section des notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Notifications</h3>
            {notifications.some(n => n.status === 'PENDING') && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                {notifications.filter(n => n.status === 'PENDING').length} nouvelle(s)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAllNotifications}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                Tout supprimer
              </button>
            )}
            <button
              onClick={() => setIsNotificationsCollapsed(!isNotificationsCollapsed)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <motion.div
                animate={{ rotate: isNotificationsCollapsed ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isNotificationsCollapsed ? (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                )}
              </motion.div>
            </button>
          </div>
        </div>
        {!isNotificationsCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 overflow-hidden"
          >
            {!notifications.length ? (
              <div className="p-4 text-center text-gray-500">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Aucune notification</p>
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDelete={handleDeleteNotification}
                />
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          icon={DocumentPlusIcon}
          label="Nouveau projet"
          onClick={() => handleQuickAction('new-project')}
        />
        <QuickAction
          icon={PlusIcon}
          label="Nouvelle tâche"
          onClick={() => handleQuickAction('new-task')}
        />
        <QuickAction
          icon={UserPlusIcon}
          label="Ajouter membre"
          onClick={() => handleQuickAction('add-member')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Projets Actifs"
          value={stats?.activeProjects || 0}
          trend={stats?.projectsTrend}
          icon={ChartBarIcon}
          color="text-blue-500 bg-blue-500/10"
        />
        <StatCard
          title="Tâches Complétées"
          value={stats?.completedTasks || 0}
          trend={stats?.tasksTrend}
          icon={CheckCircleIcon}
          color="text-green-500 bg-green-500/10"
        />
        <StatCard
          title="Membres"
          value={stats?.teamMembers || 0}
          trend={stats?.membersTrend}
          icon={UserGroupIcon}
          color="text-purple-500 bg-purple-500/10"
        />
        <StatCard
          title="Heures Enregistrées"
          value={stats?.hoursLogged || 0}
          trend={stats?.hoursTrend}
          icon={ClockIcon}
          color="text-orange-500 bg-orange-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Activité hebdomadaire</h3>
          {stats?.activityData && (
            <Bar options={chartOptions} data={stats.activityData as any} />
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Statut des projets</h3>
          {stats?.projectStatusData && (
            <Pie options={chartOptions} data={stats.projectStatusData as any} />
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Distribution des tâches</h3>
          {stats?.taskDistributionData && (
            <Bar options={chartOptions} data={stats.taskDistributionData as any} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Activités Récentes</h3>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value as any)}
                className="border-0 bg-transparent text-sm font-medium text-gray-600 dark:text-gray-400 focus:ring-0"
              >
                <option value="all">Tout afficher</option>
                <option value="project">Projets</option>
                <option value="task">Tâches</option>
                <option value="comment">Commentaires</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            {filteredActivities?.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tâches Prioritaires</h3>
          <div className="space-y-4">
            {stats?.priorityTasks.map(task => (
              <PriorityTask key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 