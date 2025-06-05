"use client";

import { USLocationValue } from "@/hook/useUSLocations";
import { filterLocationOptions, LocationOption } from "@/lib/usCitiesData";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiMapPin, FiChevronDown } from "react-icons/fi";

type Props = {
  value?: USLocationValue;
  onChange: (value: USLocationValue) => void;
  placeholder?: string;
};

export default function AddressInput({ value, onChange, placeholder = "Enter city, state, or zip code" }: Props) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize input from value
  useEffect(() => {
    if (value?.city && value?.state) {
      setInput(`${value.city}, ${value.state}`);
    } else if (value?.state && !value?.city) {
      setInput(value.state);
    } else if (!value?.city && !value?.state) {
      setInput("");
    }
  }, [value?.city, value?.state]);

  // Handle input changes and filtering
  const handleInputChange = useCallback((inputValue: string) => {
    setInput(inputValue);
    setSelectedIndex(-1);

    if (!inputValue.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      onChange({ city: "", state: "", zipCode: "" });
      return;
    }

    if (inputValue.length >= 2) {
      setIsLoading(true);
      const filtered = filterLocationOptions(inputValue);
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setIsLoading(false);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [onChange]);

  // Handle selection from dropdown
  const handleSelect = useCallback((option: LocationOption) => {
    const newValue: USLocationValue = {
      city: option.city || "",
      state: option.state,
      zipCode: option.zipCode || ""
    };
    
    onChange(newValue);
    setInput(option.displayText);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, selectedIndex, suggestions, handleSelect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FiMapPin size={18} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((option, index) => (
            <button
              key={`${option.type}-${option.state}-${option.city || 'state'}`}
              type="button"
              className={`w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-amber-50 border-amber-200' : ''
              }`}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center gap-2">
                <FiMapPin size={16} className="text-gray-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">
                    {option.displayText}
                  </div>
                  {option.type === 'city' && option.zipCode && (
                    <div className="text-xs text-gray-500">{option.zipCode}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}