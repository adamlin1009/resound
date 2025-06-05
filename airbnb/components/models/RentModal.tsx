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
import Counter from "../inputs/Counter";
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
      conditionRating: 1,
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
  const conditionRating = watch("conditionRating");
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
          subtitle="What features does it have?"
        />
        <Counter
          title="Condition"
          subtitle="Rate the condition (1-10, 10 being perfect)"
          value={conditionRating}
          onChange={(value) => setCustomValue("conditionRating", value)}
          min={1}
          max={10}
        />
        <hr />
        <Counter
          title="Experience Level"
          subtitle="Suitable for what skill level? (1=Beginner, 5=Professional)"
          value={experienceLevel}
          onChange={(value) => setCustomValue("experienceLevel", value)}
          min={1}
          max={5}
        />
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
