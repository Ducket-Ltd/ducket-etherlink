import { useRef, useEffect, useState, useCallback } from 'react';
import { useMapsLibrary } from '@/hooks/useGoogleMaps';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface AddressData {
  address: string;
  streetNumber?: string;
  streetName?: string;
  city: string;
  state: string;
  stateCode: string;
  country: string;
  countryCode: string;
  postalCode: string;
  lat?: number;
  lng?: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, data?: AddressData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Search for venue address...',
  className,
  disabled = false,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  const places = useMapsLibrary('places');
  const [isLoading, setIsLoading] = useState(false);

  // Keep onChange ref up to date without causing effect re-runs
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    // Initialize autocomplete
    const options: google.maps.places.AutocompleteOptions = {
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      types: ['establishment', 'geocode'],
    };

    autocompleteRef.current = new places.Autocomplete(inputRef.current, options);

    // Add listener for place selection
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place || !place.address_components) return;

      setIsLoading(true);

      // Parse address components
      const addressData: AddressData = {
        address: place.formatted_address || '',
        city: '',
        state: '',
        stateCode: '',
        country: '',
        countryCode: '',
        postalCode: '',
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
      };

      place.address_components.forEach((component) => {
        const types = component.types;

        if (types.includes('street_number')) {
          addressData.streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          addressData.streetName = component.long_name;
        }
        if (types.includes('locality') || types.includes('sublocality')) {
          addressData.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          addressData.state = component.long_name;
          addressData.stateCode = component.short_name;
        }
        if (types.includes('country')) {
          addressData.country = component.long_name;
          addressData.countryCode = component.short_name;
        }
        if (types.includes('postal_code')) {
          addressData.postalCode = component.long_name;
        }
      });

      // Use setTimeout to ensure the callback runs after React state updates
      // This prevents race conditions with map rendering
      setTimeout(() => {
        onChangeRef.current(place.formatted_address || '', addressData);
        setIsLoading(false);
      }, 0);
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [places]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // If Google Maps is not loaded, show a simple input
  if (!places) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pl-10"
            disabled={disabled}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Enter address manually (Google Places not available)
        </p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'pl-10 pr-10'
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>
    </div>
  );
}

export default AddressAutocomplete;
