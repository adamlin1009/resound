"use client";

import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  center?: boolean;
};

function Heading({ title, subtitle, center }: Props) {
  return (
    <div className={center ? "text-center" : "text-start"}>
      <h2 className="font-display text-[28px] leading-tight tracking-[-0.01em] text-ink md:text-[32px]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 font-display text-[14px] text-ink-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default Heading;
