"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import SocketProvider from "./SocketProvider";
import { SafeUser } from "@/types";

interface ProvidersProps {
  children: ReactNode;
  currentUser?: SafeUser | null;
}

export default function Providers({ children, currentUser }: ProvidersProps) {
  return (
    <SessionProvider>
      <SocketProvider currentUserId={currentUser?.id}>
        {children}
      </SocketProvider>
    </SessionProvider>
  );
}