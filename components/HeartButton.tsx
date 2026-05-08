"use client";

import useFavorite from "@/hook/useFavorite";
import { SafeUser } from "@/types";
import React from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

type Props = {
  listingId: string;
  currentUser?: SafeUser | null;
};

function HeartButton({ listingId, currentUser }: Props) {
  const { hasFavorite, toggleFavorite } = useFavorite({
    listingId,
    currentUser,
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggleFavorite}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleFavorite(e as any);
        }
      }}
      aria-label={hasFavorite ? "Remove from archive" : "Save to archive"}
      className="group relative grid h-9 w-9 place-items-center border border-paper/40 bg-paper-ivory/85 backdrop-blur transition hover:border-ink hover:bg-paper-ivory cursor-pointer"
    >
      <AiOutlineHeart
        size={18}
        className="absolute text-ink/40 transition group-hover:text-ink"
      />
      <AiFillHeart
        size={14}
        className={`relative transition ${
          hasFavorite ? "text-lacquer" : "text-transparent"
        }`}
      />
    </div>
  );
}

export default HeartButton;
