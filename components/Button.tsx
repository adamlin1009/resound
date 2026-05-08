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
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`relative disabled:opacity-70 disabled:cursor-not-allowed rounded-lg hover:opacity-80 transition w-full ${
        outline ? "bg-white" : "bg-neutral-950"
      } ${outline ? "border-neutral-300" : "border-neutral-950"} ${
        outline ? "text-neutral-900" : "text-white"
      } ${small ? "text-sm" : "text-md"} ${small ? "py-1" : "py-3"} ${
        small ? "font-light" : "font-semibold"
      } ${small ? "border-[1px]" : "border-2"}`}
    >
      {Icon && (
        <Icon
          size={small ? 16 : 24}
          className={`absolute left-4 ${small ? "top-1/2 -translate-y-1/2" : "top-3"} ${isColor && "text-emerald-600"}`}
        />
      )}
      {label}
    </button>
  );
}

export default Button;
