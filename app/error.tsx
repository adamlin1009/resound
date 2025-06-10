"use client";

import EmptyState from "@/components/EmptyState";
import { useEffect } from "react";

type Props = {
  error: Error;
};

function ErrorState({ error }: Props) {
  useEffect(() => {
  }, [error]);

  return <EmptyState title="Uh Oh" subtitle="Something went wrong!" />;
}

export default ErrorState;
