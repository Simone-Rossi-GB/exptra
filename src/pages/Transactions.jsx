import { useState, useEffect, useMemo, useRef } from "react";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import pb, { expensesService, categoriesService } from "../lib/pocketBase.js";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { SelectNative } from "../components/ui/select.jsx";
import { AddExpenseModal } from "../components/AddExpenseModal.jsx";
import { EditExpenseModal } from "../components/EditExpenseModal.jsx";
import { useCurrency } from "../hooks/useCurrency.js";
import {
  ArrowLeftRight,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  Download,
  Plus,
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
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

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

export function Transactions() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const menuRef = useRef(null);
  const { format: formatCurrency } = useCurrency();

  // Debounce search term - updates debouncedSearchTerm after 300ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data on mount
  useEffect(() => {
    console.log('Transactions: Fetching data');
    const fetchData = async () => {
      try {
        const [fetchedExpenses, fetchedCategories] = await Promise.all([
          expensesService.getAll(),
          categoriesService.getAll()
        ]);

        // If no categories exist, create default ones
        if (fetchedCategories.length === 0) {
          console.log('Transactions: No categories found, creating default categories');
          try {
            const userID = pb.authStore.model?.id;
            if (userID) {
              await categoriesService.createDefaultCategories(userID);
              const newCategories = await categoriesService.getAll();
              console.log('Transactions: Created', newCategories.length, 'default categories');
              setCategories(newCategories);
            }
          } catch (catError) {
            console.error('Transactions: Error creating default categories', catError);
            setCategories(fetchedCategories);
          }
        } else {
          setCategories(fetchedCategories);
        }

        setExpenses(fetchedExpenses);
      } catch (error) {
        console.error('Transactions: Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await expensesService.delete(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Transactions: Error deleting', error);
    }
  };

  // Handle add expense
  const handleAddExpense = async (expenseData) => {
    try {
      console.log('Transactions: Creating new expense');
      const newExpense = await expensesService.create(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      console.log('Transactions: Expense created successfully');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Transactions: Error creating expense', error);
      alert('Errore nella creazione della spesa');
    }
  };

  // Handle edit expense
  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  // Handle update expense
  const handleUpdateExpense = async (id, updatedData) => {
    try {
      console.log('Transactions: Updating expense', id);
      const updated = await expensesService.update(id, updatedData);
      setExpenses(prev => prev.map(exp => exp.id === id ? updated : exp));
      console.log('Transactions: Expense updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Transactions: Error updating expense', error);
      alert('Errore nell\'aggiornamento della spesa');
    }
  };

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];
    if (debouncedSearchTerm) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter(e => e.category === filterCategory);
    }
    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
    return filtered;
  }, [expenses, debouncedSearchTerm, filterCategory, sortBy]);

  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      total,
      count: filteredExpenses.length,
      avg: total / filteredExpenses.length || 0,
    };
  }, [filteredExpenses]);

  const getIconComponent = (iconName) => ICON_MAP[iconName] || Package;
  const getCategoryInfo = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat || {
      name: 'Altro',
      icon: 'Package',
      color: '#6b7280'
    };
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-400">Caricamento transazioni...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">Gestisci tutte le tue spese</p>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Esporta CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Totale Filtrato</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Transazioni</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.count}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Media</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.avg)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cerca transazioni..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOpenMenuId(null); // Close any open menu when searching
              }}
              onFocus={() => setOpenMenuId(null)} // Close menu when focusing search
              className="pl-10"
            />
          </div>
          <SelectNative
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setOpenMenuId(null); // Close any open menu when filtering
            }}
            onFocus={() => setOpenMenuId(null)}
          >
            <option value="all">Tutte le categorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </SelectNative>

          <SelectNative
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setOpenMenuId(null); // Close any open menu when sorting
            }}
            onFocus={() => setOpenMenuId(null)}
          >
            <option value="date-desc">Data (più recenti)</option>
            <option value="date-asc">Data (più vecchie)</option>
            <option value="amount-desc">Importo (maggiore)</option>
            <option value="amount-asc">Importo (minore)</option>
          </SelectNative>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-800/50">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12 text-gray-600 dark:text-gray-500">
                  <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nessuna transazione trovata</p>
                </div>
              ) : (
                filteredExpenses.map((expense, index) => {
                  const category = getCategoryInfo(expense.category);
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="relative"
                    >
                      {/* Mobile: Click to open, Desktop: Hover menu */}
                      <div
                        onClick={() => {
                          // On mobile, click opens the menu
                          if (window.innerWidth < 1024) {
                            setOpenMenuId(openMenuId === expense.id ? null : expense.id);
                          }
                        }}
                        className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-surface/30 transition-colors group cursor-pointer lg:cursor-default"
                      >
                        <div
                          className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          <IconComponent className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: category.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white truncate">{expense.title || expense.description || category.name || 'Spesa'}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-gray-600 dark:text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(expense.date), 'dd MMM yyyy', { locale: it })}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full hidden lg:inline-block" style={{ backgroundColor: category.color + '20', color: category.color }}>
                              {category.name}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base lg:text-lg font-bold text-red-500 dark:text-red-400 whitespace-nowrap">-{formatCurrency(expense.amount)}</p>
                        </div>
                        {/* Desktop only: Three dots menu */}
                        <div className="relative hidden lg:block" ref={openMenuId === expense.id ? menuRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === expense.id ? null : expense.id);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-surface-light transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          <AnimatePresence>
                            {openMenuId === expense.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-2 w-40 bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
                              >
                                <button
                                  onClick={() => handleEditClick(expense)}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-surface-light transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Modifica
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Sei sicuro di voler eliminare questa spesa?')) {
                                      handleDelete(expense.id);
                                    }
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-surface-light transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Elimina
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Mobile: Bottom action buttons when expanded */}
                      <AnimatePresence>
                        {openMenuId === expense.id && window.innerWidth < 1024 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden border-t border-gray-200 dark:border-gray-800/50 bg-gray-50 dark:bg-surface/50"
                          >
                            <div className="flex gap-2 p-3">
                              <button
                                onClick={() => handleEditClick(expense)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-gray-200 dark:bg-surface-light hover:bg-gray-300 dark:hover:bg-surface rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                                Modifica
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Sei sicuro di voler eliminare questa spesa?')) {
                                    handleDelete(expense.id);
                                  }
                                  setOpenMenuId(null);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Elimina
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
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
