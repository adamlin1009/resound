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
  startConversation: (listingId: string) => Promise<string>;
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
      set({ conversations });
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
      set({
        conversations: conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, message] }
            : conv
        )
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  },

  startConversation: async (listingId: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      
      const conversation = await response.json();
      set({ currentConversation: conversation });
      
      const { conversations } = get();
      set({ conversations: [conversation, ...conversations] });
      
      return conversation.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  },
}));

export default useMessages;