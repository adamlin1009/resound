import { create } from 'zustand';
import { getSocket } from '@/lib/socket/client';
import { Message as SocketMessage } from '@/lib/socket/types';

interface Message {
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

interface Conversation {
  id: string;
  listingId: string;
  ownerId: string;
  renterId: string;
  listing: {
    title: string;
    imageSrc: string;
  };
  owner: {
    name: string | null;
    image: string | null;
  };
  renter: {
    name: string | null;
    image: string | null;
  };
  messages: Message[];
}

interface MessagesStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  lastReadTimestamps: Record<string, string>; // conversationId -> timestamp
  socketInitialized: boolean;
  currentUserId: string | null; // Track current user ID
  
  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  startConversation: (listingId: string, ownerId?: string, renterId?: string) => Promise<string>;
  refreshCurrentConversation: () => Promise<void>;
  getUnreadCount: (conversationId: string, userId: string) => number;
  markAsRead: (conversationId: string) => void;
  initializeSocket: (currentUserId: string) => void;
  handleNewMessage: (message: Message) => void;
  setCurrentUser: (userId: string) => void;
  reset: () => void;
}

// Helper to get/set timestamps from localStorage
const STORAGE_KEY = 'resound_message_read_timestamps';

const getStoredTimestamps = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveTimestamps = (timestamps: Record<string, string>) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps));
};

const useMessages = create<MessagesStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,
  lastReadTimestamps: getStoredTimestamps(),
  socketInitialized: false,
  currentUserId: null,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      
      // Check if the response is an error
      if (!response.ok || data.error) {
        // Error handled internally
        set({ conversations: [] });
        return;
      }
      
      // The API returns an object with conversations array
      const conversations = data.conversations || data;
      
      // Ensure data is an array
      const conversationsArray = Array.isArray(conversations) ? conversations : [];
      
      // Ensure we don't have duplicates (just in case)
      const uniqueConversations = conversationsArray.filter((conv: Conversation, index: number, self: Conversation[]) =>
        index === self.findIndex((c) => c.id === conv.id)
      );
      
      set({ conversations: uniqueConversations });
    } catch (error) {
      // Error handled internally
      set({ conversations: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  selectConversation: async (conversationId: string) => {
    const { conversations, markAsRead } = get();
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      set({ currentConversation: conversation });
      // Mark as read when selecting
      markAsRead(conversationId);
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    try {
      // Always use HTTP API to ensure message persistence
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const message = await response.json();
      const { currentConversation, conversations } = get();
      
      // Update current conversation
      if (currentConversation?.id === conversationId) {
        set({
          currentConversation: {
            ...currentConversation,
            messages: [...currentConversation.messages, message]
          }
        });
      }
      
      // Update conversations list
      const updatedConversations = conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      );
      set({ conversations: updatedConversations });
      
      // Broadcast via Socket.io to other users
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('broadcastMessage', { conversationId, message });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error; // Re-throw to let UI handle the error
    }
  },

  startConversation: async (listingId: string, ownerId?: string, renterId?: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, ownerId, renterId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start conversation');
      }
      
      const conversation = await response.json();
      set({ currentConversation: conversation });
      
      const { conversations } = get();
      // Check if conversation already exists to avoid duplicates
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        // Update existing conversation
        const updatedConversations = [...conversations];
        updatedConversations[existingIndex] = conversation;
        set({ conversations: updatedConversations });
      } else {
        // Add new conversation to the beginning
        set({ conversations: [conversation, ...conversations] });
      }
      
      return conversation.id;
    } catch (error) {
      // Error handled internally
      throw error;
    }
  },
  
  refreshCurrentConversation: async () => {
    const { currentConversation, conversations, isLoading } = get();
    if (!currentConversation || isLoading) return;

    try {
      // Fetch the latest messages for the current conversation
      const response = await fetch(`/api/conversations/${currentConversation.id}/messages`);
      if (!response.ok) return;

      const messages = await response.json();
      
      // Update current conversation with new messages
      const updatedConversation = {
        ...currentConversation,
        messages
      };
      
      set({ currentConversation: updatedConversation });
      
      // Also update in conversations list
      const updatedConversations = conversations.map(conv =>
        conv.id === currentConversation.id
          ? updatedConversation
          : conv
      );
      set({ conversations: updatedConversations });
    } catch (error) {
      // Error handled internally
    }
  },

  getUnreadCount: (conversationId: string, userId: string) => {
    const { conversations, lastReadTimestamps } = get();
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return 0;
    
    const lastReadTime = lastReadTimestamps[conversationId];
    if (!lastReadTime) return conversation.messages.length;
    
    // Count messages from other users that are newer than last read
    return conversation.messages.filter(msg => 
      msg.senderId !== userId && 
      new Date(msg.createdAt) > new Date(lastReadTime)
    ).length;
  },
  
  markAsRead: (conversationId: string) => {
    const { conversations, lastReadTimestamps } = get();
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation || conversation.messages.length === 0) return;
    
    // Get the latest message timestamp
    const latestMessage = conversation.messages[conversation.messages.length - 1];
    const newTimestamps = {
      ...lastReadTimestamps,
      [conversationId]: latestMessage.createdAt
    };
    
    set({ lastReadTimestamps: newTimestamps });
    saveTimestamps(newTimestamps);
  },

  initializeSocket: (currentUserId: string) => {
    const { socketInitialized } = get();
    if (socketInitialized) return;
    
    // Set current user ID
    set({ currentUserId });
    
    const socket = getSocket();
    
    // Listen for new messages
    socket.on('newMessage', (message: SocketMessage) => {
      const { handleNewMessage } = get();
      handleNewMessage(message);
    });
    
    set({ socketInitialized: true });
  },
  
  handleNewMessage: (message: Message) => {
    const { conversations, currentConversation, currentUserId } = get();
    
    // Check if message already exists to prevent duplicates
    const messageExistsInCurrent = currentConversation?.messages.some(m => m.id === message.id);
    const messageExistsInList = conversations.some(conv => 
      conv.messages.some(m => m.id === message.id)
    );
    
    if (messageExistsInCurrent || messageExistsInList) {
      return; // Skip duplicate messages
    }
    
    // Update current conversation if the message belongs to it
    if (currentConversation?.id === message.conversationId) {
      set({
        currentConversation: {
          ...currentConversation,
          messages: [...currentConversation.messages, message]
        }
      });
    }
    
    // Update conversations list
    const updatedConversations = conversations.map(conv => {
      if (conv.id === message.conversationId) {
        return { ...conv, messages: [...conv.messages, message] };
      }
      return conv;
    });
    
    set({ conversations: updatedConversations });
  },

  setCurrentUser: (userId: string) => {
    set({ currentUserId: userId });
  },

  reset: () => {
    set({ conversations: [], currentConversation: null, isLoading: false, socketInitialized: false, currentUserId: null });
    
    // Remove socket listeners
    const socket = getSocket();
    socket.off('newMessage');
  },
}));

export default useMessages;