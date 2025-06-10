"use client";

import { useEffect, useState, useRef } from "react";
import { SafeUser } from "@/types";
import useMessages from "@/hook/useMessages";
import Container from "@/components/Container";
import Heading from "@/components/Heading";
import EmptyState from "@/components/EmptyState";
import Avatar from "@/components/Avatar";

interface MessagesClientProps {
  currentUser: SafeUser;
}

const MessagesClient: React.FC<MessagesClientProps> = ({ currentUser }) => {
  const { 
    conversations, 
    currentConversation, 
    isLoading,
    fetchConversations,
    selectConversation,
    sendMessage,
    refreshCurrentConversation
  } = useMessages();
  
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let mounted = true;
    
    const loadConversations = async () => {
      if (mounted) {
        await fetchConversations();
      }
    };
    
    loadConversations();
    
    return () => {
      mounted = false;
    };
  }, [fetchConversations]); // Add fetchConversations to dependencies

  // Poll for new messages when a conversation is selected
  useEffect(() => {
    if (!currentConversation?.id) return;

    // Refresh immediately when conversation changes
    refreshCurrentConversation();

    // Set up polling interval (every 5 seconds)
    const interval = setInterval(() => {
      refreshCurrentConversation();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [currentConversation?.id, refreshCurrentConversation]); // Add refreshCurrentConversation to dependencies

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;
    await sendMessage(currentConversation.id, newMessage.trim());
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <Container>
        <div className="pt-24">
          <Heading title="Messages" subtitle="Loading..." />
        </div>
      </Container>
    );
  }

  if (conversations.length === 0) {
    return (
      <Container>
        <div className="pt-24">
          <Heading title="Messages" subtitle="No conversations yet" />
          <EmptyState
            title="No messages"
            subtitle="Start messaging instrument owners"
            showReset={false}
          />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="pt-24">
        <Heading title="Messages" subtitle="Your conversations" />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Conversations</h3>
            </div>
            <div className="overflow-y-auto h-full">
              {conversations
                .filter((conv, index, self) => 
                  index === self.findIndex(c => c.id === conv.id)
                )
                .map((conversation) => {
                  const otherUser = conversation.ownerId === currentUser.id 
                    ? conversation.renter 
                    : conversation.owner;
                  const lastMessage = conversation.messages[conversation.messages.length - 1];
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        currentConversation?.id === conversation.id ? 'bg-blue-50' : ''
                      }`}
                    >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Avatar 
                          src={otherUser.image} 
                          userName={otherUser.name}
                          size={40}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{otherUser.name || 'User'}</div>
                        <div className="text-sm text-gray-600">{conversation.listing.title}</div>
                        {lastMessage && (
                          <div className="text-sm text-gray-500 truncate">
                            {lastMessage.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message Thread */}
          <div className="border rounded-lg overflow-hidden">
            {currentConversation ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Avatar 
                        src={(currentConversation.ownerId === currentUser.id 
                          ? currentConversation.renter 
                          : currentConversation.owner).image} 
                        userName={(currentConversation.ownerId === currentUser.id 
                          ? currentConversation.renter 
                          : currentConversation.owner).name}
                        size={40}
                      />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {(currentConversation.ownerId === currentUser.id 
                          ? currentConversation.renter 
                          : currentConversation.owner).name || 'User'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {currentConversation.listing.title}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentConversation.messages.map((message) => {
                    const isCurrentUser = message.senderId === currentUser.id;
                    const messageUser = isCurrentUser 
                      ? currentUser 
                      : (currentConversation.ownerId === currentUser.id 
                          ? currentConversation.renter 
                          : currentConversation.owner);
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex items-end space-x-2 ${
                          isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <Avatar 
                            src={messageUser.image} 
                            userName={messageUser.name}
                            size={40}
                          />
                        </div>
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            isCurrentUser
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default MessagesClient;