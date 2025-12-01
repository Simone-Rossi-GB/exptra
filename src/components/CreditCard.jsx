import { cn } from "@/lib/utils";

const cardVariants = {
  gradient: {
    container: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
    text: "text-white",
    logo: "text-white",
  },
  dark: {
    container: "bg-gray-900",
    text: "text-white",
    logo: "text-white",
  },
  light: {
    container: "bg-white",
    text: "text-gray-900",
    logo: "text-gray-900",
  },
  transparent: {
    container: "bg-white/10 backdrop-blur-xl border border-white/20",
    text: "text-white",
    logo: "text-white",
  },
  'gradient-blue': {
    container: "bg-gradient-to-br from-blue-600 to-cyan-500",
    text: "text-white",
    logo: "text-white",
  },
  'gradient-purple': {
    container: "bg-gradient-to-br from-violet-600 to-purple-500",
    text: "text-white",
    logo: "text-white",
  },
  'gradient-green': {
    container: "bg-gradient-to-br from-green-600 to-emerald-500",
    text: "text-white",
    logo: "text-white",
  },
  'gradient-orange': {
    container: "bg-gradient-to-br from-orange-600 to-amber-500",
    text: "text-white",
    logo: "text-white",
  },
  'gradient-pink': {
    container: "bg-gradient-to-br from-pink-600 to-rose-500",
    text: "text-white",
    logo: "text-white",
  },
};

export function CreditCard({
  variant = "gradient",
  cardNumber = "•••• •••• •••• 4242",
  cardHolder = "MARIO ROSSI",
  cardExpiration = "12/25",
  company = "VISA",
  width = 316,
  height = null,
  className,
}) {
  // Force 192px height when width is percentage, otherwise calculate proportionally
  const isPercentage = typeof width === 'string' && width.includes('%');
  const calculatedHeight = height || (isPercentage ? '192px' : `${(width / 320) * 192}px`);
  const styles = cardVariants[variant] || cardVariants.gradient;

  // Format card number with proper spacing
  const formattedNumber = cardNumber.split(' ').join(' ');

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl",
        styles.container,
        className
      )}
      style={{
        width: isPercentage ? width : `${width}px`,
        height: calculatedHeight
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
      </div>

      {/* Card content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Top section with logo/company */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {/* Chip */}
            <div className={cn("w-10 h-8 rounded-md", styles.container === cardVariants.light.container ? "bg-gradient-to-br from-yellow-400 to-yellow-600" : "bg-gradient-to-br from-yellow-300 to-yellow-500")}>
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-6 h-6 opacity-40" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="8" y="8" width="8" height="8" rx="1" fill="black" fillOpacity="0.2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Company logo/name */}
          <div className={cn("text-xl font-bold tracking-wider", styles.logo)}>
            {company}
          </div>
        </div>

        {/* Middle section - contactless icon */}
        <div className="flex items-center">
          <svg
            className={cn("w-6 h-6 opacity-60", styles.logo)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" opacity="0.3"/>
            <path d="M8.5 10.5c1-1 2.5-1.5 4-1.5"/>
            <path d="M9.5 13.5c.7-.7 1.7-1 2.5-1"/>
            <path d="M10.5 16.5c.3-.3.7-.5 1-.5"/>
          </svg>
        </div>

        {/* Bottom section with card details */}
        <div className="space-y-3">
          {/* Card number */}
          <div className={cn("text-lg font-mono tracking-wider", styles.text)}>
            {formattedNumber}
          </div>

          {/* Card holder and expiration */}
          <div className="flex items-end justify-between">
            <div>
              <div className={cn("text-xs uppercase opacity-70 mb-1", styles.text)}>
                Card Holder
              </div>
              <div className={cn("text-sm font-semibold tracking-wide", styles.text)}>
                {cardHolder}
              </div>
            </div>

            <div className="text-right">
              <div className={cn("text-xs uppercase opacity-70 mb-1", styles.text)}>
                Expires
              </div>
              <div className={cn("text-sm font-semibold", styles.text)}>
                {cardExpiration}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full hover:translate-x-[-100%] transition-transform duration-1000"></div>
      </div>
    </div>
  );
}
