"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { GiMusicalNotes } from "react-icons/gi";

type Props = {};

function Logo({}: Props) {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push("/")}
      className="hidden md:flex items-center gap-2 cursor-pointer"
    >
      <GiMusicalNotes className="text-rose-500" size={32} />
      <span className="font-bold text-xl">
        <span className="text-rose-500">Instru</span>
        <span className="text-black">Rent</span>
      </span>
    </div>
  );
}

export default Logo;
