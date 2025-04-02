'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckIcon, XMarkIcon, BellIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

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

export default function NotificationsPanel() {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications');
      }
      return response.json();
    }
  });

  const updateParticipationMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'ACCEPTED' | 'DECLINED' }) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, status }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la participation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Participation mise à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour de la participation');
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (eventId: string) => {
      setIsDeleting(eventId);
      try {
        const response = await fetch(`/api/notifications/${eventId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la suppression de la notification');
        }
        return response.json();
      } finally {
        setIsDeleting(null);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la notification');
    }
  });

  const deleteAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      if (!notifications?.length) return;
      
      const results = await Promise.allSettled(
        notifications.map(notification =>
          fetch(`/api/notifications/${notification.id}`, {
            method: 'DELETE',
          })
        )
      );

      const errors = results.filter(result => result.status === 'rejected');
      if (errors.length > 0) {
        throw new Error(`${errors.length} notifications n'ont pas pu être supprimées`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Toutes les notifications ont été supprimées');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Chargement des notifications...</p>
      </div>
    );
  }

  if (!notifications?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2">Aucune notification</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-end">
        <button
          onClick={() => deleteAllNotificationsMutation.mutate()}
          disabled={deleteAllNotificationsMutation.isPending}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleteAllNotificationsMutation.isPending ? 'Suppression...' : 'Tout supprimer'}
        </button>
      </div>
      {notifications.map((notification) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${
            notification.status !== 'PENDING' ? 'opacity-75' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{notification.title}</h3>
                <button
                  onClick={() => deleteNotificationMutation.mutate(notification.id)}
                  disabled={isDeleting === notification.id}
                  className={`ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDeleting === notification.id ? 'animate-spin' : ''
                  }`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              {notification.description && (
                <p className="mt-1 text-sm text-gray-500">{notification.description}</p>
              )}
            </div>
            {notification.status === 'PENDING' && (
              <div className="ml-4 flex items-center gap-2">
                <button
                  onClick={() => updateParticipationMutation.mutate({ 
                    eventId: notification.id, 
                    status: 'ACCEPTED' 
                  })}
                  disabled={updateParticipationMutation.isPending}
                  className="rounded-full bg-green-50 p-1 text-green-600 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => updateParticipationMutation.mutate({ 
                    eventId: notification.id, 
                    status: 'DECLINED' 
                  })}
                  disabled={updateParticipationMutation.isPending}
                  className="rounded-full bg-red-50 p-1 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}
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
      ))}
    </div>
  );
} 