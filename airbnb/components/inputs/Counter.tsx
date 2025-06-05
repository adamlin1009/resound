"use client";

import React, { useCallback, useState, useEffect } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

type Props = {
  title: string;
  subtitle: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

function Counter({ title, subtitle, value, onChange, min = 1, max }: Props) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [hasError, setHasError] = useState(false);

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value.toString());
    setHasError(false);
  }, [value]);

  const onAdd = useCallback(() => {
    if (max && value >= max) {
      return;
    }
    onChange(value + 1);
    setHasError(false);
  }, [onChange, value, max]);

  const onReduce = useCallback(() => {
    if (value <= min) {
      return;
    }
    onChange(value - 1);
    setHasError(false);
  }, [value, onChange, min]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Parse and validate the number
    const numValue = parseInt(newValue);
    if (newValue === '') {
      setHasError(true);
    } else if (isNaN(numValue)) {
      setHasError(true);
    } else if (numValue < min || (max && numValue > max)) {
      setHasError(true);
    } else {
      setHasError(false);
      onChange(numValue);
    }
  }, [onChange, min, max]);

  const handleInputBlur = useCallback(() => {
    // Reset to current valid value if input is invalid
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < min || (max && numValue > max)) {
      setInputValue(value.toString());
      setHasError(false);
    }
  }, [inputValue, value, min, max]);

  const getErrorMessage = () => {
    if (!hasError) return null;
    
    if (max) {
      return `Must be between ${min} and ${max}`;
    }
    return `Must be at least ${min}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <div className="font-medium">{title}</div>
          <div className="font-light text-gray-600">{subtitle}</div>
        </div>
        <div className="flex flex-row items-center gap-4">
          <div
            onClick={onReduce}
            className=" w-10 h-10 rounded-full border-[1px] border-neutral-400 flex items-center justify-center text-neutral-600 cursor-pointer hover:opacity-80 transition"
          >
            <AiOutlineMinus />
          </div>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={min}
            max={max}
            className={`w-16 text-center font-light text-xl rounded-md focus:outline-none transition-colors ${
              hasError 
                ? 'border-2 border-red-500 text-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                : 'border border-gray-200 text-neutral-600 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
            }`}
          />
          <div
            onClick={onAdd}
            className="w-10 h-10 rounded-full border-[1px] border-neutral-400 flex items-center justify-center text-neutral-600 cursor-pointer hover:opacity-80 transition"
          >
            <AiOutlinePlus />
          </div>
        </div>
      </div>
      {hasError && (
        <div className="text-sm text-red-600 text-right">
          {getErrorMessage()}
        </div>
      )}
    </div>
  );
}

export default Counter;
