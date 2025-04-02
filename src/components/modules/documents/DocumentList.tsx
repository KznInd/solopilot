'use client';

import { useState } from 'react';
import {
  DocumentIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  lastModified: Date;
  owner: {
    name: string;
    image: string;
  };
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Documents du projet',
      type: 'folder',
      lastModified: new Date(),
      owner: {
        name: 'John Doe',
        image: 'https://via.placeholder.com/40',
      },
    },
    {
      id: '2',
      name: 'Rapport final.pdf',
      type: 'file',
      size: '2.4 MB',
      lastModified: new Date(),
      owner: {
        name: 'Jane Smith',
        image: 'https://via.placeholder.com/40',
      },
    },
  ]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Documents</h3>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            Uploader
          </button>
        </div>

        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center space-x-4">
                {document.type === 'folder' ? (
                  <FolderIcon className="h-8 w-8 text-yellow-500" />
                ) : (
                  <DocumentIcon className="h-8 w-8 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{document.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{document.size}</span>
                    <span>•</span>
                    <span>Modifié le {document.lastModified.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <img
                  src={document.owner.image}
                  alt={document.owner.name}
                  className="h-8 w-8 rounded-full"
                />
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 