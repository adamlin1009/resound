"use client";

import useUSLocations from "@/hook/useUSLocations";
import { SafeUser } from "@/types";
import { motion } from "framer-motion";
import Image from "next/image";
import Heading from "../Heading";
import HeartButton from "../HeartButton";
import ImageCarousel from "../ui/ImageCarousel";

type Props = {
  title: string;
  city: string | null;
  state: string;
  zipCode: string | null;
  imageSrc: string | string[];
  id: string;
  currentUser?: SafeUser | null;
  onImageClick?: (index: number) => void;
};

function ListingHead({
  title,
  city,
  state,
  zipCode,
  imageSrc,
  id,
  currentUser,
  onImageClick,
}: Props) {
  const { formatLocation } = useUSLocations();
  
  // Handle incorrectly stored address data
  let correctedCity = city;
  let correctedState = state;
  
  // If state looks like a city name (not a 2-letter code), assume data is swapped
  if (state && state.length > 2 && !state.includes(',')) {
    correctedCity = state; // Use state as city
    correctedState = 'CA'; // Default to CA
  }
  
  const locationDisplay = formatLocation({ city: correctedCity || undefined, state: correctedState, zipCode: zipCode || undefined });

  const MotionDiv = motion.div as any;

  // Convert imageSrc to array for consistency
  const imageArray = Array.isArray(imageSrc) ? imageSrc : imageSrc ? [imageSrc] : [];

  return (
    <>
      <Heading
        title={title}
        subtitle={locationDisplay}
      />
      <MotionDiv
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.5,
          ease: [0, 0.71, 0.2, 1.01],
        }}
        className="relative"
      >
        <ImageCarousel 
          images={imageArray}
          title={title}
          onImageClick={onImageClick}
        />
        <div className="absolute top-5 right-5 z-[5]">
          <HeartButton listingId={id} currentUser={currentUser} />
        </div>
      </MotionDiv>
    </>
  );
}

export default ListingHead;
