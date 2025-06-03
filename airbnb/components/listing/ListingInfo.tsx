"use client";

import useCountries from "@/hook/useCountries";
import { SafeUser } from "@/types";
import dynamic from "next/dynamic";
import React from "react";
import { IconType } from "react-icons";
import Avatar from "../Avatar";
import ListingCategory from "./ListingCategory";
import Sleep from "../Sleep";
import Offers from "../Offers";

const Map = dynamic(() => import("../Map").then(mod => mod.default), {
  ssr: false,
});

type Props = {
  user: SafeUser;
  description: string;
  conditionRating: number;
  experienceLevel: number;
  category:
    | {
        icon: IconType;
        label: string;
        description: string;
      }
    | undefined;
  locationValue: string;
};

function ListingInfo({
  user,
  description,
  conditionRating,
  experienceLevel,
  category,
  locationValue,
}: Props) {
  const { getByValue } = useCountries();
  const coordinates = getByValue(locationValue)?.latlng;

  return (
    <div className="col-span-4 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className=" text-xl font-semibold flex flex-row items-center gap-2">
          <div>Lent by {user?.name}</div>
          <Avatar src={user?.image} userName={user?.name} />
        </div>
        <div className="flex flex-row items-center gap-4 font-light text-neutral-500">
          <p>Condition: {conditionRating}/10</p>
          <p>Level: {experienceLevel === 1 ? 'Beginner' : experienceLevel === 2 ? 'Intermediate' : experienceLevel === 3 ? 'Advanced' : experienceLevel === 4 ? 'Expert' : 'Professional'}</p>
        </div>
      </div>
      <hr />
      {category && (
        <ListingCategory
          icon={category.icon}
          label={category?.label}
          description={category?.description}
        />
      )}
      <hr />
      <div className="flex flex-col">
        <p className="text-4xl font-serif font-bold text-amber-700">
          resound<span className="text-amber-900">protect</span>
        </p>
        <p className="text-neutral-500 pt-3">
          Every rental includes protection from lender cancellations,
          listing inaccuracies, and instrument damage coverage.
        </p>
        <p className="text-amber-900 font-bold underline pt-3 cursor-pointer">
          Learn more
        </p>
      </div>
      <hr />
      <p className="text-lg font-light text-neutral-500">{description}</p>
      <hr />
      <p className="text-xl font-semibold">{`Pickup location`}</p>
      <Map center={coordinates} locationValue={locationValue} />
    </div>
  );
}

export default ListingInfo;
