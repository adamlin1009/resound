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

interface SocketReservedEvents {
  connect: () => void;
  connect_error: (error: Error) => void;
  disconnect: (reason: string) => void;
}

type SocketListenEvents = ServerToClientEvents & SocketReservedEvents;
type SocketEventHandler<Events, Event extends keyof Events> =
  Events[Event] extends (...args: infer Args) => infer Result
    ? (...args: Args) => Result
    : never;

// Socket instance type
export interface TypedSocket {
  id?: string;
  auth?: Record<string, unknown> | ((callback: (data: object) => void) => void);
  connected: boolean;
  connect: () => TypedSocket;
  disconnect: () => TypedSocket;
  on: <Event extends keyof SocketListenEvents>(
    event: Event,
    listener: SocketEventHandler<SocketListenEvents, Event>
  ) => TypedSocket;
  once: <Event extends keyof SocketListenEvents>(
    event: Event,
    listener: SocketEventHandler<SocketListenEvents, Event>
  ) => TypedSocket;
  off: <Event extends keyof SocketListenEvents>(
    event: Event,
    listener?: SocketEventHandler<SocketListenEvents, Event>
  ) => TypedSocket;
  emit: <Event extends keyof ClientToServerEvents>(
    event: Event,
    ...args: Parameters<ClientToServerEvents[Event]>
  ) => TypedSocket;
}
