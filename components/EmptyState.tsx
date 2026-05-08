"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "./Button";

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
    if (onReset) onReset();
    else router.push("/");
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg text-center"
      >
        <p className="archive-label">No record found</p>
        <h2 className="mt-4 font-display text-[40px] leading-[0.98] tracking-[-0.01em] text-ink md:text-[52px]">
          The catalogue is{" "}
          <span className="editorial-italic font-normal text-lacquer">
            quiet
          </span>{" "}
          here.
        </h2>
        <p className="mt-5 font-display text-[15px] leading-relaxed text-ink-muted">
          {subtitle || title}
        </p>
        {showReset && (
          <div className="mx-auto mt-8 w-56">
            <Button
              outline
              label={onReset ? "Try again" : "Clear all filters"}
              onClick={handleReset}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default EmptyState;
