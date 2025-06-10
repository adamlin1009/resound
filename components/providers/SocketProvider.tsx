"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { getSocket, connectSocket, disconnectSocket, isSocketConnected } from "@/lib/socket/client";
import { TypedSocket, ServerToClientEvents } from "@/lib/socket/types";
import { toast } from "react-toastify";

interface SocketContextType {
  socket: TypedSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnect: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  reconnect: async () => {},
});

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
  currentUserId?: string; // Pass user ID from server component
}

export default function SocketProvider({ children, currentUserId }: SocketProviderProps) {
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<TypedSocket | null>(null);

  const setupSocketListeners = useCallback((socketInstance: TypedSocket) => {
    // Connection events
    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    socketInstance.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
      
      // Only show error for abnormal disconnections
      if (reason === "io server disconnect") {
        setError("Server disconnected");
        toast.error("Connection to server lost");
      }
    });

    socketInstance.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err);
      setIsConnecting(false);
      setError(err.message);
    });

    // Custom error event
    socketInstance.on("error", (errorMessage: string) => {
      console.error("Socket error:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    });

    // Cleanup function
    return () => {
      socketInstance.off("connect");
      socketInstance.off("disconnect");
      socketInstance.off("connect_error");
      socketInstance.off("error");
    };
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    try {
      setIsConnecting(true);
      setError(null);

      const socketInstance = getSocket();
      
      // Set up listeners before connecting
      const cleanup = setupSocketListeners(socketInstance);

      // Connect with user ID if available
      await connectSocket(currentUserId || session?.user?.email || undefined);
      
      setSocket(socketInstance);
      
      // Store cleanup function for later
      return cleanup;
    } catch (err) {
      setIsConnecting(false);
      setError(err instanceof Error ? err.message : "Failed to connect");
      console.error("Failed to connect socket:", err);
    }
  }, [session, isConnecting, isConnected, setupSocketListeners, currentUserId]);

  const reconnect = useCallback(async () => {
    disconnectSocket();
    setIsConnected(false);
    setSocket(null);
    await connect();
  }, [connect]);

  // Connect when session is available
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (status === "authenticated" && session?.user) {
      connect().then((cleanupFn) => {
        cleanup = cleanupFn;
      });
    }

    return () => {
      if (cleanup) cleanup();
      if (status === "unauthenticated") {
        disconnectSocket();
        setIsConnected(false);
        setSocket(null);
      }
    };
  }, [status, session, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    isConnecting,
    error,
    reconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}