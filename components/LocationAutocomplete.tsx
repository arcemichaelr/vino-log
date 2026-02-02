"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/libs/utils";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEBOUNCE_MS = 500;

export interface LocationSelection {
  name: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationAutocompleteProps {
  value?: string;
  onSelect: (selection: LocationSelection) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function LocationAutocomplete({
  value = "",
  onSelect,
  label = "Location",
  placeholder = "Search for a place or address...",
  id = "location-autocomplete",
  className,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchSuggestions = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(
        `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(trimmed)}&limit=5`,
        { headers: { Accept: "application/json" } }
      );
      const data = (await res.json()) as NominatimResult[];
      setSuggestions(Array.isArray(data) ? data : []);
      setIsOpen(true);
    } catch (err) {
      console.error("Nominatim fetch error:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setInputValue(next);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(next);
      }, DEBOUNCE_MS);
    },
    [fetchSuggestions]
  );

  const handleSelect = useCallback(
    (result: NominatimResult) => {
      const name = result.display_name ?? "";
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        setInputValue(name);
        setSuggestions([]);
        setIsOpen(false);
        onSelect({ name, lat, lng });
      }
    },
    [onSelect]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id}>{label}</Label>
      )}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <Input
            id={id}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            className="pl-9 rounded-md border border-neutral-200 bg-white text-sm"
            autoComplete="off"
          />
        </div>
        {isOpen && (suggestions.length > 0 || isLoading) && (
          <ul
            className="absolute left-0 right-0 top-full mt-1 z-[1000] max-h-60 overflow-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg"
            role="listbox"
          >
            {isLoading ? (
              <li className="px-3 py-2 text-sm text-neutral-500">Searching…</li>
            ) : (
              suggestions.map((result) => (
                <li
                  key={`${result.lat}-${result.lon}-${result.display_name}`}
                  role="option"
                  className="cursor-pointer px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-100"
                  onClick={() => handleSelect(result)}
                >
                  {result.display_name}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default LocationAutocomplete;
