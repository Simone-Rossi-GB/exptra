import { cn } from "@/lib/utils";

const buttonVariants = {
  default: "bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/20",
  outline: "border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-surface-light text-gray-900 dark:text-white",
  secondary: "bg-gray-200 dark:bg-surface-light hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700",
  ghost: "hover:bg-gray-100 dark:hover:bg-surface-light text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  success: "bg-accent-green hover:bg-emerald-600 text-white",
};

const buttonSizes = {
  default: "h-11 px-6 py-2.5",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-8 text-lg",
  icon: "h-10 w-10",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-95",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
