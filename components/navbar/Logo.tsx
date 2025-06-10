"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { GiHarp } from "react-icons/gi";

type Props = {};

function Logo({}: Props) {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push("/")}
      className="hidden md:flex items-center gap-2 cursor-pointer"
    >
      <GiHarp className="text-amber-700" size={32} />
      <span className="font-serif font-bold text-2xl text-amber-900">
        Resound
      </span>
    </div>
  );
}

export default Logo;
