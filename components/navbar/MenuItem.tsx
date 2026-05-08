"use client";

import React from "react";

type Props = {
  onClick: () => void;
  label: string;
};

function MenuItem({ onClick, label }: Props) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-paper-warm"
    >
      <span className="font-display text-[15px] text-ink">{label}</span>
      <span
        aria-hidden
        className="font-mono text-[10px] uppercase tracking-archive text-ink-faint opacity-0 transition group-hover:opacity-100"
      >
        →
      </span>
    </button>
  );
}

export default MenuItem;
