"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "./Button";
import Heading from "./Heading";

type Props = {
  title?: string;
  subtitle?: string;
  showReset?: boolean;
  onReset?: () => void;
};

function EmptyState({
  title = "No instruments found",
  subtitle = "Try adjusting your search filters or location.",
  showReset,
  onReset,
}: Props) {
  const router = useRouter();

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="h-[60vh] flex flex-col gap-2 justify-center items-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Heading center title={title} subtitle={subtitle} />
        <div className="w-48 mt-4 mx-auto">
          {showReset && (
            <Button
              outline
              label={onReset ? "Try again" : "Remove all filters"}
              onClick={handleReset}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default EmptyState;
