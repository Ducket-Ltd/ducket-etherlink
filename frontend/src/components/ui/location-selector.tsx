import { useState, useEffect, useMemo } from 'react';
import Select, { StylesConfig } from 'react-select';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { Label } from '@/components/ui/label';

export interface LocationData {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
}

interface LocationSelectorProps {
  value: LocationData;
  onChange: (data: LocationData) => void;
  showCity?: boolean;
  className?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

// Custom styles to match shadcn/ui theme
const customStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'hsl(var(--background))',
    borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
    borderRadius: 'calc(var(--radius) - 2px)',
    boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring) / 0.2)' : 'none',
    '&:hover': {
      borderColor: 'hsl(var(--border))',
    },
    minHeight: '40px',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'calc(var(--radius) - 2px)',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'hsl(var(--primary))'
      : state.isFocused
      ? 'hsl(var(--accent))'
      : 'transparent',
    color: state.isSelected
      ? 'hsl(var(--primary-foreground))'
      : 'hsl(var(--foreground))',
    borderRadius: 'calc(var(--radius) - 4px)',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'hsl(var(--accent))',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
  }),
  input: (base) => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
    '&:hover': {
      color: 'hsl(var(--foreground))',
    },
  }),
};

export function LocationSelector({
  value,
  onChange,
  showCity = true,
  className,
}: LocationSelectorProps) {
  const [states, setStates] = useState<SelectOption[]>([]);
  const [cities, setCities] = useState<SelectOption[]>([]);

  // Memoize countries to avoid recalculating on every render
  const countries = useMemo(() => {
    return Country.getAllCountries().map((country: ICountry) => ({
      value: country.isoCode,
      label: country.name,
    }));
  }, []);

  // Update states when country changes
  useEffect(() => {
    if (value.countryCode) {
      const stateData = State.getStatesOfCountry(value.countryCode);
      setStates(
        stateData.map((state: IState) => ({
          value: state.isoCode,
          label: state.name,
        }))
      );
    } else {
      setStates([]);
    }
  }, [value.countryCode]);

  // Update cities when state changes
  useEffect(() => {
    if (value.countryCode && value.stateCode && showCity) {
      const cityData = City.getCitiesOfState(value.countryCode, value.stateCode);
      setCities(
        cityData.map((city: ICity) => ({
          value: city.name,
          label: city.name,
        }))
      );
    } else {
      setCities([]);
    }
  }, [value.countryCode, value.stateCode, showCity]);

  const handleCountryChange = (selected: SelectOption | null) => {
    onChange({
      country: selected?.label || '',
      countryCode: selected?.value || '',
      state: '',
      stateCode: '',
      city: '',
    });
  };

  const handleStateChange = (selected: SelectOption | null) => {
    onChange({
      ...value,
      state: selected?.label || '',
      stateCode: selected?.value || '',
      city: '',
    });
  };

  const handleCityChange = (selected: SelectOption | null) => {
    onChange({
      ...value,
      city: selected?.value || '',
    });
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Country</Label>
          <Select<SelectOption>
            styles={customStyles}
            options={countries}
            value={countries.find((c) => c.value === value.countryCode) || null}
            onChange={handleCountryChange}
            placeholder="Select country..."
            isClearable
            isSearchable
            classNamePrefix="react-select"
          />
        </div>

        {states.length > 0 && (
          <div>
            <Label className="mb-2 block">State / Province</Label>
            <Select<SelectOption>
              styles={customStyles}
              options={states}
              value={states.find((s) => s.value === value.stateCode) || null}
              onChange={handleStateChange}
              placeholder="Select state..."
              isClearable
              isSearchable
              classNamePrefix="react-select"
            />
          </div>
        )}

        {showCity && cities.length > 0 && (
          <div>
            <Label className="mb-2 block">City</Label>
            <Select<SelectOption>
              styles={customStyles}
              options={cities}
              value={cities.find((c) => c.value === value.city) || null}
              onChange={handleCityChange}
              placeholder="Select city..."
              isClearable
              isSearchable
              classNamePrefix="react-select"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationSelector;
