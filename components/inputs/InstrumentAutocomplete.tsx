"use client";

import React from "react";
import Select, { GroupBase, StylesConfig } from "react-select";
import { FiMusic } from "react-icons/fi";
import { INSTRUMENT_OPTIONS, InstrumentOption } from "@/constants";

type Props = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
};

// Custom styles for react-select to match the design system
const customStyles: StylesConfig<InstrumentOption, false, GroupBase<InstrumentOption>> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "48px",
    borderRadius: "0.5rem",
    borderColor: state.selectProps.error ? "#ef4444" : state.isFocused ? "#d97706" : "#e5e7eb",
    borderWidth: "2px",
    boxShadow: state.isFocused ? "0 0 0 1px #d97706" : "none",
    "&:hover": {
      borderColor: state.selectProps.error ? "#ef4444" : state.isFocused ? "#d97706" : "#e5e7eb",
    },
    paddingLeft: "2.5rem",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0.75rem 0.5rem",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#9ca3af",
    fontSize: "0.875rem",
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
    fontSize: "0.875rem",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.5rem",
    marginTop: "0.25rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
    maxHeight: "300px",
  }),
  groupHeading: (provided) => ({
    ...provided,
    backgroundColor: "#f9fafb",
    color: "#374151",
    fontWeight: "600",
    padding: "0.5rem 1rem",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? "#fef3c7" 
      : state.isFocused 
      ? "#fef3c7" 
      : "white",
    color: "#111827",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#fde68a",
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#111827",
    fontSize: "0.875rem",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? "#d97706" : "#9ca3af",
    "&:hover": {
      color: "#d97706",
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "#9ca3af",
    "&:hover": {
      color: "#ef4444",
    },
  }),
};

export default function InstrumentAutocomplete({ 
  value = "", 
  onChange, 
  placeholder = "Select an instrument", 
  error = false 
}: Props) {
  // Find the current selected option
  const selectedOption = INSTRUMENT_OPTIONS.flatMap(group => group.options)
    .find(option => option.value === value) || null;

  const handleChange = (option: InstrumentOption | null) => {
    onChange(option?.value || "");
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
        <FiMusic size={18} />
      </div>
      
      <Select<InstrumentOption, false, GroupBase<InstrumentOption>>
        instanceId="instrument-select"
        value={selectedOption}
        onChange={handleChange}
        options={INSTRUMENT_OPTIONS}
        placeholder={placeholder}
        isClearable
        isSearchable
        styles={customStyles}
        // @ts-ignore - error prop for styling
        error={error}
        classNamePrefix="instrument-select"
        noOptionsMessage={() => "No instruments found"}
        formatGroupLabel={(group) => (
          <div className="flex items-center justify-between">
            <span>{group.label}</span>
            <span className="text-xs text-gray-500">
              {group.options.length} instruments
            </span>
          </div>
        )}
      />
      
      {error && (
        <p className="text-red-500 text-xs mt-1">Please select an instrument</p>
      )}
    </div>
  );
}