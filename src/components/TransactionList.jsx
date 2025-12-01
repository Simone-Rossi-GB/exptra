import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingBag, Coffee, Car, Home, Zap, Smartphone, MoreVertical } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

const categoryConfig = {
  groceries: {
    icon: ShoppingBag,
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
  },
  food: {
    icon: Coffee,
    color: "from-orange-500 to-pink-500",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
  },
  transport: {
    icon: Car,
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-500/10",
    text: "text-green-400",
  },
  home: {
    icon: Home,
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
  },
  entertainment: {
    icon: Smartphone,
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-500/10",
    text: "text-pink-400",
  },
  utilities: {
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
  },
};

export function TransactionList({ expenses }) {
  const recentExpenses = expenses.slice(0, 6);

  return (
    <Card>
      <CardHeader className="border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <CardTitle>Transazioni Recenti</CardTitle>
          <button className="text-sm text-primary hover:text-primary-light font-medium transition-colors">
            Vedi tutte
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-gray-800/50">
          {recentExpenses.map((expense, index) => {
            const config = categoryConfig[expense.categoria] || categoryConfig.groceries;
            const Icon = config.icon;

            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group hover:bg-surface-light transition-all duration-200"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">
                      {expense.descrizione}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(expense.data)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-bold text-white text-sm">
                        {formatCurrency(expense.importo)}
                      </p>
                      <p className={`text-xs ${config.text} capitalize mt-0.5`}>
                        {expense.categoria}
                      </p>
                    </div>

                    <button className="p-2 rounded-lg hover:bg-surface-light opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
