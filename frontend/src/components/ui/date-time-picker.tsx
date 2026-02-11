import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
  showTimeSelect?: boolean;
  disabled?: boolean;
}

const CustomInput = forwardRef<HTMLDivElement, CustomInputProps>(
  ({ value, onClick, placeholder, showTimeSelect, disabled }, ref) => (
    <div
      ref={ref}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'flex items-center w-full px-3 py-2 border border-input rounded-md bg-background cursor-pointer',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        'hover:bg-accent/50 transition-colors',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        type="text"
        className="flex-1 bg-transparent border-0 outline-none cursor-pointer placeholder:text-muted-foreground"
        value={value || ''}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
      />
      {showTimeSelect ? (
        <Clock className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
      ) : (
        <Calendar className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
      )}
    </div>
  )
);

CustomInput.displayName = 'CustomInput';

export function DateTimePicker({
  value,
  onChange,
  minDate = new Date(),
  maxDate,
  showTimeSelect = false,
  placeholder = 'Select date',
  className,
  disabled = false,
}: DateTimePickerProps) {
  const dateFormat = showTimeSelect ? "MMMM d, yyyy 'at' h:mm aa" : 'MMMM d, yyyy';

  return (
    <div className={cn('relative', className)}>
      <DatePicker
        selected={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        showTimeSelect={showTimeSelect}
        timeFormat="h:mm aa"
        timeIntervals={15}
        dateFormat={dateFormat}
        placeholderText={placeholder}
        disabled={disabled}
        customInput={
          <CustomInput
            placeholder={placeholder}
            showTimeSelect={showTimeSelect}
            disabled={disabled}
          />
        }
        calendarClassName="!font-sans"
        showPopperArrow={false}
        popperClassName="react-datepicker-popper-custom"
        popperPlacement="bottom-start"
        wrapperClassName="w-full"
      />
    </div>
  );
}

export default DateTimePicker;
