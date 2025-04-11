import { Server } from 'socket.io';
import Message from './models/Message.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN, // Your frontend URL
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    // Join a case room
    socket.on('joinCase', (caseToken) => {
      socket.join(caseToken);
      console.log(`User joined case room: ${caseToken}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};