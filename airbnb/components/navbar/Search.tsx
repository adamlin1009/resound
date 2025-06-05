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

  const locationLabel = useMemo(() => {
    if (city && state) {
      return formatLocationShort({ city, state });
    }
    if (city) {
      return city;
    }
    if (state) {
      return state;
    }

    return "Anywhere";
  }, [formatLocationShort, city, state]);

  const durationLabel = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      let diff = differenceInDays(end, start);

      if (diff === 0) {
        diff = 1;
      }

      return `${diff} Days`;
    }

    return "Any Week";
  }, [startDate, endDate]);

  return (
    <div
      onClick={searchModel.onOpen}
      className="border-[1px] w-full md:w-auto py-2 rounded-full shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-semibold px-6">{locationLabel}</div>
        <div className="hidden sm:block text-sm font-semibold px-6 border-x-[1px] border-gray-200 flex-1 text-center">
          {durationLabel}
        </div>
        <div className="text-sm pl-6 pr-2 text-gray-600 flex items-center gap-3">
          <div className="hidden sm:block">Add Filters</div>
          <div className="p-2 bg-amber-700 rounded-full text-white">
            <BiSearch size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
