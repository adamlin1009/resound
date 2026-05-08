"use client";

import { useRouter } from "next/navigation";
import React from "react";

type Props = {};

function Logo({}: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      aria-label="Resound — return home"
      className="group flex items-baseline gap-3 text-left"
    >
      <span className="font-display text-[28px] leading-none font-medium tracking-[-0.02em] text-ink md:text-[32px]">
        R<span className="editorial-italic text-lacquer">é</span>sound
      </span>
      <span className="hidden flex-col leading-tight md:flex">
        <span className="archive-label">Vol. III</span>
        <span className="archive-label opacity-70">Spring Archive</span>
      </span>
    </button>
  );
}

export default Logo;
