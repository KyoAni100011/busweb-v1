import React, { useEffect, useMemo, useState } from 'react';
import { locationService } from '@/services/location.service';
import type { CitySuggestion } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CityAutocompleteProps {
  value: CitySuggestion | null;
  onSelect: (city: CitySuggestion) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

const formatCityLabel = (city: CitySuggestion) => {
  if (city.region) {
    return `${city.name}, ${city.region}`;
  }

  if (city.country) {
    return `${city.name}, ${city.country}`;
  }

  return city.name;
};

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onSelect,
  label,
  placeholder,
  disabled,
}) => {
  const [inputValue, setInputValue] = useState(value ? value.name : '');
  const [items, setItems] = useState<CitySuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setInputValue(value ? value.name : '');
  }, [value]);

  useEffect(() => {
    if (!inputValue.trim()) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    const timeout = window.setTimeout(() => {
      locationService
        .searchCities({ query: inputValue })
        .then(setItems)
        .finally(() => setIsLoading(false));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [inputValue]);

  const helperText = useMemo(() => {
    if (disabled) {
      return 'This field is disabled';
    }

    if (isLoading) {
      return 'Searching...';
    }

    if (!isOpen || items.length > 0) {
      return '';
    }

    return 'No cities found';
  }, [disabled, isLoading, isOpen, items.length]);

  return (
    <div className="relative">
      <Label className="mb-2 block text-sm text-muted-foreground">{label}</Label>
      <Input
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {isOpen && items.length > 0 && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-md border bg-background shadow-lg">
          <ul className="max-h-60 divide-y overflow-y-auto">
            {items.map((city) => (
              <li
                key={city.id}
                className="cursor-pointer px-4 py-2 hover:bg-muted"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelect(city);
                  setInputValue(city.name);
                  setIsOpen(false);
                }}
              >
                <span className="block text-sm font-medium">{formatCityLabel(city)}</span>
                {city.country && (
                  <span className="text-xs text-muted-foreground">{city.country}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {helperText && (
        <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};
