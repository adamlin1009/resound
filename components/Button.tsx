"use client";

import React from "react";
import { IconType } from "react-icons";

type Props = {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: IconType;
  isColor?: boolean;
};

function Button({
  label,
  onClick,
  disabled,
  outline,
  small,
  icon: Icon,
  isColor,
}: Props) {
  const base =
    "relative w-full inline-flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed font-mono uppercase tracking-archive";
  const tone = outline
    ? "bg-transparent border border-ink/40 text-ink hover:border-ink hover:bg-ink hover:text-paper"
    : "bg-ink border border-ink text-paper hover:bg-paper hover:text-ink";
  const size = small
    ? "py-2 text-[10px]"
    : "py-3.5 text-[11px]";

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${tone} ${size}`}
    >
      {Icon && (
        <Icon
          size={small ? 14 : 18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${
            isColor ? "text-lacquer" : ""
          }`}
        />
      )}
      <span>{label}</span>
    </button>
  );
}

export default Button;
