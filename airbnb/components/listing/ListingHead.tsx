"use client";

import useUSLocations from "@/hook/useUSLocations";
import { SafeUser } from "@/types";
import { motion } from "framer-motion";
import Image from "next/image";
import Heading from "../Heading";
import HeartButton from "../HeartButton";

type Props = {
  title: string;
  city: string | null;
  state: string;
  zipCode: string | null;
  imageSrc: string;
  id: string;
  currentUser?: SafeUser | null;
};

function ListingHead({
  title,
  city,
  state,
  zipCode,
  imageSrc,
  id,
  currentUser,
}: Props) {
  const { formatLocation } = useUSLocations();
  const locationDisplay = formatLocation({ city: city || undefined, state, zipCode: zipCode || undefined });

  const MotionDiv = motion.div as any;

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
        className="w-full h-[60vh] overflow-hidden rounded-xl relative"
      >
        {imageSrc && (
          <Image
            src={imageSrc}
            alt="image"
            fill
            className="object-cover w-full"
          />
        )}
        <div className="absolute top-5 right-5">
          <HeartButton listingId={id} currentUser={currentUser} />
        </div>
      </MotionDiv>
    </>
  );
}

export default ListingHead;
