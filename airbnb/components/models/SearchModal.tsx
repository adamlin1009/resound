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
import Counter from "../inputs/Counter";
import AddressInput from "../inputs/AddressInput";
import useUSLocations, { USLocationValue } from "@/hook/useUSLocations";
import Modal from "./Modal";

enum STEPS {
  LOCATION = 0,
  DATE = 1,
}

type Props = {};

function SearchModal({}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const searchModel = useSearchModal();

  const [location, setLocation] = useState<USLocationValue>({ city: "", state: "" });
  const [step, setStep] = useState(STEPS.LOCATION);
  const [conditionRating, setConditionRating] = useState(1);
  const [experienceLevel, setExperienceLevel] = useState(1);
  const [radius, setRadius] = useState(25); // Default 25 mile radius
  const [isNationwide, setIsNationwide] = useState(false);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const Map = useMemo(
    () =>
      dynamic(() => import("../Map"), {
        ssr: false,
      }),
    []
  );

  const onBack = useCallback(() => {
    setStep((value) => value - 1);
  }, []);

  const onNext = useCallback(() => {
    setStep((value) => value + 1);
  }, []);

  const onSubmit = useCallback(async () => {
    let currentQuery = {};

    if (params) {
      currentQuery = qs.parse(params.toString());
    }

    const updatedQuery: any = {
      ...currentQuery,
      conditionRating,
      experienceLevel,
    };

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

    // Only add dates if we're on the date step and dates are selected
    if (step === STEPS.DATE) {
      if (dateRange.startDate) {
        updatedQuery.startDate = formatISO(dateRange.startDate);
      }
      if (dateRange.endDate) {
        updatedQuery.endDate = formatISO(dateRange.endDate);
      }
    }

    // If we're on location step and have location or nationwide, can search directly
    if (step === STEPS.LOCATION && (location?.city || location?.state || isNationwide)) {
      const url = qs.stringifyUrl(
        {
          url: "/",
          query: updatedQuery,
        },
        { skipNull: true }
      );

      setStep(STEPS.LOCATION);
      searchModel.onClose();
      router.push(url);
      return;
    }

    // If we're on location step but no location, go to next step
    if (step === STEPS.LOCATION) {
      return onNext();
    }

    // If we're on date step, search
    if (step === STEPS.DATE) {
      const url = qs.stringifyUrl(
        {
          url: "/",
          query: updatedQuery,
        },
        { skipNull: true }
      );

      setStep(STEPS.LOCATION);
      searchModel.onClose();
      router.push(url);
    }
  }, [
    step,
    searchModel,
    location,
    router,
    conditionRating,
    experienceLevel,
    dateRange,
    radius,
    isNationwide,
    onNext,
    params,
  ]);

  const actionLabel = useMemo(() => {
    if (step === STEPS.DATE) {
      return "Search";
    }

    // If we have location or nationwide on first step, show Search button
    if (step === STEPS.LOCATION && (location?.city || location?.state || isNationwide)) {
      return "Search";
    }

    return "Next";
  }, [step, location, isNationwide]);

  const secondaryAction = useMemo(() => {
    if (step === STEPS.LOCATION && (location?.city || location?.state || isNationwide)) {
      return onNext; // "Add dates" action
    }
    
    if (step === STEPS.LOCATION) {
      return undefined;
    }

    return onBack; // "Back" action
  }, [step, location, isNationwide, onNext, onBack]);

  const secondActionLabel = useMemo(() => {
    if (step === STEPS.LOCATION && (location?.city || location?.state || isNationwide)) {
      return "Add dates";
    }
    
    if (step === STEPS.LOCATION) {
      return undefined;
    }

    return "Back";
  }, [step, location, isNationwide]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Where do you want to find instruments?"
        subtitle="Find the perfect location!"
      />
      
      {/* Nationwide toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="nationwide"
          checked={isNationwide}
          onChange={(e) => {
            setIsNationwide(e.target.checked);
            if (e.target.checked) {
              setLocation({ city: "", state: "" }); // Clear location if nationwide
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
            placeholder="Search by city, zip code, or address"
          />
          
          {/* Radius selector */}
          {(location?.city || location?.zipCode) && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Search radius: {radius} miles
              </label>
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5 miles</span>
                <span>100 miles</span>
                <span>500 miles</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (step === STEPS.DATE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="When do you need the instrument?"
          subtitle="Select your rental period!"
        />
        <Calendar
          onChange={(value) => setDateRange(value.selection)}
          value={dateRange}
        />
        <hr />
        <div className="flex flex-col gap-4">
          <Counter
            onChange={(value) => setConditionRating(value)}
            value={conditionRating}
            title="Condition"
            subtitle="Minimum condition rating (1-10)?"
            min={1}
            max={10}
          />
          <Counter
            onChange={(value) => {
              setExperienceLevel(value);
            }}
            value={experienceLevel}
            title="Experience Level"
            subtitle="What skill level? (1=Beginner, 5=Pro)"
            min={1}
            max={5}
          />
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={searchModel.isOpen}
      onClose={searchModel.onClose}
      onSubmit={onSubmit}
      secondaryAction={secondaryAction}
      secondaryActionLabel={secondActionLabel}
      title="Filters"
      actionLabel={actionLabel}
      body={bodyContent}
    />
  );
}

export default SearchModal;
