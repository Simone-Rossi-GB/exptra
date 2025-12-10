import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl px-4 py-2",
        "border border-gray-300 dark:border-gray-700",
        "bg-white dark:bg-surface-light",
        "text-gray-900 dark:text-white",
        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        "transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Prevent autofill from changing background color - light mode
        "[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(17,24,39)]",
        "[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_rgb(255,255,255)_inset]",
        "[&:-webkit-autofill:hover]:[-webkit-box-shadow:0_0_0px_1000px_rgb(255,255,255)_inset]",
        "[&:-webkit-autofill:focus]:[-webkit-box-shadow:0_0_0px_1000px_rgb(255,255,255)_inset]",
        "[&:-webkit-autofill:active]:[-webkit-box-shadow:0_0_0px_1000px_rgb(255,255,255)_inset]",
        // Prevent autofill from changing background color - dark mode
        "dark:[&:-webkit-autofill]:[-webkit-text-fill-color:white]",
        "dark:[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_rgb(26,26,36)_inset]",
        "dark:[&:-webkit-autofill:hover]:[-webkit-box-shadow:0_0_0px_1000px_rgb(26,26,36)_inset]",
        "dark:[&:-webkit-autofill:focus]:[-webkit-box-shadow:0_0_0px_1000px_rgb(26,26,36)_inset]",
        "dark:[&:-webkit-autofill:active]:[-webkit-box-shadow:0_0_0px_1000px_rgb(26,26,36)_inset]",
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
