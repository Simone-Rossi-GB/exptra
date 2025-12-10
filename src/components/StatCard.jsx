import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "../hooks/useCurrency.js";

export function StatCard({ title, amount, change, trend, icon: Icon, delay = 0, className = '', footer }) {
  const isPositive = trend === 'up';
  const { format } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={className}
    >
      <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer group h-full flex flex-col">
        <div className="p-6 flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {title}
            </span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              {Icon && <Icon className="w-5 h-5" />}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {typeof amount === 'number' ? format(amount) : amount}
            </h3>

            {change && (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${
                  isPositive
                    ? 'bg-accent-green/10 text-accent-green'
                    : 'bg-red-500/10 text-red-500 dark:text-red-400'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{change}</span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-500">vs mese scorso</span>
              </div>
            )}
          </div>
        </div>

        {footer && (
          <div className="border-t border-gray-200 dark:border-gray-800/50">
            {footer}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
