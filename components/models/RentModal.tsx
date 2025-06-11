"use client";

import useRentModal from "@/hook/useRentModal";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useCallback } from "react";
import { FieldPath, PathValue, SubmitHandler, useForm, UseFormRegister, FieldValues } from "react-hook-form";
import { toast } from "react-toastify";

import Heading from "../Heading";
import CategoryInput from "../inputs/CategoryInput";
import AddressInput from "../inputs/AddressInput";
import ExactAddressInput from "../inputs/ExactAddressInput";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs/Input";
import InstrumentAutocomplete from "../inputs/InstrumentAutocomplete";
import { categories } from "../navbar/Categories";
import { INSTRUMENT_CATEGORIES } from "@/constants";
import Modal from "./Modal";

interface ListingFormValues {
  category: string;
  instrumentType: string;
  city: string;
  state: string;
  zipCode: string;
  exactAddress: string;
  experienceLevel: number;
  imageSrc: string[];
  price: number;
  title: string;
  description: string;
  pickupStartTime: string;
  pickupEndTime: string;
  returnStartTime: string;
  returnEndTime: string;
  availableDays: string[];
}

enum STEPS {
  CATEGORY = 0,
  INSTRUMENT = 1,
  LOCATION = 2,
  INFO = 3,
  IMAGES = 4,
  DESCRIPTION = 5,
  AVAILABILITY = 6,
  PRICE = 7,
}

