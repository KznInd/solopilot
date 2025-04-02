'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import {
  PaperClipIcon,
  TrashIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  createdAt: Date;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface AttachmentsSectionProps {
  taskId: string;
}

export default function AttachmentsSection({ taskId }: AttachmentsSectionProps) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { data: attachments, isLoading } = useQuery<Attachment[]>({
    queryKey: ['attachments', taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}/attachments`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des pièces jointes');
      }
      return response.json();
    },
  });

  const uploadAttachment = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload du fichier');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      setIsUploading(false);
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      const response = await fetch(`/api/tasks/${taskId}/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du fichier');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadAttachment.mutate(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadAttachment.mutate(file);
    }
  }, [uploadAttachment]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="w-6 h-6 text-blue-500" />;
    }
    if (fileType.includes('pdf')) {
      return <DocumentIcon className="w-6 h-6 text-red-500" />;
    }
    return <DocumentDuplicateIcon className="w-6 h-6 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zone de dépôt de fichiers */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer flex flex-col items-center justify-center ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <PaperClipIcon className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {isUploading ? 'Upload en cours...' : 'Glissez-déposez un fichier ici ou cliquez pour sélectionner'}
          </p>
        </label>
      </div>

      {/* Liste des pièces jointes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attachments?.map((attachment) => (
          <div
            key={attachment.id}
            className="flex flex-col p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            {/* Prévisualisation pour les images */}
            {attachment.fileType.startsWith('image/') ? (
              <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={attachment.filePath}
                  alt={attachment.fileName}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 mb-3 rounded-lg bg-gray-50">
                {getFileIcon(attachment.fileType)}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <a
                  href={attachment.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                >
                  {attachment.fileName}
                </a>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(attachment.fileSize)} • {new Date(attachment.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => deleteAttachment.mutate(attachment.id)}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 