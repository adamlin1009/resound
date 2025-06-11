"use client";

import useSearchModal from "@/hook/useSearchModal";
import { formatISO } from "date-fns";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { useCallback, useMemo, useState } from "react";
import { Range } from "react-date-range";

import Heading from "../Heading";
import Calendar from "../inputs/Calendar";
import AddressInput from "../inputs/AddressInput";
import InstrumentAutocomplete from "../inputs/InstrumentAutocomplete";
import useUSLocations, { USLocationValue } from "@/hook/useUSLocations";
import Modal from "./Modal";

enum STEPS {
  FILTERS = 0,
}

type Props = {};

function SearchModal({}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const searchModel = useSearchModal();

  const [location, setLocation] = useState<USLocationValue>({ city: "", state: "" });
  const [step, setStep] = useState(STEPS.FILTERS);
  const [experienceLevel, setExperienceLevel] = useState(1);
  const [radius, setRadius] = useState(25); // Default 25 mile radius
  const [isNationwide, setIsNationwide] = useState(false);
  const [instrumentType, setInstrumentType] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: undefined,
    endDate: undefined,
    key: "selection",
  });

  const Map = useMemo(
    () =>
      dynamic(() => import("../Map"), {
        ssr: false,
      }),
    []
  );


  const onSubmit = useCallback(async () => {
    let currentQuery = {};

    if (params) {
      currentQuery = qs.parse(params.toString());
    }

    const updatedQuery: any = {
      ...currentQuery,
      experienceLevel,
    };

    // Add instrument type if specified
    if (instrumentType) {
      updatedQuery.instrumentType = instrumentType;
    }

    // Handle location search options
    if (isNationwide) {
      updatedQuery.nationwide = true;
      // Remove location-specific params for nationwide search
      delete updatedQuery.city;
      delete updatedQuery.state;
      delete updatedQuery.zipCode;
      delete updatedQuery.radius;
    } else if (location?.city || location?.state || location?.zipCode) {
      updatedQuery.city = location?.city;
      updatedQuery.state = location?.state;
      updatedQuery.zipCode = location?.zipCode;
      updatedQuery.radius = radius;
    }

    // Add dates if they are selected
    if (showDatePicker && dateRange.startDate && dateRange.endDate) {
      updatedQuery.startDate = formatISO(dateRange.startDate);
      updatedQuery.endDate = formatISO(dateRange.endDate);
    }

    const url = qs.stringifyUrl(
      {
        url: "/",
        query: updatedQuery,
      },
      { skipNull: true }
    );

    setStep(STEPS.FILTERS);
    searchModel.onClose();
    router.push(url);
  }, [
    searchModel,
    location,
    router,
    experienceLevel,
    dateRange,
    radius,
    isNationwide,
    instrumentType,
    showDatePicker,
    params,
  ]);

  const actionLabel = useMemo(() => {
    return "Search";
  }, []);

  const onClear = useCallback(() => {
    setLocation({ city: "", state: "" });
    setInstrumentType("");
    setExperienceLevel(1);
    setRadius(25);
    setIsNationwide(false);
    setShowDatePicker(false);
    setDateRange({
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    });
    
    // Also clear the URL parameters
    searchModel.onClose();
    router.push("/");
  }, [router, searchModel]);

  let bodyContent = (
    <div className="flex flex-col gap-6 max-h-[75vh] overflow-y-auto px-1">
      <div className="flex justify-between items-start">
        <Heading
          title="Find your perfect instrument"
          subtitle="Use filters to narrow down your search"
        />
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear all
        </button>
      </div>
      
      {/* Instrument type search */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          What instrument are you looking for?
        </label>
        <InstrumentAutocomplete
          value={instrumentType}
          onChange={setInstrumentType}
          placeholder="Select an instrument..."
        />
      </div>
      
      <hr />
      
      {/* Location Section */}
      <div>
        <h3 className="font-semibold mb-4">Location</h3>
        
        {/* Nationwide toggle */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="nationwide"
            checked={isNationwide}
            onChange={(e) => {
              setIsNationwide(e.target.checked);
              if (e.target.checked) {
                setLocation({ city: "", state: "" });
              }
            }}
            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
          />
          <label htmlFor="nationwide" className="text-sm font-medium text-gray-700">
            Search nationwide
          </label>
        </div>

        {!isNationwide && (
          <>
            <AddressInput
              value={location}
              onChange={(value) => setLocation(value)}
              placeholder="Enter city, state, or ZIP code"
            />
            
            {/* Radius selector */}
            {(location?.city || location?.zipCode) && (
              <div className="flex flex-col gap-2 mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Search radius: {radius} miles
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5 mi</span>
                  <span>50 mi</span>
                  <span>100 mi</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <hr />
      
      {/* Date Selection (Optional) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Rental dates (optional)</h3>
          <button
            type="button"
            onClick={() => {
              if (!showDatePicker) {
                // When showing the calendar, initialize with today's date if no dates are set
                if (!dateRange.startDate && !dateRange.endDate) {
                  const today = new Date();
                  setDateRange({
                    startDate: today,
                    endDate: today,
                    key: "selection",
                  });
                }
                setShowDatePicker(true);
              } else {
                // When hiding the calendar, optionally clear the dates
                setShowDatePicker(false);
              }
            }}
            className="text-sm text-amber-600 hover:underline"
          >
            {showDatePicker ? "Skip dates" : "Add dates"}
          </button>
        </div>
        
        {showDatePicker && (
          <Calendar
            onChange={(value) => setDateRange(value.selection)}
            value={dateRange}
          />
        )}
      </div>
      
      <hr />
      
      {/* Skill Level Filter */}
      <div>
        <h3 className="font-semibold mb-2">Your skill level</h3>
        <p className="text-sm text-gray-500 mb-4">Show instruments suitable for your experience</p>
        <select
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(Number(e.target.value))}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          <option value={1}>Beginner</option>
          <option value={2}>Intermediate</option>
          <option value={3}>Advanced</option>
          <option value={4}>Professional</option>
        </select>
        <p className="text-xs text-gray-500 mt-2">
          You&apos;ll see instruments that match your level or below
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={searchModel.isOpen}
      onClose={searchModel.onClose}
      onSubmit={onSubmit}
      title="Search & Filters"
      actionLabel={actionLabel}
      body={bodyContent}
    />
  );
}

export default SearchModal;
