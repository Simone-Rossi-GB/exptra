import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, ShoppingCart, Coffee, Home, Car, Pizza } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const categoryIcons = {
  groceries: ShoppingCart,
  food: Pizza,
  transport: Car,
  home: Home,
  entertainment: Coffee,
};

const categoryColors = {
  groceries: "from-blue-500 to-blue-600",
  food: "from-orange-500 to-orange-600",
  transport: "from-green-500 to-green-600",
  home: "from-purple-500 to-purple-600",
  entertainment: "from-pink-500 to-pink-600",
};

export function ExpenseList({ expenses, onDelete, onEdit }) {
  if (!expenses || expenses.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-8 text-center">
        <p className="text-slate-400">Nessuna spesa registrata</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const Icon = categoryIcons[expense.categoria] || ShoppingCart;
        const colorClass = categoryColors[expense.categoria] || "from-blue-500 to-purple-600";

        return (
          <Card
            key={expense.id}
            className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{expense.descrizione}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-slate-400">
                      {formatDate(expense.data)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {expense.categoria}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-white">
                  {formatCurrency(expense.importo)}
                </span>
                <div className="flex gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(expense)}
                      className="text-slate-400 hover:text-blue-500 hover:bg-slate-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(expense.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-slate-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
