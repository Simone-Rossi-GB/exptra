import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Select - Beautiful dropdown select component inspired by Untitled UI
 * Supports dark mode, icons, and various sizes
 *
 * @param {Object} props - Component props
 * @param {Array<{value: string, label: string, icon?: React.ReactNode}>} props.options - Select options
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Label text (optional)
 * @param {string} props.error - Error message (optional)
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.className - Additional classes
 * @param {boolean} props.disabled - Disabled state
 */
export const Select = forwardRef(({
  options = [],
  value,
  onChange,
  placeholder = "Seleziona...",
  label,
  error,
  size = 'md',
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-5 py-3 text-lg',
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full
            ${sizeClasses[size]}
            appearance-none
            bg-surface/50
            border border-gray-700/50
            rounded-xl
            text-white
            placeholder-gray-500
            transition-all duration-200 ease-out
            focus:outline-none
            focus:ring-2 focus:ring-primary/50
            focus:border-primary
            hover:border-gray-600
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : ''}
            cursor-pointer
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-surface text-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom chevron icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className={`
            transition-transform duration-200
            ${disabled ? 'text-gray-600' : 'text-gray-400'}
            ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
          `} />
        </div>

        {/* Selected option icon */}
        {selectedOption?.icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {selectedOption.icon}
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

Select.displayName = "Select";


/**
 * SelectNative - Styled native select for simple use cases
 * Lighter weight alternative when custom features aren't needed
 */
export const SelectNative = forwardRef(({
  children,
  className = '',
  error,
  ...props
}, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`
          w-full
          px-4 py-2.5
          appearance-none
          bg-surface/50
          border border-gray-700/50
          rounded-xl
          text-white
          transition-all duration-200 ease-out
          focus:outline-none
          focus:ring-2 focus:ring-primary/50
          focus:border-primary
          hover:border-gray-600
          cursor-pointer
          ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
});

SelectNative.displayName = "SelectNative";
