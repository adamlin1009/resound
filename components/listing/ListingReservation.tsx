"use client";

import React, { useState } from "react";
import { Range } from "react-date-range";
import { format } from "date-fns";
import Calendar from "../inputs/Calendar";
import Button from "../Button";

type Props = {
  price: number;
  dateRange: Range;
  totalPrice: number;
  onChangeDate: (value: Range) => void;
  onSubmit: () => void;
  disabled?: boolean;
  disabledDates: Date[];
  pickupStartTime?: string;
  pickupEndTime?: string;
  returnStartTime?: string;
  returnEndTime?: string;
  availableDays?: string[];
  onTimeChange?: (pickupTime: string, returnTime: string) => void;
};

function ListingReservation({
  price,
  dateRange,
  totalPrice,
  onChangeDate,
  onSubmit,
  disabled,
  disabledDates,
  pickupStartTime = "09:00",
  pickupEndTime = "17:00",
  returnStartTime = "09:00",
  returnEndTime = "17:00",
  availableDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  onTimeChange,
}: Props) {
  const [selectedPickupTime, setSelectedPickupTime] = useState("");
  const [selectedReturnTime, setSelectedReturnTime] = useState("");

  // Generate time options based on owner's availability
  const generateTimeOptions = (startTime: string, endTime: string) => {
    const options = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    const current = new Date(start);
    while (current <= end) {
      options.push(format(current, 'HH:mm'));
      current.setMinutes(current.getMinutes() + 30);
    }
    
    return options;
  };

  const pickupTimeOptions = generateTimeOptions(pickupStartTime, pickupEndTime);
  const returnTimeOptions = generateTimeOptions(returnStartTime, returnEndTime);

  const handlePickupTimeChange = (time: string) => {
    setSelectedPickupTime(time);
    if (onTimeChange && selectedReturnTime) {
      onTimeChange(time, selectedReturnTime);
    }
  };

  const handleReturnTimeChange = (time: string) => {
    setSelectedReturnTime(time);
    if (onTimeChange && selectedPickupTime) {
      onTimeChange(selectedPickupTime, time);
    }
  };
  return (
    <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden">
      <div className="flex flex-row items-center gap-1 p-4">
        <p className="flex gap-1 text-2xl font-semibold">
          $ {price} <span className="font-light text-neutral-600">per day</span>
        </p>
      </div>
      <hr />
      <Calendar
        value={dateRange}
        disabledDates={disabledDates}
        onChange={(value) => onChangeDate(value.selection)}
      />
      <hr />
      
      {/* Time Selection Section */}
      {dateRange.startDate && dateRange.endDate && (
        <>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Pickup Time on {format(dateRange.startDate, 'MMM dd')}
              </label>
              <select
                value={selectedPickupTime}
                onChange={(e) => handlePickupTimeChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Select pickup time</option>
                {pickupTimeOptions.map((time) => (
                  <option key={time} value={time}>
                    {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Return Time on {format(dateRange.endDate, 'MMM dd')}
              </label>
              <select
                value={selectedReturnTime}
                onChange={(e) => handleReturnTimeChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Select return time</option>
                {returnTimeOptions.map((time) => (
                  <option key={time} value={time}>
                    {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <hr />
        </>
      )}
      
      <div className="p-4">
        <Button 
          disabled={disabled || !selectedPickupTime || !selectedReturnTime} 
          label="Proceed to Payment" 
          onClick={onSubmit} 
        />
      </div>
      <hr />
      <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg">
        <p>Total</p>
        <p> $ {totalPrice}</p>
      </div>
    </div>
  );
}

export default ListingReservation;
