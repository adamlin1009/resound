"use client";

import { USLocationValue } from "@/hook/useUSLocations";
import { useDebounce } from "@/hook/useDebounce";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiMapPin, FiChevronDown, FiX } from "react-icons/fi";

type Prediction = {
  placeId: string;
  displayText: string;
  city: string;
  state: string;
  zipCode?: string;
  mainText: string;
  secondaryText: string;
};

type Props = {
  value?: USLocationValue;
  onChange: (value: USLocationValue) => void;
  placeholder?: string;
};

export default function AddressInput({ value, onChange, placeholder = "Enter city, state, or address" }: Props) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const justSelectedRef = useRef<boolean>(false);
  
  const debouncedInput = useDebounce(input, 300);

  // Generate session token on mount
  useEffect(() => {
    setSessionToken(Math.random().toString(36).substring(7));
  }, []);

  // Initialize input from value
  useEffect(() => {
    if (value?.city && value?.state) {
      setInput(`${value.city}, ${value.state}`);
    } else if (value?.state && !value?.city) {
      setInput(value.state);
    }
  }, [value?.city, value?.state]);

  // Fetch predictions from Google Places API
  const fetchPredictions = useCallback(async (searchInput: string) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        input: searchInput,
        sessionToken: sessionToken,
      });

      const response = await fetch(`/api/places/autocomplete?${params}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setPredictions(data.predictions || []);
      setIsOpen(data.predictions?.length > 0);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        // Error handled internally
        setError('Unable to load suggestions');
        setPredictions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  // Handle debounced input changes
  useEffect(() => {
    // Don't fetch if we just selected something
    if (justSelectedRef.current) {
      return;
    }
    
    if (debouncedInput.trim().length >= 2) {
      fetchPredictions(debouncedInput);
    } else {
      setPredictions([]);
      setIsOpen(false);
    }
  }, [debouncedInput, fetchPredictions]);

  // Handle input changes
  const handleInputChange = useCallback((inputValue: string) => {
    setInput(inputValue);
    setSelectedIndex(-1);
    setError(null);
    justSelectedRef.current = false; // Reset the flag when user types

    if (!inputValue.trim()) {
      setPredictions([]);
      setIsOpen(false);
      onChange({ city: "", state: "", zipCode: "" });
    }
  }, [onChange]);

  // Handle selection from dropdown
  const handleSelect = useCallback((prediction: Prediction) => {
    // Extract state abbreviation from secondary text
    const stateMatch = prediction.secondaryText.match(/([A-Z]{2})/);
    const stateAbbr = stateMatch ? stateMatch[1] : "";
    
    const newValue: USLocationValue = {
      city: prediction.city,
      state: stateAbbr,
      zipCode: prediction.zipCode || ""
    };
    
    // Update form values
    onChange(newValue);
    setInput(prediction.displayText);
    
    // Clear everything and close dropdown
    setIsOpen(false);
    setSelectedIndex(-1);
    setPredictions([]);
    setError(null);
    justSelectedRef.current = true;
    
    // Generate new session token after selection
    setSessionToken(Math.random().toString(36).substring(7));
    
    // Reset the flag after a delay
    setTimeout(() => {
      justSelectedRef.current = false;
    }, 500);
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          handleSelect(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, selectedIndex, predictions, handleSelect]);

  // Clear input
  const handleClear = useCallback(() => {
    setInput("");
    setPredictions([]);
    setIsOpen(false);
    setError(null);
    onChange({ city: "", state: "", zipCode: "" });
    inputRef.current?.focus();
  }, [onChange]);

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
            // Don't open dropdown if we just selected
            if (!justSelectedRef.current && predictions.length > 0 && !error) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          ) : input ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={18} />
            </button>
          ) : (
            <FiChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute z-50 w-full mt-1 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && predictions.length > 0 && !error && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((prediction, index) => (
            <button
              key={prediction.placeId}
              type="button"
              className={`w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-amber-50 border-amber-200' : ''
              }`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input from losing/gaining focus
                handleSelect(prediction);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center gap-2">
                <FiMapPin size={16} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {prediction.mainText}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {prediction.secondaryText}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}