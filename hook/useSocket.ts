import { useEffect, useCallback, useState } from "react";
import { useSocketContext } from "@/components/providers/SocketProvider";
import { TypingUser } from "@/lib/socket/types";

interface UseSocketOptions {
  conversationId?: string;
}

export default function useSocket(options?: UseSocketOptions) {
  const { socket, isConnected } = useSocketContext();
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Join/leave conversation room
  useEffect(() => {
    if (!socket || !isConnected || !options?.conversationId) return;

    // Join conversation room
    socket.emit("joinConversation", options.conversationId, (success: boolean) => {
      if (success) {
        console.log(`Joined conversation: ${options.conversationId}`);
      }
    });

    // Leave room on cleanup
    return () => {
      if (options?.conversationId) {
        socket.emit("leaveConversation", options.conversationId);
      }
    };
  }, [socket, isConnected, options?.conversationId]);

  // Handle typing events
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data: TypingUser) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.userId, data);
        return newMap;
      });

      // Auto-remove after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      }, 3000);
    };

    const handleUserStoppedTyping = (data: { userId: string; conversationId: string }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    };

    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [socket]);

  // Handle online/offline status
  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = (userId: string) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    };

    const handleUserOffline = (userId: string) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [socket]);

  // Emit typing events
  const startTyping = useCallback((conversationId: string) => {
    if (!socket || !isConnected) return;
    socket.emit("startTyping", conversationId);
  }, [socket, isConnected]);

  const stopTyping = useCallback((conversationId: string) => {
    if (!socket || !isConnected) return;
    socket.emit("stopTyping", conversationId);
  }, [socket, isConnected]);

  // Send message via socket - not used anymore, kept for compatibility
  const sendMessage = useCallback((conversationId: string, content: string, tempId?: string) => {
    return new Promise<void>((resolve, reject) => {
      // Always reject to force HTTP API usage in useMessages
      reject(new Error("Use HTTP API for message sending"));
    });
  }, []);

  // Mark message as read
  const markAsRead = useCallback((conversationId: string, messageId: string) => {
    if (!socket || !isConnected) return;
    socket.emit("markAsRead", { conversationId, messageId });
  }, [socket, isConnected]);

  // Check if user is online
  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  // Get typing users for a conversation
  const getTypingUsers = useCallback((conversationId: string, currentUserId: string) => {
    return Array.from(typingUsers.values()).filter(
      (user) => user.conversationId === conversationId && user.userId !== currentUserId
    );
  }, [typingUsers]);

  return {
    socket,
    isConnected,
    typingUsers: Array.from(typingUsers.values()),
    onlineUsers: Array.from(onlineUsers),
    startTyping,
    stopTyping,
    sendMessage,
    markAsRead,
    isUserOnline,
    getTypingUsers,
  };
}