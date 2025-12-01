import { cn } from "@/lib/utils";

const buttonVariants = {
  default: "bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/20",
  secondary: "bg-surface-light hover:bg-gray-700 text-white border border-gray-700",
  ghost: "hover:bg-surface-light text-gray-300 hover:text-white",
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
