"use client";

import useRentModal from "@/hook/useRentModal";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Heading from "../Heading";
import CategoryInput from "../inputs/CategoryInput";
import AddressInput from "../inputs/AddressInput";
import ExactAddressInput from "../inputs/ExactAddressInput";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs/Input";
import { categories } from "../navbar/Categories";
import Modal from "./Modal";

type Props = {};

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  PRICE = 5,
}

function RentModal({}: Props) {
  const router = useRouter();
  const rentModel = useRentModal();
  const [step, setStep] = useState(STEPS.CATEGORY);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      category: "",
      city: "",
      state: "",
      zipCode: "",
      exactAddress: "",
      experienceLevel: 1,
      imageSrc: "",
      price: 1,
      title: "",
      description: "",
    },
  });

  const category = watch("category");
  const city = watch("city");
  const state = watch("state");
  const zipCode = watch("zipCode");
  const exactAddress = watch("exactAddress");
  const experienceLevel = watch("experienceLevel");
  const imageSrc = watch("imageSrc");

  const Map = useMemo(
    () =>
      dynamic(() => import("../Map"), {
        ssr: false,
      }),
    []
  );

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.PRICE) {
      return onNext();
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
        console.error('Listing creation error:', error);
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
            // Auto-parse address to extract city, state, zip
            const addressParts = value.split(',').map(part => part.trim());
            if (addressParts.length >= 3) {
              const cityPart = addressParts[addressParts.length - 3];
              const statePart = addressParts[addressParts.length - 2];
              const zipMatch = value.match(/\b(\d{5})\b/);
              
              if (cityPart) setCustomValue("city", cityPart);
              if (statePart) {
                // Extract state abbreviation
                const stateMatch = statePart.match(/([A-Z]{2})/);
                if (stateMatch) setCustomValue("state", stateMatch[1]);
              }
              if (zipMatch) setCustomValue("zipCode", zipMatch[1]);
            }
          }}
          placeholder="123 Main Street, Apt 4B, Irvine, CA 92602"
        />
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
        />
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
          register={register}
          errors={errors}
          required
        />
        <hr />
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
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
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  return (
    <Modal
      disabled={isLoading}
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
