"use client";

import useUSLocations from "@/hook/useUSLocations";
import useSearchModal from "@/hook/useSearchModal";
import { differenceInDays } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BiSearch } from "react-icons/bi";

type Props = {};

function Search({}: Props) {
  const searchModel = useSearchModal();
  const params = useSearchParams();
  const { formatLocationShort } = useUSLocations();

  const city = params?.get("city");
  const state = params?.get("state");
  const startDate = params?.get("startDate");
  const endDate = params?.get("endDate");
  const nationwide = params?.get("nationwide");
  const radius = params?.get("radius");

  const locationLabel = useMemo(() => {
    if (nationwide === "true") return "Nationwide";
    if (city && state) {
      const location = formatLocationShort({ city, state });
      return radius ? `${location} · ${radius}mi` : location;
    }
    if (city) return radius ? `${city} · ${radius}mi` : city;
    if (state) return state;
    return "Anywhere";
  }, [formatLocationShort, city, state, nationwide, radius]);

  const durationLabel = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      let diff = differenceInDays(end, start) + 1;
      if (diff === 1) return "1 Day";
      if (diff >= 30) {
        const months = Math.floor(diff / 30);
        return months === 1 ? "1 Month" : `${months} Months`;
      }
      return `${diff} Days`;
    }
    return "Any dates";
  }, [startDate, endDate]);

  const instrumentLabel = useMemo(() => {
    const instrumentType = params?.get("instrumentType");
    const category = params?.get("category");
    if (instrumentType) return instrumentType;
    if (category) return category;
    return "All instruments";
  }, [params]);

  const Field = ({
    label,
    value,
    className = "",
  }: {
    label: string;
    value: string;
    className?: string;
  }) => (
    <div className={`flex flex-col px-5 py-2 text-left ${className}`}>
      <span className="archive-label leading-none">{label}</span>
      <span className="mt-1 truncate font-display text-[15px] leading-tight text-ink">
        {value}
      </span>
    </div>
  );

  return (
    <button
      onClick={searchModel.onOpen}
      className="group relative flex h-12 items-stretch overflow-hidden border border-ink/20 bg-paper-ivory text-ink transition hover:border-ink/60"
    >
      <Field label="Instrument" value={instrumentLabel} className="min-w-[140px]" />
      <span className="my-2 hidden w-px bg-rule sm:block" />
      <Field label="Location" value={locationLabel} className="hidden sm:flex min-w-[150px]" />
      <span className="my-2 hidden w-px bg-rule md:block" />
      <Field label="Window" value={durationLabel} className="hidden md:flex min-w-[120px]" />
      <span
        aria-hidden
        className="flex items-center justify-center bg-ink px-4 text-paper transition group-hover:bg-lacquer"
      >
        <BiSearch size={18} />
      </span>
    </button>
  );
}

export default Search;
