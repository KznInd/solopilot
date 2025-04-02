'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface CommentsSectionProps {
  taskId: string;
}

export default function CommentsSection({ taskId }: CommentsSectionProps) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commentaires');
      }
      return response.json();
    },
  });

  const createComment = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la création du commentaire');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setNewComment('');
    },
  });

  const updateComment = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const response = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du commentaire');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setEditingComment(null);
      setEditedContent('');
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du commentaire');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulaire de nouveau commentaire */}
      <div className="flex gap-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
        />
        <button
          onClick={() => createComment.mutate(newComment)}
          disabled={!newComment.trim() || createComment.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createComment.isPending ? 'Envoi...' : 'Commenter'}
        </button>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                  {comment.user.image ? (
                    <Image
                      src={comment.user.image}
                      alt={comment.user.name || comment.user.email}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      {(comment.user.name || comment.user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {comment.user.name || comment.user.email}
                    </p>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {editingComment?.id === comment.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateComment.mutate({ commentId: comment.id, content: editedContent })}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingComment(null);
                            setEditedContent('');
                          }}
                          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 mt-1">{comment.content}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingComment(comment);
                    setEditedContent(comment.content);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteComment.mutate(comment.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 