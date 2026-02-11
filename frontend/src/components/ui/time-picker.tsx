import { useMemo } from 'react';
import Select, { StylesConfig } from 'react-select';
import { Clock } from 'lucide-react';

interface TimeOption {
  value: string;
  label: string;
}

interface TimePickerProps {
  value: string | null; // Format: "HH:mm"
  onChange: (time: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  interval?: number; // Minutes between options (default 15)
}

// Custom styles to match shadcn/ui theme
const customStyles: StylesConfig<TimeOption, false> = {
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
    paddingLeft: '32px',
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
    maxHeight: '200px',
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

// Generate time options
function generateTimeOptions(interval: number): TimeOption[] {
  const options: TimeOption[] = [];
  const minutesInDay = 24 * 60;

  for (let minutes = 0; minutes < minutesInDay; minutes += interval) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const value = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

    // Format label as 12-hour time
    const hour12 = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    const label = `${hour12}:${mins.toString().padStart(2, '0')} ${ampm}`;

    options.push({ value, label });
  }

  return options;
}

export function TimePicker({
  value,
  onChange,
  className,
  disabled = false,
  placeholder = 'Select time...',
  interval = 15,
}: TimePickerProps) {
  const options = useMemo(() => generateTimeOptions(interval), [interval]);

  const selectedOption = value ? options.find(opt => opt.value === value) || null : null;

  return (
    <div className={`relative ${className}`}>
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
      <Select<TimeOption>
        styles={customStyles}
        options={options}
        value={selectedOption}
        onChange={(selected) => onChange(selected?.value || '')}
        placeholder={placeholder}
        isSearchable
        isDisabled={disabled}
        classNamePrefix="react-select"
      />
    </div>
  );
}

export default TimePicker;
