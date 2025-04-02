'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Task, Project, Priority, TaskStatus } from '@prisma/client';
import CommentsSection from '@/components/tasks/CommentsSection';
import AttachmentsSection from '@/components/tasks/AttachmentsSection';

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
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }[];
}

export default function TaskDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  const { data: task, isLoading } = useQuery<TaskWithDetails>({
    queryKey: ['task', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${params.id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la tâche');
      }
      return response.json();
    },
  });

  const updateTask = useMutation({
    mutationFn: async (updatedData: Partial<Task>) => {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la tâche');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', params.id] });
      setIsEditMode(false);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la tâche');
      }
    },
    onSuccess: () => {
      router.push('/dashboard/tasks');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) {
    return <div>Tâche non trouvée</div>;
  }

  const statusColors = {
    TODO: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    REVIEW: 'bg-yellow-100 text-yellow-800',
    DONE: 'bg-green-100 text-green-800',
  };

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-orange-100 text-orange-800',
    HIGH: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* En-tête de la tâche */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedTask.title || task.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    className="text-2xl font-bold w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                )}
                {isEditMode ? (
                  <textarea
                    value={editedTask.description || task.description || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    className="w-full h-24 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-600">{task.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isEditMode ? (
                  <>
                    <button
                      onClick={() => updateTask.mutate(editedTask)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CheckIcon className="w-5 h-5" />
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setEditedTask({});
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(true)}
                      className="flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              {isEditMode ? (
                <>
                  <select
                    value={editedTask.status || task.status}
                    onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as TaskStatus })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="TODO">À faire</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="REVIEW">En révision</option>
                    <option value="DONE">Terminé</option>
                  </select>
                  <select
                    value={editedTask.priority || task.priority}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Priority })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                  </select>
                  <input
                    type="date"
                    value={editedTask.dueDate?.toString().split('T')[0] || task.dueDate?.toString().split('T')[0] || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, dueDate: new Date(e.target.value) })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </>
              ) : (
                <>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
                    {task.status === 'TODO' ? 'À faire' :
                     task.status === 'IN_PROGRESS' ? 'En cours' :
                     task.status === 'REVIEW' ? 'En révision' : 'Terminé'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}>
                    Priorité {task.priority === 'LOW' ? 'Basse' :
                             task.priority === 'MEDIUM' ? 'Moyenne' : 'Haute'}
                  </span>
                  {task.dueDate && (
                    <span className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="w-5 h-5" />
                      Échéance : {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Informations complémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Projet et assignation */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Détails</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Projet</p>
                  <p className="text-gray-900">{task.project.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigné à</p>
                  {task.assignee ? (
                    <div className="flex items-center mt-2">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden">
                        {task.assignee.image ? (
                          <Image
                            src={task.assignee.image}
                            alt={task.assignee.name || task.assignee.email}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                            {(task.assignee.name || task.assignee.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-900">{task.assignee.name || task.assignee.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Non assigné</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Commentaires</h2>
              <CommentsSection taskId={params.id} />
            </div>
          </div>

          {/* Pièces jointes */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Pièces jointes</h2>
              <AttachmentsSection taskId={params.id} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de confirmation de suppression */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteTask.mutate()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {deleteTask.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 