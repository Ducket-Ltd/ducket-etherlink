import { useMemo } from 'react';
import Select, { StylesConfig } from 'react-select';

interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  className?: string;
  disabled?: boolean;
}

// Common timezones with friendly names
const COMMON_TIMEZONES: { value: string; label: string; offset: string }[] = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5/-4' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6/-5' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7/-6' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8/-7' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: 'UTC-9/-8' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: 'UTC-10' },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0/+1' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 'UTC+8' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: 'UTC+10/+11' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', offset: 'UTC+12/+13' },
  { value: 'UTC', label: 'UTC', offset: 'UTC+0' },
];

// Custom styles to match shadcn/ui theme
const customStyles: StylesConfig<TimezoneOption, false> = {
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

export function TimezoneSelector({
  value,
  onChange,
  className,
  disabled = false,
}: TimezoneSelectorProps) {
  // Get user's browser timezone
  const browserTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  }, []);

  // Build options list with user's timezone at the top if not already included
  const options = useMemo(() => {
    const allOptions = [...COMMON_TIMEZONES];

    // Check if browser timezone is in the list
    const hasBrowserTimezone = allOptions.some(tz => tz.value === browserTimezone);

    if (!hasBrowserTimezone && browserTimezone) {
      // Add browser timezone at the beginning
      allOptions.unshift({
        value: browserTimezone,
        label: `${browserTimezone.replace(/_/g, ' ')} (Your timezone)`,
        offset: '',
      });
    }

    return allOptions;
  }, [browserTimezone]);

  // Format option label
  const formatOptionLabel = (option: TimezoneOption) => (
    <div className="flex justify-between items-center">
      <span>{option.label}</span>
      {option.offset && (
        <span className="text-xs text-muted-foreground ml-2">{option.offset}</span>
      )}
    </div>
  );

  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div className={className}>
      <Select<TimezoneOption>
        styles={customStyles}
        options={options}
        value={selectedOption}
        onChange={(selected) => onChange(selected?.value || browserTimezone)}
        placeholder="Select timezone..."
        isSearchable
        isDisabled={disabled}
        formatOptionLabel={formatOptionLabel}
        classNamePrefix="react-select"
      />
    </div>
  );
}

// Helper to get browser timezone
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export default TimezoneSelector;
