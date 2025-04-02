'use client';

import { useState } from 'react';
import { XMarkIcon, PaperClipIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface TaskModalProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    assignee?: {
      id: string;
      name: string;
      image?: string;
    };
  };
  onClose: () => void;
  projectId: string;
}

const priorityColors = {
  LOW: 'bg-blue-500/10 text-blue-500 border-blue-200',
  MEDIUM: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  HIGH: 'bg-red-500/10 text-red-500 border-red-200'
};

export default function TaskModal({ task, onClose, projectId }: TaskModalProps) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: note }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de la note');
      }

      setNote('');
      // Recharger les notes
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/tasks/${task.id}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload du fichier');
      }

      // Recharger les pièces jointes
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">{task.title}</h2>
            <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
              {task.priority === 'LOW' ? 'Basse' : 
               task.priority === 'MEDIUM' ? 'Moyenne' : 'Haute'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 h-[calc(80vh-4rem)]">
          {/* Section principale */}
          <div className="col-span-2 p-4 border-r overflow-y-auto">
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {task.description || 'Aucune description'}
                </p>
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-medium mb-2">Notes</h3>
                <form onSubmit={handleAddNote} className="mb-4">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ajouter une note..."
                    className="w-full px-3 py-2 border rounded-lg bg-background resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !note.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Ajout...' : 'Ajouter'}
                    </button>
                  </div>
                </form>
                <div className="space-y-2">
                  {/* Liste des notes ici */}
                </div>
              </div>

              {/* Pièces jointes */}
              <div>
                <h3 className="font-medium mb-2">Pièces jointes</h3>
                <div className="flex items-center gap-2 mb-4">
                  <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-accent">
                    <PaperClipIcon className="w-5 h-5" />
                    <span>Ajouter un fichier</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  {/* Liste des pièces jointes ici */}
                </div>
              </div>
            </div>
          </div>

          {/* Barre latérale */}
          <div className="p-4 bg-muted/10">
            <div className="space-y-4">
              {/* Statut */}
              <div>
                <h3 className="text-sm font-medium mb-2">Statut</h3>
                <select
                  value={task.status}
                  onChange={(e) => {
                    // Mettre à jour le statut
                  }}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="TODO">À faire</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="IN_REVIEW">En revue</option>
                  <option value="DONE">Terminé</option>
                </select>
              </div>

              {/* Assigné à */}
              <div>
                <h3 className="text-sm font-medium mb-2">Assigné à</h3>
                {task.assignee ? (
                  <div className="flex items-center gap-2 p-2 border rounded-lg">
                    {task.assignee.image ? (
                      <Image
                        src={task.assignee.image}
                        alt={task.assignee.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs text-primary font-medium">
                          {task.assignee.name[0]}
                        </span>
                      </div>
                    )}
                    <span className="text-sm">{task.assignee.name}</span>
                  </div>
                ) : (
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-lg w-full hover:bg-accent">
                    <UserPlusIcon className="w-5 h-5" />
                    <span>Assigner</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 