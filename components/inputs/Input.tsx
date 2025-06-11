import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { BiDollar } from "react-icons/bi";

type Props = {
  id: string;
  label: string;
  type?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
};

function Input({
  id,
  label,
  type = "text",
  disabled,
  formatPrice,
  register,
  required,
  errors,
  multiline,
  rows = 4,
  placeholder,
}: Props) {
  const inputClasses = `w-full px-4 py-3 font-light bg-white border-2 rounded-lg outline-none transition disabled:opacity-70 disabled:cursor-not-allowed placeholder:text-gray-400 ${
    formatPrice ? "pl-9" : ""
  } ${errors[id] ? "border-red-500" : "border-neutral-300"} ${
    errors[id] ? "focus:border-red-500" : "focus:border-black"
  }`;

  return (
    <div className="w-full relative">
      {formatPrice && (
        <BiDollar
          size={20}
          className="
            text-neutral-700
            absolute
            top-1/2
            -translate-y-1/2
            left-2
          "
        />
      )}
      {multiline ? (
        <textarea
          id={id}
          disabled={disabled}
          {...register(id, { required })}
          placeholder={placeholder || label}
          rows={rows}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          id={id}
          disabled={disabled}
          {...register(id, { required })}
          placeholder={placeholder || label}
          type={type}
          className={inputClasses}
        />
      )}
    </div>
  );
}

export default Input;
