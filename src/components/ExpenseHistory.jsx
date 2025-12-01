import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Filter, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Zap,
  Smartphone,
  Plane,
  Heart,
  Book,
  Dumbbell,
  PawPrint,
  Music,
  Gamepad2,
  Film,
  UtensilsCrossed,
  Shirt,
  Package,
} from "lucide-react";

const ICON_MAP = {
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Zap,
  Smartphone,
  Plane,
  Heart,
  Book,
  Dumbbell,
  PawPrint,
  Music,
  Gamepad2,
  Film,
  UtensilsCrossed,
  Shirt,
  Package,
};

export function ExpenseHistory({ expenses, categories, onEditExpense, onDeleteExpense }) {
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Chiudi menu quando clicchi fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (filter !== 'all') {
      filtered = filtered.filter(e => e.category === filter);
    }

    // Ordina per data decrescente
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered.slice(0, limit);
  }, [expenses, filter, limit]);

  const getIconComponent = (iconName) => {
    return ICON_MAP[iconName] || Package;
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || {
      name: 'Altro',
      icon: 'Package',
      color: '#6b7280'
    };
  };

  return (
    <Card className="lg:col-span-1 flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Transazioni Recenti
        </CardTitle>
        {categories.length > 0 && (
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-surface border border-gray-700 rounded-lg px-3 py-1.5 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tutte</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessuna transazione
            </div>
          ) : (
            <>
              {filteredExpenses.map((expense, index) => {
                const category = getCategoryInfo(expense.category);
                const IconComponent = getIconComponent(category.icon);

                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex items-center gap-3 p-3 rounded-lg hover:bg-surface/50 transition-colors group"
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: category.color }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {expense.title || expense.description || category.name || 'Spesa'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(expense.date), 'dd MMM yyyy', { locale: it })}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-400">
                        -€{expense.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{category.name}</p>
                    </div>

                  </motion.div>
                );
              })}

            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
