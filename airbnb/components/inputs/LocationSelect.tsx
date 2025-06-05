"use client";

import useUSLocations, { USLocationValue } from "@/hook/useUSLocations";
import Select from "react-select";
import { useState } from "react";

type Props = {
  value?: USLocationValue;
  onChange: (value: USLocationValue) => void;
};

function LocationSelect({ value, onChange }: Props) {
  const { getStates } = useUSLocations();
  const [city, setCity] = useState(value?.city || "");
  const [state, setState] = useState(value?.state || "");
  const [zipCode, setZipCode] = useState(value?.zipCode || "");

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    if (newCity && state) {
      onChange({ city: newCity, state, zipCode });
    }
  };

  const handleStateChange = (selectedState: any) => {
    const newState = selectedState?.value || "";
    setState(newState);
    if (city && newState) {
      onChange({ city, state: newState, zipCode });
    }
  };

  const handleZipChange = (newZip: string) => {
    setZipCode(newZip);
    if (city && state) {
      onChange({ city, state, zipCode: newZip });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City *
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
          placeholder="Enter city name"
          className="w-full p-3 border-2 rounded-md text-lg focus:outline-none focus:border-black"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State *
        </label>
        <Select
          placeholder="Select state"
          isClearable
          options={getStates()}
          value={getStates().find(s => s.value === state) || null}
          onChange={handleStateChange}
          classNames={{
            control: () => "p-3 border-2",
            input: () => "text-lg",
            option: () => "text-lg",
          }}
          theme={(theme: any) => ({
            ...theme,
            borderRadius: 6,
            colors: {
              ...theme.colors,
              primary: "black",
              primary25: "#fef3c7",
            },
          })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ZIP Code (Optional)
        </label>
        <input
          type="text"
          value={zipCode}
          onChange={(e) => handleZipChange(e.target.value)}
          placeholder="Enter ZIP code"
          className="w-full p-3 border-2 rounded-md text-lg focus:outline-none focus:border-black"
          pattern="[0-9]{5}(-[0-9]{4})?"
          maxLength={10}
        />
      </div>
    </div>
  );
}

export default LocationSelect;