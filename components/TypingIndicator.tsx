"use client";

import { memo } from "react";

interface TypingIndicatorProps {
  users: Array<{
    userId: string;
    userName: string | null;
  }>;
}

const TypingIndicator = memo(({ users }: TypingIndicatorProps) => {
  if (users.length === 0) return null;

  const text = users.length === 1
    ? `${users[0].userName || "Someone"} is typing...`
    : users.length === 2
    ? `${users[0].userName || "Someone"} and ${users[1].userName || "someone"} are typing...`
    : `${users[0].userName || "Someone"} and ${users.length - 1} others are typing...`;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 px-4 py-2">
      <div className="flex space-x-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span>{text}</span>
    </div>
  );
});

TypingIndicator.displayName = "TypingIndicator";

export default TypingIndicator;