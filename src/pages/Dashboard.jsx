import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { AddExpenseModal } from "../components/AddExpenseModal.jsx";
import { EditExpenseModal } from "../components/EditExpenseModal.jsx";
import { CreditCard as CreditCardComponent } from "../components/CreditCard.jsx";
import { SpendingTrendChart } from "../components/SpendingTrendChart.jsx";
import { CategoryBreakdownChart } from "../components/CategoryBreakdownChart.jsx";
import { ExpenseHistory } from "../components/ExpenseHistory.jsx";
import pb, { expensesService, categoriesService, cardService } from "../lib/pocketBase.js";
import {
  TrendingUp,
  CreditCard,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { motion } from "framer-motion";
import { useToast } from "../components/ui/toast.jsx";

export function Dashboard() {
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  /**
   * Fetch data from PocketBase on component mount
   */
  useEffect(() => {
    console.log('Dashboard: Component mounted, fetching data');
    fetchData();
  }, []);

  /**
   * Fetch expenses and categories from database
   */
  const fetchData = async () => {
    try {
      console.log('Dashboard: Fetching expenses and categories from PocketBase');

      const [fetchedExpenses, fetchedCategories] = await Promise.all([
        expensesService.getAll(),
        categoriesService.getAll()
      ]);

      console.log('Dashboard: Fetched', fetchedExpenses.length, 'expenses and', fetchedCategories.length, 'categories');

      // If no categories exist, create default ones
      if (fetchedCategories.length === 0) {
        console.log('Dashboard: No categories found, creating default categories');
        try {
          const userID = pb.authStore.model?.id;
          if (userID) {
            await categoriesService.createDefaultCategories(userID);
            // Re-fetch categories after creating defaults
            const newCategories = await categoriesService.getAll();
            console.log('Dashboard: Created', newCategories.length, 'default categories');
            setCategories(newCategories);
          }
        } catch (catError) {
          console.error('Dashboard: Error creating default categories', catError);
          setCategories(fetchedCategories); // Use empty array if creation fails
        }
      } else {
        setCategories(fetchedCategories);
      }

      setExpenses(fetchedExpenses);
    } catch (error) {
      console.error('Dashboard: Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle adding new expense
   * @param {Object} expenseData - New expense data
   */
  const handleAddExpense = async (expenseData) => {
    try {
      console.log('Dashboard: Creating new expense');
      const newExpense = await expensesService.create(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      console.log('Dashboard: Expense created successfully');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Dashboard: Error creating expense', error);
      alert('Errore nella creazione della spesa');
    }
  };

  /**
   * Calculate statistics from expenses
   */
  const stats = useMemo(() => {
    if (expenses.length === 0) {
      return { total: 0, thisMonth: 0, count: 0, avgTransaction: 0, avgWeekly: 0 };
    }

    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const thisMonth = new Date().getMonth();
    const thisMonthExpenses = expenses.filter(
      e => new Date(e.date).getMonth() === thisMonth
    );
    const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Calculate weekly average from last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekExpenses = expenses.filter(
      e => new Date(e.date) >= sevenDaysAgo
    );
    const lastWeekTotal = lastWeekExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return {
      total,
      thisMonth: thisMonthTotal,
      count: expenses.length,
      avgTransaction: total / expenses.length,
      avgWeekly: lastWeekTotal,
    };
  }, [expenses]);

  /**
   * Handle updating expense
   * @param {string} id - Expense ID
   * @param {Object} updatedData - Updated data
   */
  const handleUpdateExpense = async (id, updatedData) => {
    try {
      console.log('Dashboard: Updating expense', id);
      const updated = await expensesService.update(id, updatedData);
      setExpenses(prev => prev.map(exp => exp.id === id ? updated : exp));
      console.log('Dashboard: Expense updated successfully');
    } catch (error) {
      console.error('Dashboard: Error updating expense', error);
      alert('Errore nell\'aggiornamento della spesa');
    }
  };

  /**
   * Handle deleting expense
   * @param {string} id - Expense ID
   */
  const handleDeleteExpense = async (id) => {
    try {
      console.log('Dashboard: Deleting expense', id);
      await expensesService.delete(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      console.log('Dashboard: Expense deleted successfully');
    } catch (error) {
      console.error('Dashboard: Error deleting expense', error);
      alert('Errore nell\'eliminazione della spesa');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Caricamento dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Stats & Credit Card */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Transazioni */}
          <StatCard
            title="Transazioni effettuate"
            amount={stats.count.toString()}
            icon={CreditCard}
            delay={0}
            className="h-[180px]"
            footer={
              expenses.length > 0 && (() => {
                const lastExpense = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                return (
                  <div className="flex items-center gap-2 px-6 py-3 bg-surface/50">
                    <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                    <span className="text-xs text-gray-400">
                      Ultima: <span className="text-white font-semibold">€{lastExpense.amount.toFixed(2)}</span>
                    </span>
                  </div>
                );
              })()
            }
          />
          <StatCard
            title="Spese Mese"
            amount={stats.thisMonth}
            change="-8.2%"
            trend="down"
            icon={TrendingUp}
            delay={0.1}
            className="h-[180px]"
          />
          <StatCard
            title="Media Giornaliera"
            amount={stats.avgTransaction}
            change="+5.1%"
            trend="up"
            icon={TrendingUp}
            delay={0.2}
            className="h-[180px]"
          />

          {/* Weekly Average */}
          <StatCard
            title="Media Settimanale"
            amount={stats.avgWeekly}
            change="-3.2%"
            trend="down"
            icon={TrendingUp}
            delay={0.3}
            className="h-[180px]"
          />
        </div>

        {/* Spending Trend Chart */}
        <SpendingTrendChart expenses={expenses} />

        {/* Charts and History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdownChart expenses={expenses} categories={categories} />
          <ExpenseHistory
            expenses={expenses}
            categories={categories}
            onEditExpense={(expense) => {
              setEditingExpense(expense);
              setIsEditModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
          />
        </div>
      </div>

      {/* FAB Button for adding expense */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 lg:bottom-6 lg:right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/30 flex items-center justify-center text-white z-50 hover:shadow-xl hover:shadow-primary/50 transition-all duration-300"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddExpense={handleAddExpense}
        categories={categories}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        onUpdateExpense={handleUpdateExpense}
        expense={editingExpense}
        categories={categories}
      />
    </AppLayout>
  );
}
