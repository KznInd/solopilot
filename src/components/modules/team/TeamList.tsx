'use client';

import { useState } from 'react';
import {
  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  image: string;
  status: 'active' | 'inactive';
}

export default function TeamList() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      role: 'Chef de projet',
      email: 'john@example.com',
      phone: '+33 6 12 34 56 78',
      image: 'https://via.placeholder.com/40',
      status: 'active',
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'Développeur',
      email: 'jane@example.com',
      phone: '+33 6 98 76 54 32',
      image: 'https://via.placeholder.com/40',
      status: 'active',
    },
  ]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Équipe</h3>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Inviter un membre
          </button>
        </div>

        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${member.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'}`}
                    >
                      {member.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <a
                    href={`mailto:${member.email}`}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <EnvelopeIcon className="h-5 w-5" />
                  </a>
                  <a
                    href={`tel:${member.phone}`}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <PhoneIcon className="h-5 w-5" />
                  </a>
                </div>
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