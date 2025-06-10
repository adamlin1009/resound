"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { SafeUser } from "@/types";
import useMessages from "@/hook/useMessages";
import useSocket from "@/hook/useSocket";
import Container from "@/components/Container";
import Heading from "@/components/Heading";
import EmptyState from "@/components/EmptyState";
import Avatar from "@/components/Avatar";
import TypingIndicator from "@/components/TypingIndicator";

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
    refreshCurrentConversation,
    getUnreadCount,
    initializeSocket,
    setCurrentUser
  } = useMessages();
  
  const { 
    isConnected,
    startTyping,
    stopTyping,
    getTypingUsers
  } = useSocket({ conversationId: currentConversation?.id });
  
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let mounted = true;
    
    const loadConversations = async () => {
      if (mounted) {
        setCurrentUser(currentUser.id); // Set current user in store
        await fetchConversations();
        initializeSocket(currentUser.id); // Initialize socket with current user ID
      }
    };
    
    loadConversations();
    
    return () => {
      mounted = false;
    };
  }, [fetchConversations, initializeSocket, currentUser.id, setCurrentUser]); // Run only on mount
  
  // Auto-select the current conversation if it exists
  useEffect(() => {
    if (currentConversation?.id && conversations.length > 0) {
      const exists = conversations.find(c => c.id === currentConversation.id);
      if (!exists) {
        // If current conversation doesn't exist in list, clear it
        selectConversation('');
      }
    }
  }, [conversations, currentConversation?.id, selectConversation]);

  // Remove polling - Socket.io handles real-time updates now
  useEffect(() => {
    if (!currentConversation?.id) return;

    // Refresh once when conversation changes (to get latest messages)
    refreshCurrentConversation();
  }, [currentConversation?.id, refreshCurrentConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation || isSending) return;
    
    // Stop typing indicator when sending
    handleStopTyping();
    
    setIsSending(true);
    try {
      await sendMessage(currentConversation.id, newMessage.trim());
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  // Handle typing indicator
  const handleStopTyping = useCallback(() => {
    if (!currentConversation || !isTyping) return;
    
    setIsTyping(false);
    stopTyping(currentConversation.id);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [currentConversation, isTyping, stopTyping]);

  const handleTyping = useCallback(() => {
    if (!currentConversation || !isConnected) return;
    
    // Start typing if not already typing
    if (!isTyping) {
      setIsTyping(true);
      startTyping(currentConversation.id);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  }, [currentConversation, isConnected, isTyping, startTyping, handleStopTyping]);

  // Helper function to determine if a message starts a new group
  const isNewMessageGroup = (currentMsg: any, previousMsg: any) => {
    if (!previousMsg) return true;
    if (currentMsg.senderId !== previousMsg.senderId) return true;
    
    const currentTime = new Date(currentMsg.createdAt).getTime();
    const previousTime = new Date(previousMsg.createdAt).getTime();
    const timeDiff = currentTime - previousTime;
    
    return timeDiff > 5 * 60 * 1000; // 5 minutes
  };

  // Helper function to format timestamp
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      // This week - show day name
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      // Older - show date
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: diffDays > 365 ? 'numeric' : undefined
      });
    }
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
        <div className="flex items-center justify-between">
          <Heading title="Messages" subtitle="Your conversations" />
          {isConnected && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full" />
              <span>Connected</span>
            </div>
          )}
        </div>
        
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
                  const unreadCount = getUnreadCount(conversation.id, currentUser.id);
                  
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
                        <div className="flex items-center justify-between">
                          <div className={`${unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>
                            {otherUser.name || 'User'}
                          </div>
                          <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                {unreadCount}
                              </span>
                            )}
                            {lastMessage && (
                              <div className="text-xs text-gray-500">
                                {formatMessageTime(lastMessage.createdAt)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">{conversation.listing.title}</div>
                        {lastMessage && (
                          <div className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
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
                
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
                  {currentConversation.messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="mb-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Start a conversation about {currentConversation.listing.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Send a message to connect with the instrument owner
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <button
                              onClick={() => setNewMessage("Is this instrument still available?")}
                              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              Is this still available?
                            </button>
                            <button
                              onClick={() => setNewMessage("What condition is the instrument in?")}
                              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              What condition is it in?
                            </button>
                            <button
                              onClick={() => setNewMessage("Can I see more photos?")}
                              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              Can I see more photos?
                            </button>
                            <button
                              onClick={() => setNewMessage("What's included with the rental?")}
                              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              What&apos;s included?
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    currentConversation.messages.map((message, index) => {
                      // Fix user identification - use message.senderId vs currentUser.id
                      const isCurrentUser = message.senderId === currentUser.id;
                      
                      // Get the message user - use message.sender first, then fallback to conversation participants
                      let messageUser;
                      if (message.sender && message.sender.id) {
                        messageUser = message.sender;
                      } else if (isCurrentUser) {
                        messageUser = {
                          id: currentUser.id,
                          name: currentUser.name,
                          image: currentUser.image
                        };
                      } else {
                        const otherUser = currentConversation.ownerId === currentUser.id 
                          ? currentConversation.renter 
                          : currentConversation.owner;
                        messageUser = {
                          id: currentConversation.ownerId === currentUser.id 
                            ? currentConversation.renterId 
                            : currentConversation.ownerId,
                          name: otherUser.name,
                          image: otherUser.image
                        };
                      }
                      
                      const previousMessage = index > 0 ? currentConversation.messages[index - 1] : null;
                      const nextMessage = index < currentConversation.messages.length - 1 
                        ? currentConversation.messages[index + 1] : null;
                      
                      const startsNewGroup = isNewMessageGroup(message, previousMessage);
                      const isLastInGroup = !nextMessage || isNewMessageGroup(nextMessage, message);
                      
                      // Show timestamp for last message in group or if next message is > 5 mins away
                      const showTimestamp = isLastInGroup || !nextMessage || 
                        (new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() > 5 * 60 * 1000);
                      
                      return (
                        <div
                          key={message.id}
                          className={`${startsNewGroup ? 'mt-4' : 'mt-0.5'}`}
                        >
                          <div
                            className={`flex items-start ${
                              isCurrentUser ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {/* Avatar - only show for other users, positioned correctly */}
                            {!isCurrentUser && (
                              <div className="flex-shrink-0 w-10 mr-2">
                                {startsNewGroup ? (
                                  <Avatar 
                                    src={messageUser?.image || null} 
                                    userName={messageUser?.name || 'User'}
                                    size={40}
                                  />
                                ) : (
                                  <div className="w-10" /> /* Spacer for alignment */
                                )}
                              </div>
                            )}
                            
                            {/* Message bubble */}
                            <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-xs`}>
                              <div
                                className={`px-4 py-2 ${
                                  isCurrentUser
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100'
                                } ${
                                  startsNewGroup && isLastInGroup
                                    ? 'rounded-2xl'
                                    : startsNewGroup
                                    ? isCurrentUser 
                                      ? 'rounded-t-2xl rounded-bl-2xl rounded-br-md'
                                      : 'rounded-t-2xl rounded-br-2xl rounded-bl-md'
                                    : isLastInGroup
                                    ? isCurrentUser
                                      ? 'rounded-b-2xl rounded-tl-2xl rounded-tr-md'
                                      : 'rounded-b-2xl rounded-tr-2xl rounded-tl-md'
                                    : isCurrentUser
                                      ? 'rounded-l-2xl rounded-r-md'
                                      : 'rounded-r-2xl rounded-l-md'
                                }`}
                              >
                                {message.content}
                              </div>
                              
                              {/* Timestamp - only show for last message in group */}
                              {showTimestamp && (
                                <div className="text-xs text-gray-500 mt-1 px-1">
                                  {formatMessageTime(message.createdAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {/* Typing indicator */}
                  {currentConversation && (
                    <TypingIndicator 
                      users={getTypingUsers(currentConversation.id, currentUser.id)} 
                    />
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        if (e.target.value.trim()) {
                          handleTyping();
                        } else {
                          handleStopTyping();
                        }
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      onBlur={handleStopTyping}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 flex items-center"
                    >
                      {isSending ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Send'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="mb-4">
                      <svg 
                        className="mx-auto h-12 w-12 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No conversation selected
                    </h3>
                    <p className="text-sm text-gray-500">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default MessagesClient;