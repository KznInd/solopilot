import { Server } from 'socket.io';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3001;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.IO server');
});

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.NEXTAUTH_URL 
      : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Stockage des utilisateurs dans chaque salle
const rooms: { [key: string]: Set<string> } = {};
// Stockage des informations des utilisateurs
const userInfo: { [key: string]: { name: string; email: string; id: string } } = {};

io.on('connection', (socket) => {
  console.log('Nouveau client connecté:', socket.id);

  // Stocker les informations de l'utilisateur
  socket.on('user-info', (info: { name: string; email: string; id: string }) => {
    userInfo[socket.id] = {
      name: info.name,
      email: info.email,
      id: info.id
    };
    console.log('Informations utilisateur stockées:', info);
  });

  // Rejoindre une salle
  socket.on('join-room', (roomId: string) => {
    console.log(`Socket ${socket.id} rejoint la room:`, roomId);
    
    // Quitter toutes les autres rooms d'abord
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    
    // Rejoindre la nouvelle room
    socket.join(roomId);
    console.log(`Socket ${socket.id} a rejoint la room ${roomId}`);
  });

  // Gérer les messages du chat
  socket.on('send-message', ({ roomId, message }) => {
    console.log(`Message envoyé dans la room ${roomId}:`, message);
    // Émettre le message à tous les membres de la room (sauf l'expéditeur)
    socket.to(roomId).emit('new-message', message);
  });

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
    delete userInfo[socket.id];
  });
});

server.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`);
}); 