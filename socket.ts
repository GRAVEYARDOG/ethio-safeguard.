import { io } from 'socket.io-client';

const URL = 'http://localhost:3000'; // Points to Nginx Load Balancer // Make sure this matches backend port

export const socket = io(URL, {
    autoConnect: false,
    transports: ['websocket'] // Force WebSocket to avoid polling sticky-session issues
});
