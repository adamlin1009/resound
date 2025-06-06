"use client";

import React from "react";
import { DateRange, Range, RangeKeyDict } from "react-date-range";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type Props = {
  value: Range;
  onChange: (value: RangeKeyDict) => void;
  disabledDates?: Date[];
};

function Calendar({ value, onChange, disabledDates }: Props) {
  return (
    <DateRange
      rangeColors={["#d97706"]}
      ranges={[value]}
      date={new Date()}
      onChange={onChange}
      direction="vertical"
      months={1}
      showDateDisplay={false}
      minDate={new Date()}
      disabledDates={disabledDates}
      monthDisplayFormat="MMMM yyyy"
      weekdayDisplayFormat="EEE"
      showMonthAndYearPickers={true}
      moveRangeOnFirstSelection={false}
      editableDateInputs={true}
      showMonthArrow={true}
    />
  );
}

export default Calendar;
