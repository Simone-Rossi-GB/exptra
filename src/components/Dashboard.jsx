import { useState, useMemo } from "react";
import { BalanceCard } from "./BalanceCard";
import { StatCard } from "./StatCard";
import { TransactionList } from "./TransactionList";
import { SpendingChart } from "./SpendingChart";
import { AddExpenseModal } from "./AddExpenseModal";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  PieChart,
  Plus,
  LayoutDashboard,
  ArrowLeftRight,
  Settings,
  User,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Dashboard() {
  const [expenses, setExpenses] = useState([
    {
      id: "1",
      descrizione: "Spesa Supermercato",
      importo: 127.45,
      categoria: "groceries",
      data: "2025-11-28"
    },
    {
      id: "2",
      descrizione: "Cena Ristorante Giapponese",
      importo: 89.90,
      categoria: "food",
      data: "2025-11-27"
    },
    {
      id: "3",
      descrizione: "Benzina Shell",
      importo: 65.00,
      categoria: "transport",
      data: "2025-11-26"
    },
    {
      id: "4",
      descrizione: "Bolletta Luce",
      importo: 145.30,
      categoria: "utilities",
      data: "2025-11-25"
    },
    {
      id: "5",
      descrizione: "Netflix Subscription",
      importo: 15.99,
      categoria: "entertainment",
      data: "2025-11-24"
    },
    {
      id: "6",
      descrizione: "IKEA Furniture",
      importo: 234.50,
      categoria: "home",
      data: "2025-11-23"
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  const handleAddExpense = (expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.importo, 0);
    const thisMonth = new Date().getMonth();
    const thisMonthExpenses = expenses.filter(
      e => new Date(e.data).getMonth() === thisMonth
    );
    const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.importo, 0);

    return {
      total,
      thisMonth: thisMonthTotal,
      count: expenses.length,
      avgTransaction: total / expenses.length,
    };
  }, [expenses]);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transazioni', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Impostazioni', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-800/50 bg-surface/50 backdrop-blur-xl">
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-card flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">ExpenseTracker</h2>
              <p className="text-xs text-gray-500">Pro Version</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-400 hover:text-white hover:bg-surface-light'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800/50">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-surface-light transition-all duration-200">
            <User className="w-5 h-5" />
            <div className="flex-1 text-left">
              <p className="font-medium text-sm text-white">Mario Rossi</p>
              <p className="text-xs text-gray-500">mario@email.com</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-gray-800/50 bg-surface/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Benvenuto, ecco il riepilogo delle tue spese
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl hover:bg-surface-light transition-colors text-gray-400 hover:text-white">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-xl hover:bg-surface-light transition-colors text-gray-400 hover:text-white relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-card flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 space-y-8">
          {/* Balance Card */}
          <BalanceCard balance={25230.50} />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Spese Totali"
              amount={stats.total}
              change="+12.5%"
              trend="up"
              icon={Wallet}
              delay={0}
            />
            <StatCard
              title="Questo Mese"
              amount={stats.thisMonth}
              change="-8.2%"
              trend="down"
              icon={TrendingUp}
              delay={0.1}
            />
            <StatCard
              title="Media Transazione"
              amount={stats.avgTransaction}
              change="+5.1%"
              trend="up"
              icon={CreditCard}
              delay={0.2}
            />
            <StatCard
              title="Transazioni"
              amount={stats.count}
              icon={PieChart}
              delay={0.3}
            />
          </div>

          {/* Charts and Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingChart expenses={expenses} />
            <TransactionList expenses={expenses} />
          </div>
        </div>
      </main>

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-card shadow-glow flex items-center justify-center text-white z-40 hover:shadow-glow-purple transition-all duration-300"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
}
