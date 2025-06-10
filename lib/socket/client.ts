import io from "socket.io-client";
import { TypedSocket } from "./types";

// Socket instance singleton
let socket: TypedSocket | null = null;

// Configuration
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

export const getSocket = (): TypedSocket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    }) as unknown as TypedSocket;
  }
  
  return socket;
};

export const connectSocket = (token?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const socketInstance = getSocket();
    
    if (socketInstance.connected) {
      resolve();
      return;
    }
    
    // Set auth token if provided
    if (token) {
      socketInstance.auth = { token };
    }
    
    // Set up connection handlers
    socketInstance.once("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      resolve();
    });
    
    socketInstance.once("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
      reject(error);
    });
    
    // Connect
    socketInstance.connect();
  });
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};