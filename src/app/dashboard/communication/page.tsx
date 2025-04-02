'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisHorizontalIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  PhoneXMarkIcon,
  MicrophoneIcon,
  SpeakerXMarkIcon,
  ComputerDesktopIcon,
  UserGroupIcon,
  PaperClipIcon,
  PhotoIcon,
  FaceSmileIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  BellIcon,
  BellSlashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import VideoCall from '@/components/communication/VideoCall';
import io, { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

// Types pour les contacts
interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'away';
  avatar?: string;
  lastSeen?: string;
  notifications?: boolean;
}

// Types pour les messages
interface Message {
  id?: string;
  content: string;
  senderId: string;
  receiverId?: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
  read?: boolean;
  reactions?: { [key: string]: string[] };
  sender?: {
    id: string;
    name: string;
    email: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
  };
}

// Types pour les réunions
interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: string[];
  status: 'scheduled' | 'ongoing' | 'completed';
}

// Supprimer toutes les déclarations en double de emojis et garder une seule déclaration au début du fichier
const emojis = ['👍', '❤️', '😊', '😂', '🎉', '👏', '🔥', '💯', '🤔', '👀'];

export default function CommunicationPage() {
  // États pour les contacts
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    email: '',
    role: '',
    department: '',
  });

  // États pour la visioconférence
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const socketRef = useRef<Socket | undefined>();
  const { data: session } = useSession();

  // États pour le chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'meetings'>('chat');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Référence pour le défilement automatique
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filtrer les contacts
  const filteredContacts = contacts.filter((contact) => {
    // Exclure l'utilisateur courant de la liste
    if (contact.email === session?.user?.email) return false;

    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || contact.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || contact.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Obtenir les départements uniques
  const departments = Array.from(new Set(contacts.map(contact => contact.department)));

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Fonctions pour la visioconférence
  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleCamera = () => setIsCameraOn(!isCameraOn);
  const toggleCall = () => setIsCallActive(!isCallActive);
  const toggleScreenSharing = () => setIsScreenSharing(!isScreenSharing);
  const toggleParticipants = () => setShowParticipants(!showParticipants);
  const toggleChat = () => setShowChat(!showChat);

  // Charger les contacts depuis la base de données
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Erreur lors du chargement des contacts');
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    loadContacts();
  }, []);

  // Fonction pour charger les messages
  const loadMessages = async () => {
    if (!selectedContact?.id || !session?.user?.id) return;

    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages?userId=${selectedContact.id}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Effet pour faire défiler jusqu'au bas de la conversation lorsque de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialiser Socket.IO avec des options de reconnexion
  useEffect(() => {
    // Créer une nouvelle connexion Socket.IO
    const socket = io(process.env.NODE_ENV === 'production' 
      ? process.env.SOCKET_SERVER_URL || 'https://votre-serveur-socket.railway.app'
      : 'http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Assigner le socket à la référence
    socketRef.current = socket;

    // Gérer les événements de connexion
    socket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
      
      // Envoyer les informations de l'utilisateur après la connexion
      if (session?.user) {
        socket.emit('user-info', {
          name: session.user.name,
          email: session.user.email,
          id: session.user.id
        });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket.IO:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnecté au serveur Socket.IO après', attemptNumber, 'tentatives');
    });

    socket.on('disconnect', (reason) => {
      console.log('Déconnecté du serveur Socket.IO:', reason);
    });

    // Écouter les nouveaux messages
    socket.on('new-message', (message) => {
      console.log('Nouveau message reçu:', message);
      // Vérifier si le message est destiné à l'utilisateur actuel ou envoyé par lui
      if (message.senderId === session?.user?.id || message.receiverId === session?.user?.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = undefined;
    };
  }, [session]);

  // Ajouter un effet pour rejoindre la room quand un contact est sélectionné
  useEffect(() => {
    if (selectedContact && session?.user?.id && socketRef.current) {
      const participants = [session.user.id, selectedContact.id].sort();
      const roomId = `chat-${participants[0]}-${participants[1]}`;
      
      // Rejoindre la room
      socketRef.current.emit('join-room', roomId);
      
      console.log('Rejoining room:', roomId);

      // Charger les messages existants
      loadMessages();
    }
  }, [selectedContact, session?.user?.id]);

  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !socketRef.current || !session?.user?.id) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: session.user.id,
      receiverId: selectedContact.id,
      type: 'text',
      timestamp: new Date().toISOString(),
      sender: {
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || ''
      },
      receiver: {
        id: selectedContact.id,
        name: selectedContact.name,
        email: selectedContact.email
      }
    };

    try {
      // Créer un identifiant de room unique et cohérent pour les deux utilisateurs
      const participants = [session.user.id, selectedContact.id].sort();
      const roomId = `chat-${participants[0]}-${participants[1]}`;

      // Envoyer le message via Socket.IO
      socketRef.current.emit('send-message', {
        roomId,
        message
      });

      // Réinitialiser le champ de message
      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  // Gérer l'envoi du message avec la touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Fonction pour ajouter une réaction à un message
  const addReaction = (messageId: string | undefined, emoji: string) => {
    if (!messageId) return;
    
    setMessages(messages.map(message => {
      if (message.id === messageId) {
        const reactions = message.reactions || {};
        const userIds = reactions[emoji] || [];
        
        // Si l'utilisateur a déjà réagi avec cet emoji, on le retire
        if (userIds.includes('1')) {
          if (userIds.length === 1) {
            const { [emoji]: _, ...rest } = reactions;
            return { ...message, reactions: rest };
          } else {
            return {
              ...message,
              reactions: {
                ...reactions,
                [emoji]: userIds.filter(id => id !== '1'),
              },
            };
          }
        } else {
          // Sinon, on ajoute l'utilisateur à la liste
          return {
            ...message,
            reactions: {
              ...reactions,
              [emoji]: [...userIds, '1'],
            },
          };
        }
      }
      return message;
    }));
    setSelectedEmoji(null);
  };

  // Fonction pour créer une nouvelle réunion
  const createMeeting = () => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: 'Nouvelle réunion',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      participants: selectedContact ? [selectedContact.id, '1'] : ['1'],
      status: 'scheduled',
    };
    setMeetings([...meetings, newMeeting]);
  };

  // Fonction pour marquer un message comme lu
  const markAsRead = (messageId: string) => {
    setMessages(messages.map(message => {
      if (message.id === messageId && message.senderId !== '1') {
        return { ...message, read: true };
      }
      return message;
    }));
  };

  // Fonction pour basculer les notifications d'un contact
  const toggleNotifications = (contactId: string) => {
    setContacts(contacts.map(contact => {
      if (contact.id === contactId) {
        return { ...contact, notifications: !contact.notifications };
      }
      return contact;
    }));
  };

  // Fonction pour ajouter un nouveau contact
  const addContact = () => {
    if (newContact.name && newContact.email) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name,
        email: newContact.email,
        role: newContact.role || 'Membre',
        department: newContact.department || 'Général',
        status: 'offline',
        lastSeen: 'Jamais',
        notifications: true,
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: '', email: '', role: '', department: '' });
      setShowAddContactModal(false);
    }
  };

  // Fonction pour faire défiler jusqu'au bas de la conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effet pour faire défiler jusqu'au bas de la conversation lorsque de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fonction pour démarrer un appel
  const startCall = (contactId: string) => {
    if (!socketRef.current || !session?.user?.id) return;

    const roomId = `call-${Date.now()}`;
    setCurrentRoomId(roomId);
    setIsInCall(true);

    // Envoyer l'événement d'appel entrant
    socketRef.current.emit('incoming-call', {
      to: contactId,
      from: session.user.id,
      roomId: roomId,
      callerName: session.user.name
    });
  };

  // Fonction pour terminer un appel
  const endCall = () => {
    setIsInCall(false);
    setCurrentRoomId(null);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Communication</h1>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
            onClick={() => setShowAddContactModal(true)}
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>Ajouter un contact</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau des contacts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col h-full">
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un contact..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent appearance-none"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">Tous les départements</option>
                {departments.map((dept) => (
                  <option key={`dept-${dept}`} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="relative flex-1">
              <div className="w-2 h-2 rounded-full bg-green-500 absolute left-3 top-1/2 transform -translate-y-1/2"></div>
              <select
                className="w-full pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent appearance-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="online">En ligne</option>
                <option value="away">Absent</option>
                <option value="offline">Hors ligne</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  selectedContact?.id === contact.id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-medium">
                        {contact.name.charAt(0)}
                      </div>
                    )}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(contact.status)}`}></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{contact.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{contact.role}</p>
                  </div>
                  <button 
                    className={`p-1.5 rounded-full ${contact.notifications ? 'text-blue-500' : 'text-gray-400'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNotifications(contact.id);
                    }}
                  >
                    {contact.notifications ? (
                      <BellIcon className="w-4 h-4" />
                    ) : (
                      <BellSlashIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone principale (chat ou visioconférence) */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl overflow-hidden flex flex-col h-full">
          {selectedContact ? (
            <div className="flex flex-col h-full">
              {/* En-tête */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {selectedContact.avatar ? (
                      <img
                        src={selectedContact.avatar}
                        alt={selectedContact.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-medium">
                        {selectedContact.name.charAt(0)}
                      </div>
                    )}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(selectedContact.status)}`}></div>
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedContact.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedContact.status === 'online' ? 'En ligne' : selectedContact.lastSeen}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleCall}
                    className={`p-2 rounded-lg ${
                      isCallActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isCallActive ? (
                      <PhoneXMarkIcon className="w-5 h-5" />
                    ) : (
                      <PhoneIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
                    <EnvelopeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Zone de visioconférence ou chat */}
              {isCallActive ? (
                <div className="flex-1 bg-gray-900 relative">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-32 h-32 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <UserGroupIcon className="w-16 h-16 text-gray-400" />
                      </div>
                      <p className="text-xl font-medium">Appel avec {selectedContact.name}</p>
                      <p className="text-gray-400">En cours</p>
                    </div>
                  </div>

                  {/* Contrôles de la caméra */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                    <button
                      onClick={toggleMic}
                      className={`p-3 rounded-full ${
                        isMicOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {isMicOn ? (
                        <MicrophoneIcon className="w-6 h-6" />
                      ) : (
                        <SpeakerXMarkIcon className="w-6 h-6" />
                      )}
                    </button>
                    <button
                      onClick={toggleCamera}
                      className={`p-3 rounded-full ${
                        isCameraOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {isCameraOn ? (
                        <VideoCameraIcon className="w-6 h-6" />
                      ) : (
                        <SpeakerXMarkIcon className="w-6 h-6" />
                      )}
                    </button>
                    <button
                      onClick={toggleScreenSharing}
                      className={`p-3 rounded-full ${
                        isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
                      }`}
                    >
                      <ComputerDesktopIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={toggleChat}
                      className={`p-3 rounded-full ${
                        showChat ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
                      }`}
                    >
                      <ChatBubbleLeftRightIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={toggleParticipants}
                      className={`p-3 rounded-full ${
                        showParticipants ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
                      }`}
                    >
                      <UserGroupIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Panneau latéral pour le chat ou les participants */}
                  <AnimatePresence>
                    {(showChat || showParticipants) && (
                      <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="absolute top-0 right-0 w-80 h-full bg-gray-800 border-l border-gray-700"
                      >
                        {showChat ? (
                          <div className="h-full flex flex-col">
                            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                              <h3 className="font-medium text-white">Chat</h3>
                              <button onClick={toggleChat} className="text-gray-400 hover:text-white">
                                <XMarkIcon className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                              {messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex mb-4 ${
                                    message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
                                  }`}
                                >
                                  <div
                                    className={`max-w-[70%] rounded-lg p-3 ${
                                      message.senderId === session?.user?.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-700 text-white'
                                    }`}
                                  >
                                    <p>{message.content}</p>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-xs opacity-70">{message.timestamp}</p>
                                      {message.senderId === session?.user?.id && (
                                        <div className="flex items-center">
                                          {message.read ? (
                                            <CheckIcon className="w-4 h-4 text-blue-300" />
                                          ) : (
                                            <ClockIcon className="w-4 h-4 text-gray-400" />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.entries(message.reactions).map(([emoji, userIds], index) => (
                                          <div
                                            key={`reaction-${message.id}-${emoji}-${index}`}
                                            className="bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                                          >
                                            <span>{emoji}</span>
                                            <span>{userIds.length}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t border-gray-700">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Écrivez votre message..."
                                  className="flex-1 px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white"
                                  value={newMessage}
                                  onChange={(e) => setNewMessage(e.target.value)}
                                  onKeyPress={handleKeyPress}
                                />
                                <button
                                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                  onClick={sendMessage}
                                >
                                  Envoyer
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col">
                            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                              <h3 className="font-medium text-white">Participants</h3>
                              <button onClick={toggleParticipants} className="text-gray-400 hover:text-white">
                                <XMarkIcon className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-700 mb-2" key="current-user">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                  S
                                </div>
                                <div>
                                  <p className="font-medium text-white">Sophie Martin</p>
                                  <p className="text-xs text-gray-400">Vous</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-700 mb-2" key="other-user">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                  T
                                </div>
                                <div>
                                  <p className="font-medium text-white">Thomas Bernard</p>
                                  <p className="text-xs text-gray-400">En ligne</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Onglets */}
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex">
                      <button
                        className={`px-4 py-2 font-medium ${
                          activeTab === 'chat'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                        onClick={() => setActiveTab('chat')}
                      >
                        Chat
                      </button>
                      <button
                        className={`px-4 py-2 font-medium ${
                          activeTab === 'meetings'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                        onClick={() => setActiveTab('meetings')}
                      >
                        Réunions
                      </button>
                    </div>
                  </div>

                  {/* Contenu des onglets */}
                  {activeTab === 'chat' ? (
                    <>
                      {/* Zone de chat */}
                      <div className="flex-1 overflow-y-auto p-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex mb-4 ${
                              message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.senderId === session?.user?.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            >
                              <p>{message.content}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs opacity-70">{message.timestamp}</p>
                                {message.senderId === session?.user?.id && (
                                  <div className="flex items-center">
                                    {message.read ? (
                                      <CheckIcon className="w-4 h-4 text-blue-300" />
                                    ) : (
                                      <ClockIcon className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                                )}
                              </div>
                              {message.reactions && Object.keys(message.reactions).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Object.entries(message.reactions).map(([emoji, userIds], index) => (
                                    <div
                                      key={`reaction-${message.id}-${emoji}-${index}`}
                                      className="bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                                    >
                                      <span>{emoji}</span>
                                      <span>{userIds.length}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Zone de saisie */}
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                          <div className="relative">
                            <button
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                              <FaceSmileIcon className="w-5 h-5 text-gray-500" />
                            </button>
                            {showEmojiPicker && (
                              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-5 gap-1">
                                  {emojis.map((emoji, index) => (
                                    <button
                                      key={`emoji-${emoji}-${index}`}
                                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                      onClick={() => {
                                        setSelectedEmoji(emoji);
                                        setShowEmojiPicker(false);
                                      }}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowFileUpload(!showFileUpload)}
                          >
                            <PaperClipIcon className="w-5 h-5 text-gray-500" />
                          </button>
                          <input
                            type="text"
                            placeholder="Écrivez votre message..."
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                          />
                          <button
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                            onClick={sendMessage}
                          >
                            Envoyer
                          </button>
                        </div>
                        {selectedEmoji && (
                          <div className="mt-2 flex items-center gap-2">
                            <p className="text-sm text-gray-500">Réagir au dernier message avec :</p>
                            <button
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (messages.length > 0 && messages[messages.length - 1].id) {
                                  addReaction(messages[messages.length - 1].id, selectedEmoji);
                                }
                              }}
                            >
                              <span>{selectedEmoji}</span>
                              <XMarkIcon
                                className="w-4 h-4 text-gray-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEmoji(null);
                                }}
                              />
                            </button>
                          </div>
                        )}
                        {showFileUpload && (
                          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium">Joindre un fichier</p>
                              <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowFileUpload(false)}
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600">
                                <PhotoIcon className="w-6 h-6 text-blue-500 mb-1" />
                                <span className="text-xs">Image</span>
                              </button>
                              <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600">
                                <PaperClipIcon className="w-6 h-6 text-purple-500 mb-1" />
                                <span className="text-xs">Document</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Réunions planifiées</h3>
                        <button
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1"
                          onClick={createMeeting}
                        >
                          <PlusIcon className="w-4 h-4" />
                          <span>Nouvelle réunion</span>
                        </button>
                      </div>
                      <div className="space-y-3">
                        {meetings.map((meeting) => (
                          <div
                            key={meeting.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{meeting.title}</h4>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                  <CalendarDaysIcon className="w-4 h-4" />
                                  <span>{meeting.date}</span>
                                  <ClockIcon className="w-4 h-4 ml-2" />
                                  <span>{meeting.time}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startCall(meeting.participants[0])}
                                  className="p-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <VideoCameraIcon className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
                                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1">
                              <UserGroupIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-500">
                                {meeting.participants.length} participant{meeting.participants.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">Sélectionnez un contact</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Choisissez un contact pour commencer à discuter ou à appeler.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout de contact */}
      <AnimatePresence>
        {showAddContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Ajouter un contact</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAddContactModal(false)}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rôle</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Département</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                    value={newContact.department}
                    onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                  >
                    <option value="">Sélectionner un département</option>
                    {departments.map((dept) => (
                      <option key={`dept-${dept}`} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                  onClick={() => setShowAddContactModal(false)}
                >
                  Annuler
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  onClick={addContact}
                >
                  Ajouter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isInCall && currentRoomId ? (
        <VideoCall
          roomId={currentRoomId}
          userId={session?.user?.id || ''}
          onClose={endCall}
        />
      ) : null}
    </div>
  );
} 