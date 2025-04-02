'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface UserSelectProps {
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  onUserRemove: (userId: string) => void;
}

export default function UserSelect({ selectedUsers, onUserSelect, onUserRemove }: UserSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }
      return response.json();
    }
  });

  const filteredUsers = users?.filter(user => 
    !selectedUsers.includes(user.id) &&
    (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const selectedUserDetails = users?.filter(user => 
    selectedUsers.includes(user.id)
  ) || [];

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Rechercher des participants..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
        />
        {isDropdownOpen && filteredUsers.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
            <ul className="max-h-60 overflow-auto py-1">
              {filteredUsers.map(user => (
                <li
                  key={user.id}
                  onClick={() => {
                    onUserSelect(user.id);
                    setSearchQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="h-6 w-6 rounded-full" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">
                        {user.name?.charAt(0) || user.email.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedUserDetails.map(user => (
          <div
            key={user.id}
            className="flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1"
          >
            {user.image ? (
              <img src={user.image} alt={user.name} className="h-6 w-6 rounded-full" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm font-medium">{user.name}</span>
            <button
              onClick={() => onUserRemove(user.id)}
              className="rounded-full p-1 hover:bg-primary-100"
            >
              <XMarkIcon className="h-4 w-4 text-primary-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 