function RentModal() {
  const router = useRouter();
  const rentModel = useRentModal();
  const [step, setStep] = useState(STEPS.CATEGORY);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ListingFormValues>({
    defaultValues: {
      category: "",
      instrumentType: "",
      city: "",
      state: "",
      zipCode: "",
      exactAddress: "",
      experienceLevel: 1,
      imageSrc: [],
      price: 1,
      title: "",
      description: "",
      pickupStartTime: "09:00",
      pickupEndTime: "17:00",
      returnStartTime: "09:00",
      returnEndTime: "17:00",
      availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    },
  });

  const category = watch("category");
  const instrumentType = watch("instrumentType");
  const city = watch("city");
  const state = watch("state");
  const zipCode = watch("zipCode");
  const exactAddress = watch("exactAddress");
  const experienceLevel = watch("experienceLevel");
  const imageSrc = watch("imageSrc");
  const pickupStartTime = watch("pickupStartTime");
  const pickupEndTime = watch("pickupEndTime");
  const returnStartTime = watch("returnStartTime");
  const returnEndTime = watch("returnEndTime");
  const availableDays = watch("availableDays");

  // Reset address validation when modal opens
  useEffect(() => {
    if (rentModel.isOpen) {
      setIsAddressValid(false);
    }
  }, [rentModel.isOpen]);

  const Map = useMemo(
    () =>
      dynamic(() => import("../Map"), {
        ssr: false,
      }),
    []
  );

  const setCustomValue = useCallback((id: keyof ListingFormValues, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [setValue]);

  const onBack = useCallback(() => {
    setStep((value) => value - 1);
  }, []);

  const onNext = useCallback(() => {
    // Validate current step before proceeding
    if (step === STEPS.CATEGORY && !category) {
      toast.error("Please select a category");
      return;
    }
    
    if (step === STEPS.INSTRUMENT && !instrumentType) {
      toast.error("Please select an instrument");
      return;
    }
    
    if (step === STEPS.LOCATION && (!isAddressValid || !exactAddress || !city || !state)) {
      toast.error("Please select a valid address from the dropdown");
      return;
    }
    
    if (step === STEPS.DESCRIPTION && (!watch("title") || !watch("description"))) {
      toast.error("Please enter both title and description");
      return;
    }
    
    setStep((value) => value + 1);
  }, [step, category, instrumentType, isAddressValid, exactAddress, city, state, watch]);

  const onSubmit: SubmitHandler<ListingFormValues> = (data) => {
    if (step !== STEPS.PRICE) {
      return onNext();
    }

    // Validate required fields before submission
    if (!data.title || !data.description || !data.category || !data.exactAddress) {
      toast.error("Please fill in all required fields");
      return;
    }

    // If city or state are missing, try to parse them from exactAddress
    if (!data.city || !data.state) {
      const addressParts = data.exactAddress.split(',').map((part: string) => part.trim());
      if (addressParts.length >= 3) {
        // Typically: street, city, state zip
        const cityPart = addressParts[addressParts.length - 2];
        const stateZipPart = addressParts[addressParts.length - 1];
        
        if (!data.city && cityPart) {
          data.city = cityPart;
        }
        
        if (!data.state && stateZipPart) {
          // Extract state abbreviation
          const stateMatch = stateZipPart.match(/([A-Z]{2})/);
          if (stateMatch) {
            data.state = stateMatch[1];
          }
        }
        
        // Extract zip code if not already set
        if (!data.zipCode) {
          const zipMatch = data.exactAddress.match(/\b(\d{5})\b/);
          if (zipMatch) {
            data.zipCode = zipMatch[1];
          }
        }
      }
    }

    setIsLoading(true);

    axios
      .post("/api/listings", data)
      .then(() => {
        toast.success("Instrument Listed!");
        router.refresh();
        reset();
        setStep(STEPS.CATEGORY);
        rentModel.onClose();
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.error || "Something went wrong";
        toast.error(errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return "Create";
    }

    return "Next";
  }, [step]);

  const secondActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }

    return "Back";
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Which type of instrument are you lending?"
        subtitle="Pick a category"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-600">
        {categories.map((item, index) => (
          <div key={index} className="col-span-1">
            <CategoryInput
              onClick={(category) => setCustomValue("category", category)}
              selected={category === item.label}
              label={item.label}
              icon={item.icon}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (step === STEPS.INSTRUMENT) {
    // Get instruments for the selected category
    const categoryInstruments = INSTRUMENT_CATEGORIES[category as keyof typeof INSTRUMENT_CATEGORIES] || [];
    
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title={`Which ${category.toLowerCase()} instrument are you lending?`}
          subtitle="Select the specific instrument type"
        />
        <InstrumentAutocomplete
          value={instrumentType}
          onChange={(value) => setCustomValue("instrumentType", value)}
          placeholder="Search for an instrument..."
          error={false}
        />
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Available {category} instruments:</p>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {categoryInstruments.map((instrument) => (
              <div 
                key={instrument}
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  instrumentType === instrument 
                    ? 'border-amber-600 bg-amber-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCustomValue("instrumentType", instrument)}
              >
                <span className="text-xs">{instrument}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Where is your instrument located?"
          subtitle="Enter your full address - we'll only show the general area publicly"
        />
        <ExactAddressInput
          value={exactAddress}
          onChange={(value) => {
            setCustomValue("exactAddress", value);
          }}
          onValidSelection={(isValid, locationData) => {
            setIsAddressValid(isValid);
            if (isValid && locationData) {
              // Use the validated location data from Google Places
              if (locationData.city) setCustomValue("city", locationData.city);
              if (locationData.state) setCustomValue("state", locationData.state);
              if (locationData.zipCode) setCustomValue("zipCode", locationData.zipCode);
            } else {
              // Clear location fields when invalid
              setCustomValue("city", "");
              setCustomValue("state", "");
              setCustomValue("zipCode", "");
            }
          }}
          placeholder="Start typing your address..."
        />
        {/* Show warning only if address is typed but not selected */}
        {exactAddress && !isAddressValid && (
          <div className="text-sm p-3 rounded-md bg-yellow-50 text-yellow-800">
            <p className="font-medium">⚠️ Please select an address from the dropdown</p>
          </div>
        )}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 mt-0.5">🔒</div>
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Privacy Protection</p>
              <p>We only show your general area (city and zip code) to potential renters. Your exact address is kept private and only shared with confirmed bookings for pickup coordination.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Share some details about your instrument"
          subtitle="Set the minimum skill level required"
        />
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Minimum required skill level
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Only users at this level or higher can rent
          </p>
          <select
            value={experienceLevel}
            onChange={(e) => setCustomValue("experienceLevel", Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value={1}>Beginner</option>
            <option value={2}>Intermediate</option>
            <option value={3}>Advanced</option>
            <option value={4}>Professional</option>
          </select>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Example:</strong> If you set {experienceLevel === 1 ? 'Beginner' : experienceLevel === 2 ? 'Intermediate' : experienceLevel === 3 ? 'Advanced' : 'Professional'}, only users at that level or higher can rent.
          </p>
        </div>
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add photos of your instrument"
          subtitle="Show musicians what your instrument looks like!"
        />
        <ImageUpload
          onChange={(value) => setCustomValue("imageSrc", value)}
          value={imageSrc}
          maxImages={10}
        />
        
        {/* QR Code Upload Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-xl mt-0.5">📱</div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                Want to upload photos from your phone?
              </h4>
              <p className="text-sm text-blue-800 mb-2">
                After creating your listing, you&apos;ll be able to generate a QR code that lets you easily upload photos directly from your phone&apos;s camera.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <span className="bg-blue-100 px-2 py-1 rounded">🔗 Scan QR Code</span>
                <span>→</span>
                <span className="bg-blue-100 px-2 py-1 rounded">📸 Take Photos</span>
                <span>→</span>
                <span className="bg-blue-100 px-2 py-1 rounded">✅ Auto Upload</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Upload Status */}
        {imageSrc.length > 0 && (
          <div className="text-sm text-gray-600 text-center">
            {imageSrc.length} of 10 images uploaded
          </div>
        )}
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Describe your instrument"
          subtitle="What makes it special?"
        />
        <Input
          id="title"
          label="Title"
          disabled={isLoading}
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors}
          required
        />
        <hr />
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors}
          required
        />
      </div>
    );
  }

  if (step === STEPS.AVAILABILITY) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Set your availability"
          subtitle="When can renters pick up and return your instrument?"
        />
        
        {/* Pickup Times */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Pickup Times</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Earliest Pickup
              </label>
              <input
                type="time"
                value={pickupStartTime}
                onChange={(e) => setCustomValue("pickupStartTime", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Latest Pickup
              </label>
              <input
                type="time"
                value={pickupEndTime}
                onChange={(e) => setCustomValue("pickupEndTime", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Return Times */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Return Times</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Earliest Return
              </label>
              <input
                type="time"
                value={returnStartTime}
                onChange={(e) => setCustomValue("returnStartTime", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Latest Return
              </label>
              <input
                type="time"
                value={returnEndTime}
                onChange={(e) => setCustomValue("returnEndTime", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Available Days */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Available Days</h3>
          <div className="grid grid-cols-2 gap-2">
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <label key={day} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={availableDays.includes(day)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCustomValue("availableDays", [...availableDays, day]);
                    } else {
                      setCustomValue("availableDays", availableDays.filter((d: string) => d !== day));
                    }
                  }}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm capitalize">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Renters will only be able to book pickup and return during these times on your available days.
          </p>
        </div>
      </div>
    );
  }

  if (step == STEPS.PRICE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Now, set your rental price"
          subtitle="How much do you charge per day?"
        />
        <Input
          id="price"
          label="Price"
          formatPrice
          type="number"
          disabled={isLoading}
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors}
          required
        />
      </div>
    );
  }

  // Determine if Next button should be disabled
  const isNextDisabled = useMemo(() => {
    if (step === STEPS.LOCATION) {
      return !isAddressValid || !exactAddress || !city || !state;
    }
    if (step === STEPS.INSTRUMENT) {
      return !instrumentType;
    }
    return false;
  }, [step, isAddressValid, exactAddress, city, state, instrumentType]);

  return (
    <Modal
      disabled={isLoading || isNextDisabled}
      isOpen={rentModel.isOpen}
      title="Lend your instrument!"
      actionLabel={actionLabel}
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      onClose={rentModel.onClose}
      body={bodyContent}
    />
  );
}

export default RentModal;
