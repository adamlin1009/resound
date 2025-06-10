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
    if (nationwide === "true") {
      return "Nationwide";
    }
    
    if (city && state) {
      const location = formatLocationShort({ city, state });
      return radius ? `${location} (${radius}mi)` : location;
    }
    if (city) {
      return radius ? `${city} (${radius}mi)` : city;
    }
    if (state) {
      return state;
    }

    return "Location";
  }, [formatLocationShort, city, state, nationwide, radius]);

  const durationLabel = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      let diff = differenceInDays(end, start) + 1; // Make it inclusive

      if (diff === 1) {
        return "1 Day";
      }
      
      if (diff >= 30) {
        const months = Math.floor(diff / 30);
        if (months === 1) {
          return "1 Month";
        }
        return `${months} Months`;
      }

      return `${diff} Days`;
    }

    return "Dates";
  }, [startDate, endDate]);

  const instrumentLabel = useMemo(() => {
    const instrumentType = params?.get("instrumentType");
    const category = params?.get("category");
    
    if (instrumentType) {
      return instrumentType;
    }
    if (category) {
      return category;
    }
    return "Instrument";
  }, [params]);

  return (
    <div
      onClick={searchModel.onOpen}
      className="border-[1px] w-full md:w-auto py-2 rounded-full shadow-sm hover:shadow-md transition cursor-pointer min-w-fit"
    >
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-semibold px-6">{instrumentLabel}</div>
        <div className="hidden sm:block text-sm font-semibold px-6 border-l-[1px] border-gray-200 flex-1 text-center">
          {locationLabel}
        </div>
        <div className="hidden md:block text-sm font-semibold px-6 border-l-[1px] border-gray-200 flex-1 text-center whitespace-nowrap">
          {durationLabel}
        </div>
        <div className="text-sm pl-6 pr-2 text-gray-600 flex items-center gap-3 border-l-[1px] border-gray-200">
          <div className="hidden sm:block">Search</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              searchModel.onOpen();
            }}
            className="p-2 bg-amber-700 rounded-full text-white hover:bg-amber-800 transition"
          >
            <BiSearch size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Search;
