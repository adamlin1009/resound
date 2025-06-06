import { create } from 'zustand';

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
  
  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  startConversation: (listingId: string, ownerId?: string, renterId?: string) => Promise<string>;
  refreshCurrentConversation: () => Promise<void>;
  reset: () => void;
}

const useMessages = create<MessagesStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/conversations');
      const conversations = await response.json();
      
      // Ensure we don't have duplicates (just in case)
      const uniqueConversations = conversations.filter((conv: Conversation, index: number, self: Conversation[]) =>
        index === self.findIndex((c) => c.id === conv.id)
      );
      
      set({ conversations: uniqueConversations });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  selectConversation: async (conversationId: string) => {
    const { conversations } = get();
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      set({ currentConversation: conversation });
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
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
    } catch (error) {
      console.error('Error sending message:', error);
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
      console.error('Error starting conversation:', error);
      throw error;
    }
  },
  
  refreshCurrentConversation: async () => {
    const { currentConversation, conversations } = get();
    if (!currentConversation) return;

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
      console.error('Error refreshing messages:', error);
    }
  },

  reset: () => {
    set({ conversations: [], currentConversation: null, isLoading: false });
  },
}));

export default useMessages;