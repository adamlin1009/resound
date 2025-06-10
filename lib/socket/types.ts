// Socket.io type definitions for the messaging system

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface TypingUser {
  userId: string;
  userName: string | null;
  conversationId: string;
}

// Events sent from server to client
export interface ServerToClientEvents {
  // Message events
  newMessage: (message: Message) => void;
  messageUpdated: (message: Message) => void;
  messageDeleted: (messageId: string) => void;
  
  // Typing events
  userTyping: (data: TypingUser) => void;
  userStoppedTyping: (data: { userId: string; conversationId: string }) => void;
  
  // Read receipt events
  messageRead: (data: { messageId: string; userId: string; readAt: string }) => void;
  
  // User status events
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  
  // Connection events
  connected: () => void;
  disconnected: (reason: string) => void;
  error: (error: string) => void;
}

// Events sent from client to server
export interface ClientToServerEvents {
  // Room management
  joinConversation: (conversationId: string, callback?: (success: boolean) => void) => void;
  leaveConversation: (conversationId: string) => void;
  
  // Message events
  sendMessage: (data: { 
    conversationId: string; 
    content: string; 
    tempId?: string;
  }, callback?: (message: Message) => void) => void;
  
  // Broadcasting messages to other users
  broadcastMessage: (data: {
    conversationId: string;
    message: Message;
  }) => void;
  
  // Typing events
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  
  // Read receipt events
  markAsRead: (data: { 
    conversationId: string; 
    messageId: string;
  }) => void;
  
  // Authentication
  authenticate: (token: string, callback?: (success: boolean) => void) => void;
}

// Socket data interface
export interface SocketData {
  userId: string;
  userName: string | null;
  userImage: string | null;
  conversationIds: string[];
}

// Socket instance type
import { Socket } from "socket.io-client/build/esm/socket.js";
export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;