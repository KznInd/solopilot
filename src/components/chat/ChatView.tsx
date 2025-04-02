'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  PhotoIcon,
  UserGroupIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'PROJECT' | 'TEAM' | 'DIRECT';
  participants: {
    id: string;
    name: string;
    avatar: string;
    status: 'ONLINE' | 'OFFLINE';
  }[];
  lastMessage?: {
    content: string;
    timestamp: string;
  };
}

const fetchChatRooms = async () => {
  // Simuler un appel API
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    {
      id: '1',
      name: 'Projet Site Web',
      type: 'PROJECT',
      participants: [
        { id: '1', name: 'Sophie Martin', avatar: '/avatars/sophie.jpg', status: 'ONLINE' },
        { id: '2', name: 'Thomas Bernard', avatar: '/avatars/thomas.jpg', status: 'OFFLINE' }
      ],
      lastMessage: {
        content: 'Les maquettes sont prêtes pour review',
        timestamp: '2024-03-15T14:30:00'
      }
    },
    {
      id: '2',
      name: 'Équipe Design',
      type: 'TEAM',
      participants: [
        { id: '1', name: 'Sophie Martin', avatar: '/avatars/sophie.jpg', status: 'ONLINE' },
        { id: '3', name: 'Julie Dubois', avatar: '/avatars/julie.jpg', status: 'ONLINE' }
      ],
      lastMessage: {
        content: 'Réunion design system à 15h',
        timestamp: '2024-03-15T10:00:00'
      }
    }
  ] as ChatRoom[];
};

const fetchMessages = async (roomId: string) => {
  // Simuler un appel API
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    {
      id: '1',
      content: 'Les maquettes sont prêtes pour review',
      sender: {
        id: '1',
        name: 'Sophie Martin',
        avatar: '/avatars/sophie.jpg'
      },
      timestamp: '2024-03-15T14:30:00',
      attachments: [
        {
          type: 'image',
          url: '/mockups/homepage.jpg',
          name: 'Homepage.jpg'
        }
      ]
    },
    {
      id: '2',
      content: 'Super ! Je regarde ça tout de suite',
      sender: {
        id: '2',
        name: 'Thomas Bernard',
        avatar: '/avatars/thomas.jpg'
      },
      timestamp: '2024-03-15T14:35:00'
    }
  ] as Message[];
};

export default function ChatView() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatRooms, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: fetchChatRooms
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chat-messages', selectedRoom],
    queryFn: () => selectedRoom ? fetchMessages(selectedRoom) : null,
    enabled: !!selectedRoom
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // TODO: Implémenter l'envoi de message
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-6rem)] p-6">
      <div className="h-full flex rounded-lg overflow-hidden border border-primary-500/10">
        {/* Liste des conversations */}
        <div className="w-80 bg-background/50 dark:bg-black/20 border-r border-primary-500/10">
          <div className="p-4 border-b border-primary-500/10">
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {isLoadingRooms ? (
              // Squelettes de chargement
              Array(4).fill(null).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-16 bg-primary-500/10 rounded-lg"></div>
                </div>
              ))
            ) : (
              chatRooms?.map(room => (
                <motion.button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full p-4 text-left hover:bg-primary-500/5 transition-colors ${
                    selectedRoom === room.id ? 'bg-primary-500/10' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center gap-3">
                    {room.type === 'PROJECT' ? (
                      <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                        <BriefcaseIcon className="w-6 h-6 text-primary-500" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-secondary-500/10 flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-secondary-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{room.name}</h3>
                      {room.lastMessage && (
                        <p className="text-sm text-secondary-600 truncate">
                          {room.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex -space-x-2">
                      {room.participants.slice(0, 3).map(participant => (
                        <div
                          key={participant.id}
                          className="relative w-6 h-6 rounded-full border-2 border-background dark:border-black/20 overflow-hidden"
                          title={participant.name}
                        >
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-background dark:border-black/20 ${
                            participant.status === 'ONLINE' ? 'bg-green-500' : 'bg-secondary-400'
                          }`} />
                        </div>
                      ))}
                      {room.participants.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-background dark:border-black/20 bg-primary-500/10 flex items-center justify-center text-xs">
                          +{room.participants.length - 3}
                        </div>
                      )}
                    </div>
                    {room.lastMessage && (
                      <span className="text-xs text-secondary-600">
                        {new Date(room.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Zone de chat */}
        {selectedRoom ? (
          <div className="flex-1 flex flex-col bg-background/30 dark:bg-black/10">
            {/* En-tête du chat */}
            <div className="p-4 border-b border-primary-500/10">
              <div className="flex items-center gap-4">
                {chatRooms?.find(room => room.id === selectedRoom)?.type === 'PROJECT' ? (
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <BriefcaseIcon className="w-6 h-6 text-primary-500" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-secondary-500/10 flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-secondary-500" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold">
                    {chatRooms?.find(room => room.id === selectedRoom)?.name}
                  </h2>
                  <p className="text-sm text-secondary-600">
                    {chatRooms?.find(room => room.id === selectedRoom)?.participants.length} participants
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                // Squelettes de chargement
                Array(3).fill(null).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-primary-500/10"></div>
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-primary-500/10 rounded mb-2"></div>
                      <div className="h-16 bg-primary-500/10 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                messages?.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3"
                  >
                    <img
                      src={message.sender.avatar}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.sender.name}</span>
                        <span className="text-xs text-secondary-600">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-secondary-800 dark:text-secondary-200">
                        {message.content}
                      </p>
                      {message.attachments && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="relative group rounded-lg overflow-hidden border border-primary-500/10"
                            >
                              {attachment.type === 'image' ? (
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="w-40 h-40 object-cover"
                                />
                              ) : (
                                <div className="w-40 h-40 bg-primary-500/5 flex items-center justify-center">
                                  <PaperClipIcon className="w-8 h-8 text-primary-500" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-sm">{attachment.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-primary-500/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  <PaperClipIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  <PhotoIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  <FaceSmileIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2 bg-background/50 dark:bg-black/20 rounded-lg border border-primary-500/10 
                           focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background/30 dark:bg-black/10">
            <div className="text-center text-secondary-600">
              <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-secondary-400" />
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 