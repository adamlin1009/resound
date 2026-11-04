"use client";

import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import React, { useCallback } from "react";
import { IconType } from "react-icons";

type Props = {
  icon: IconType;
  label: string;
  selected?: boolean;
};

function CategoryBox({ icon: Icon, label, selected }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const handleClick = useCallback(() => {
    let currentQuery = {};
    if (params) currentQuery = qs.parse(params.toString());

    const updatedQuery: any = { ...currentQuery, category: label };
    if (params?.get("category") === label) delete updatedQuery.category;

    const url = qs.stringifyUrl(
      { url: "/", query: updatedQuery },
      { skipNull: true },
    );

    router.push(url);
  }, [label, params, router]);

  return (
    <button
      onClick={handleClick}
      className={`group flex shrink-0 items-center gap-2 border-b py-1 transition ${
        selected
          ? "border-ink text-ink"
          : "border-transparent text-ink-muted hover:text-ink"
      }`}
    >
      <Icon size={16} className="opacity-70 group-hover:opacity-100" />
      <span
        className={`font-mono text-[11px] uppercase tracking-archive transition ${
          selected ? "text-ink" : ""
        }`}
      >
        {label}
      </span>
      {selected && (
        <span className="editorial-italic text-[14px] leading-none text-lacquer">
          ✦
        </span>
      )}
    </button>
  );
}

export default CategoryBox;
