"use client";

import { motion } from "framer-motion";
import React from "react";

type Props = {};

function Loader({}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex h-[70vh] flex-col items-center justify-center gap-6"
    >
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 rounded-full border border-rule" />
        <span className="absolute inset-0 animate-spin rounded-full border-t border-ink" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="font-display text-[20px] tracking-tight text-ink">
          <span className="editorial-italic font-normal">Indexing</span> the
          archive
        </p>
        <p className="font-mono text-[10px] uppercase tracking-archive text-ink-muted">
          One moment, please
        </p>
      </div>
    </motion.div>
  );
}

export default Loader;
