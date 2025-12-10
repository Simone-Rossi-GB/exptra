import { forwardRef, useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * DatePicker - Beautiful date picker component inspired by Untitled UI
 * Uses native date input with custom styling
 */
export const DatePicker = forwardRef(({
  value,
  onChange,
  label,
  error,
  placeholder = "Seleziona data",
  className = '',
  disabled = false,
  ...props
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          type="date"
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full
            px-4 py-2.5
            bg-white dark:bg-surface/50
            border border-gray-300 dark:border-gray-700/50
            rounded-xl
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            transition-all duration-200 ease-out
            focus:outline-none
            focus:ring-2 focus:ring-primary/50
            focus:border-primary
            hover:border-gray-400 dark:hover:border-gray-600
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : ''}
          `}
          {...props}
        />

        {/* Calendar icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <CalendarIcon className={`w-5 h-5 ${disabled ? 'text-gray-500 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`} />
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

DatePicker.displayName = "DatePicker";


/**
 * CalendarDatePicker - Advanced calendar-based date picker
 * Full calendar view with month/year navigation
 */
export const CalendarDatePicker = forwardRef(({
  value,
  onChange,
  label,
  error,
  placeholder = "Seleziona data",
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date());
  const containerRef = useRef(null);

  // Parse value to Date object
  const selectedDate = value ? new Date(value) : null;

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(displayDate);

  // Handle date selection
  const handleDateClick = (day) => {
    const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    const dateString = newDate.toISOString().split('T')[0];
    onChange({ target: { name: props.name, value: dateString } });
    setIsOpen(false);
  };

  // Navigate months
  const previousMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));
  };

  // Check if day is selected
  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === displayDate.getMonth() &&
      selectedDate.getFullYear() === displayDate.getFullYear()
    );
  };

  // Check if day is today
  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === displayDate.getMonth() &&
      today.getFullYear() === displayDate.getFullYear()
    );
  };

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full
            px-4 py-2.5
            bg-white dark:bg-surface/50
            border border-gray-300 dark:border-gray-700/50
            rounded-xl
            text-left
            transition-all duration-200 ease-out
            focus:outline-none
            focus:ring-2 focus:ring-primary/50
            focus:border-primary
            hover:border-gray-400 dark:hover:border-gray-600
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : ''}
            ${value ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-500'}
          `}
        >
          {value ? formatDate(value) : placeholder}
        </button>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <CalendarIcon className={`w-5 h-5 ${disabled ? 'text-gray-500 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`} />
        </div>

        {/* Calendar Popup */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 min-w-[280px]">
            {/* Month/Year Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={previousMonth}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-light transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {displayDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
              </h3>

              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-light transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'L', 'M', 'M', 'G', 'V', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-gray-600 dark:text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const selected = isSelected(day);
                const today = isToday(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square p-1 text-sm rounded-lg transition-all
                      ${selected
                        ? 'bg-primary text-white font-semibold'
                        : today
                          ? 'bg-primary/20 text-primary font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-light'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

CalendarDatePicker.displayName = "CalendarDatePicker";
