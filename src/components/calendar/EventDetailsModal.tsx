import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X } from 'lucide-react';

interface EventDetailsModalProps {
  event: {
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    type: string;
    creator: {
      id: string;
      name: string;
      email: string;
    };
    project?: {
      id: string;
      name: string;
    };
    task?: {
      id: string;
      title: string;
    };
  };
  onClose: () => void;
  onDelete?: () => void;
}

export default function EventDetailsModal({ event, onClose, onDelete }: EventDetailsModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isCreator = session?.user?.id === event.creator.id;

  const handleDelete = async () => {
    if (!isCreator || !event.id) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events?id=${encodeURIComponent(event.id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      onClose();
      onDelete?.();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'événement');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h2>
          <div className="flex gap-2">
            {isCreator && (
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Supprimer
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Description</p>
            <p className="mt-1 text-gray-900 dark:text-gray-100">{event.description || 'Aucune description'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Date de début</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {format(new Date(event.startDate), 'PPP à HH:mm', { locale: fr })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Date de fin</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {format(new Date(event.endDate), 'PPP à HH:mm', { locale: fr })}
              </p>
            </div>
          </div>

          <div>
            <p className="text-gray-600 dark:text-gray-400">Type</p>
            <p className="mt-1 text-gray-900 dark:text-gray-100">{event.type}</p>
          </div>

          {event.project && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Projet associé</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">{event.project.name}</p>
            </div>
          )}

          {event.task && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Tâche associée</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">{event.task.title}</p>
            </div>
          )}

          <div>
            <p className="text-gray-600 dark:text-gray-400">Créé par</p>
            <p className="mt-1 text-gray-900 dark:text-gray-100">{event.creator.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 