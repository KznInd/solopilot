import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import { VideoCameraIcon, MicrophoneIcon, SpeakerXMarkIcon, ComputerDesktopIcon, ChatBubbleLeftRightIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CallNotification from './CallNotification';
import { useSession } from 'next-auth/react';

interface VideoCallProps {
  roomId: string;
  userId: string;
  onClose: () => void;
}

export default function VideoCall({ roomId, userId, onClose }: VideoCallProps) {
  const { data: session } = useSession();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<{ [key: string]: SimplePeer.Instance }>({});
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [incomingCall, setIncomingCall] = useState<{ callerName: string; roomId: string; from: string } | null>(null);
  const socketRef = useRef<SocketIOClient.Socket>();
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialiser la connexion Socket.IO
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    // Envoyer les informations de l'utilisateur
    socket.emit('user-info', {
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email
    });

    // Gérer les notifications d'appel entrant
    socket.on('call-notification', (data) => {
      console.log('Notification d\'appel reçue:', data);
      setIncomingCall(data);
    });

    // Demander l'accès à la caméra et au microphone
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setStream(stream);
      })
      .catch(err => {
        console.error('Erreur lors de l\'accès aux médias:', err);
      });

    // Rejoindre la salle
    socket.emit('join-room', { roomId, userId });

    // Gérer les nouveaux utilisateurs
    socket.on('user-connected', (userId: string) => {
      connectToNewUser(userId);
    });

    // Gérer les utilisateurs déconnectés
    socket.on('user-disconnected', (userId: string) => {
      if (peers[userId]) {
        peers[userId].destroy();
        const newPeers = { ...peers };
        delete newPeers[userId];
        setPeers(newPeers);
      }
    });

    // Gérer les réponses aux appels
    socket.on('call-accepted', ({ from, roomId }) => {
      connectToNewUser(from);
    });

    socket.on('call-rejected', ({ from }) => {
      console.log('Appel rejeté par:', from);
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      socket.disconnect();
    };
  }, [roomId, userId, session]);

  const connectToNewUser = (userId: string) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream
    });

    peer.on('signal', signal => {
      socketRef.current?.emit('signal', { signal, userId });
    });

    peer.on('stream', userStream => {
      const video = document.createElement('video');
      video.srcObject = userStream;
      video.play();
      document.getElementById('video-grid')?.appendChild(video);
    });

    setPeers(prev => ({ ...prev, [userId]: peer }));
  };

  const handleIncomingCall = (accepted: boolean) => {
    if (incomingCall && socketRef.current) {
      socketRef.current.emit('call-response', {
        to: incomingCall.from,
        from: userId,
        accepted,
        roomId: incomingCall.roomId
      });

      if (accepted) {
        // Initialiser la connexion WebRTC
        connectToNewUser(incomingCall.from);
      }

      setIncomingCall(null);
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleScreenSharing = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        
        // Remplacer la vidéo de la caméra par le partage d'écran
        if (stream) {
          const videoTrack = stream.getVideoTracks()[0];
          stream.removeTrack(videoTrack);
          stream.addTrack(screenStream.getVideoTracks()[0]);
        }
      } catch (err) {
        console.error('Erreur lors du partage d\'écran:', err);
      }
    } else {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      
      // Restaurer la vidéo de la caméra
      if (stream) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(cameraStream => {
            const videoTrack = stream.getVideoTracks()[0];
            stream.removeTrack(videoTrack);
            stream.addTrack(cameraStream.getVideoTracks()[0]);
          });
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      const message = { text: newMessage, sender: userId };
      socketRef.current.emit('send-message', { roomId, message });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative">
        <div id="video-grid" className="w-full h-full grid grid-cols-2 gap-4 p-4">
          {stream && (
            <video
              ref={userVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg"
              ref={el => {
                if (el) el.srcObject = stream;
              }}
            />
          )}
        </div>

        {/* Contrôles */}
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
            <VideoCameraIcon className="w-6 h-6" />
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
            onClick={() => setShowChat(!showChat)}
            className={`p-3 rounded-full ${
              showChat ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-3 rounded-full ${
              showParticipants ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
            }`}
          >
            <UserGroupIcon className="w-6 h-6" />
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-red-500 text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Chat */}
        {showChat && (
          <div className="absolute top-0 right-0 w-80 h-full bg-gray-800 border-l border-gray-700">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-medium text-white">Chat</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${
                      message.sender === userId ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg ${
                        message.sender === userId
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Écrivez un message..."
                    className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification d'appel entrant */}
      {incomingCall && (
        <CallNotification
          callerName={incomingCall.callerName}
          onAccept={() => handleIncomingCall(true)}
          onReject={() => handleIncomingCall(false)}
        />
      )}
    </div>
  );
} 