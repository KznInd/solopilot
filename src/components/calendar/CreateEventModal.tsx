'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import UserSelect from './UserSelect';
import { format } from 'date-fns';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
  onEventCreated?: () => void;
}

export default function CreateEventModal({ isOpen, onClose, initialDate, onEventCreated }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState('00:00');
  const [type, setType] = useState('MEETING');
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des projets');
      }
      return response.json();
    }
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/tasks?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des tâches');
      }
      return response.json();
    },
    enabled: !!projectId
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'événement');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
      onEventCreated?.();
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setType('MEETING');
    setProjectId('');
    setTaskId('');
    setParticipants([]);
  };

  useEffect(() => {
    if (initialDate) {
      const formattedDate = format(initialDate, 'yyyy-MM-dd');
      const formattedTime = format(initialDate, 'HH:mm');
      setStartDate(formattedDate);
      setStartTime(formattedTime);
      setEndDate(formattedDate);
      setEndTime(formattedTime);
    }
  }, [initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          startDate: `${startDate}T${startTime}`,
          endDate: `${endDate}T${endTime}`,
          type,
          projectId: projectId || undefined,
          taskId: taskId || undefined,
          participants,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'événement');
      }

      onClose();
      onEventCreated?.();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de l\'événement');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
            >
              <div className="absolute right-4 top-4">
                <button
                  onClick={onClose}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <h2 className="text-xl font-semibold">Créer un événement</h2>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Titre
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Date de début
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                      Heure de début
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                      Heure de fin
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type d'événement
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as 'MEETING' | 'TASK' | 'PROJECT' | 'OTHER')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  >
                    <option value="MEETING">Réunion</option>
                    <option value="TASK">Tâche</option>
                    <option value="PROJECT">Projet</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                      Projet associé
                    </label>
                    <select
                      id="project"
                      value={projectId}
                      onChange={(e) => {
                        setProjectId(e.target.value);
                        setTaskId(''); // Réinitialiser la tâche sélectionnée
                      }}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                    >
                      <option value="">Sélectionner un projet</option>
                      {projects?.map((project: any) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="task" className="block text-sm font-medium text-gray-700">
                      Tâche associée
                    </label>
                    <select
                      id="task"
                      value={taskId}
                      onChange={(e) => setTaskId(e.target.value)}
                      disabled={!projectId}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Sélectionner une tâche</option>
                      {tasks?.map((task: any) => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Participants
                  </label>
                  <div className="mt-2">
                    <UserSelect
                      selectedUsers={participants}
                      onUserSelect={(userId) => setParticipants([...participants, userId])}
                      onUserRemove={(userId) => setParticipants(participants.filter(id => id !== userId))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createEventMutation.isPending}
                    className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                  >
                    {createEventMutation.isPending ? 'Création...' : 'Créer l\'événement'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 