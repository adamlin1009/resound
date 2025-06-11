"use client";

import EmptyState from "@/components/EmptyState";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

function ErrorState({ error, reset }: Props) {
  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error);
    }
  }, [error]);

  return (
    <EmptyState
      title="Uh Oh"
      subtitle="Something went wrong!"
      showReset
      onReset={reset}
    />
  );
}

export default ErrorState;
