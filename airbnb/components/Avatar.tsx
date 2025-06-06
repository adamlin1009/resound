"use client";

import Image from "next/image";
import React from "react";

type Props = {
  src: string | null | undefined;
  userName?: string | null | undefined;
  size?: number;
};

function Avatar({ src, userName, size = 30 }: Props) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {src ? (
        <Image
          className="rounded-full object-cover"
          fill
          alt="hasImag"
          src={src}
          sizes={`${size}px`}
        />
      ) : userName ? (
        <Image
          className="rounded-full object-cover"
          fill
          alt="nameImage"
          src={`https://ui-avatars.com/api/?name=${userName}&size=${size}`}
          sizes={`${size}px`}
        />
      ) : (
        <Image
          className="rounded-full object-cover"
          fill
          alt="noUser"
          src="/assets/avatar.png"
          sizes={`${size}px`}
        />
      )}
    </div>
  );
}

export default Avatar;
