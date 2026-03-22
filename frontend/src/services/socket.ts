import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';
let socket: Socket;

export const connectSocket = (room: string): Socket => {
  socket = io(SOCKET_URL);
  socket.on('connect', () => {
    socket.emit('join_room', room);
  });
  return socket;
};

export const getSocket = (): Socket => socket;

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};
