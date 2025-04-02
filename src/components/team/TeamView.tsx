'use client';

import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  UserPlusIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'DESIGNER';
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  avatar: string;
  projects: {
    id: string;
    name: string;
  }[];
  skills: string[];
}

const fetchTeamMembers = async () => {
  // Simuler un appel API
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    {
      id: '1',
      name: 'Sophie Martin',
      email: 'sophie.martin@example.com',
      phone: '+33 6 12 34 56 78',
      role: 'DESIGNER',
      status: 'AVAILABLE',
      avatar: '/avatars/sophie.jpg',
      projects: [
        { id: '1', name: 'Refonte Site Web' },
        { id: '2', name: 'App Mobile v2' }
      ],
      skills: ['UI Design', 'UX Design', 'Figma', 'Adobe XD']
    },
    {
      id: '2',
      name: 'Thomas Bernard',
      email: 'thomas.bernard@example.com',
      phone: '+33 6 23 45 67 89',
      role: 'DEVELOPER',
      status: 'BUSY',
      avatar: '/avatars/thomas.jpg',
      projects: [
        { id: '1', name: 'Refonte Site Web' }
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'Next.js']
    }
  ] as TeamMember[];
};

const roleColors = {
  ADMIN: 'text-purple-500 bg-purple-500/10',
  MANAGER: 'text-blue-500 bg-blue-500/10',
  DEVELOPER: 'text-green-500 bg-green-500/10',
  DESIGNER: 'text-orange-500 bg-orange-500/10'
};

const statusIcons = {
  AVAILABLE: CheckCircleIcon,
  BUSY: ClockIcon,
  OFFLINE: XCircleIcon
};

const statusColors = {
  AVAILABLE: 'text-green-500',
  BUSY: 'text-orange-500',
  OFFLINE: 'text-secondary-400'
};

export default function TeamView() {
  const [filter, setFilter] = useState('');
  
  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: fetchTeamMembers
  });

  const filteredMembers = members?.filter(member => 
    filter === '' || member.role === filter
  );

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Équipe</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <UserPlusIcon className="w-5 h-5" />
          Ajouter un membre
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-4 p-4 bg-background/50 dark:bg-black/20 rounded-lg border border-primary-500/10">
        <FunnelIcon className="w-5 h-5 text-secondary-600" />
        <div className="flex items-center gap-4">
          <select
            className="px-4 py-2 bg-background dark:bg-black/40 rounded-lg border border-primary-500/20"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Tous les rôles</option>
            <option value="ADMIN">Administrateur</option>
            <option value="MANAGER">Manager</option>
            <option value="DEVELOPER">Développeur</option>
            <option value="DESIGNER">Designer</option>
          </select>
        </div>
      </div>

      {/* Liste des membres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Squelettes de chargement
          Array(6).fill(null).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-primary-500/10 rounded-lg"></div>
            </div>
          ))
        ) : filteredMembers?.map(member => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group p-6 bg-background/50 dark:bg-black/20 rounded-lg border border-primary-500/10 
                     hover:border-primary-500/30 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${statusColors[member.status]}`}>
                  {React.createElement(statusIcons[member.status], { className: 'w-4 h-4' })}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold group-hover:text-primary-500 transition-colors">
                      {member.name}
                    </h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${roleColors[member.role]}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-secondary-600">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    <a href={`mailto:${member.email}`} className="hover:text-primary-500">
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    <a href={`tel:${member.phone}`} className="hover:text-primary-500">
                      {member.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-4 h-4" />
                    <span>{member.projects.length} projets</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs bg-primary-500/10 text-primary-500 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 