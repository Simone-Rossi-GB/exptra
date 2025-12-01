import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-gray-700 bg-surface-light px-4 py-2",
        "text-white placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        "transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Prevent autofill from changing background color
        "[&:-webkit-autofill]:bg-surface-light [&:-webkit-autofill]:text-white",
        "[&:-webkit-autofill]:[-webkit-text-fill-color:white]",
        "[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_rgb(26,26,36)_inset]",
        "[&:-webkit-autofill:hover]:[-webkit-box-shadow:0_0_0px_1000px_rgb(26,26,36)_inset]",
        "[&:-webkit-autofill:focus]:[-webkit-box-shadow:0_0_0px_1000px_rgb(26,26,36)_inset]",
        "[&:-webkit-autofill:active]:[-webkit-box-shadow:0_0_0px_1000px_rgb(26,26,36)_inset]",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-xl border border-gray-700 bg-surface-light px-4 py-2",
        "text-white",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        "transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
