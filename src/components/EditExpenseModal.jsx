import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select";
import { CalendarDatePicker } from "@/components/ui/date-picker";
import {
  X,
  Edit2,
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
  Repeat,
} from "lucide-react";
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

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Contanti' },
  { value: 'card', label: 'Carta' },
  { value: 'check', label: 'Assegno' },
  { value: 'credit transfer', label: 'Bonifico' },
  { value: 'pay in instalments', label: 'Rateizzato' },
];

export function EditExpenseModal({ isOpen, onClose, onUpdateExpense, expense, categories }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
    currency: "EUR",
    notes: "",
    paymentMethod: "cash",
    isRecurring: false,
    recurringDate: "",
  });

  // Update form data when expense changes
  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || "",
        description: expense.description || "",
        amount: expense.amount ? expense.amount.toString() : "",
        category: expense.category || (categories.length > 0 ? categories[0].id : ""),
        date: expense.date || new Date().toISOString().split('T')[0],
        currency: expense.currency || "EUR",
        notes: expense.notes || "",
        paymentMethod: expense.paymentMethod || "cash",
        isRecurring: expense.isRecurring || false,
        recurringDate: expense.recurringDate || "",
      });
    }
  }, [expense, categories]);

  const getIconComponent = (iconName) => {
    return ICON_MAP[iconName] || Package;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields according to PocketBase schema
    if (!formData.title || !formData.description || !formData.amount || !formData.category || !formData.date || !formData.currency || !formData.paymentMethod) {
      alert('Errore: Compila tutti i campi obbligatori (Titolo, Descrizione, Importo, Categoria, Data, Valuta, Metodo di Pagamento)');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Errore: L\'importo deve essere maggiore di zero');
      return;
    }

    onUpdateExpense(expense.id, {
      title: formData.title,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      currency: formData.currency,
      notes: formData.notes,
      paymentMethod: formData.paymentMethod,
      isRecurring: formData.isRecurring,
      recurringDate: formData.recurringDate,
    });

    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <Card className="shadow-2xl">
                <CardHeader className="border-b border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Edit2 className="w-5 h-5 text-primary" />
                      Modifica Spesa
                    </CardTitle>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-surface-light transition-colors text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="overflow-y-auto max-h-[calc(90vh-100px)]">
                  <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Titolo *
                      </label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Es: Spesa supermercato"
                        maxLength={100}
                        required
                        autoFocus
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Descrizione
                      </label>
                      <Input
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Dettagli aggiuntivi (opzionale)"
                        maxLength={200}
                      />
                    </div>

                    {/* Date, Currency, Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <CalendarDatePicker
                        label="Data *"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Valuta
                        </label>
                        <SelectNative
                          name="currency"
                          value={formData.currency}
                          onChange={handleChange}
                        >
                          <option value="EUR">EUR (€)</option>
                          <option value="USD">USD ($)</option>
                          <option value="GBP">GBP (£)</option>
                        </SelectNative>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Importo *
                        </label>
                        <Input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Metodo di Pagamento *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map((method) => {
                          const isSelected = formData.paymentMethod === method.value;
                          return (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                              className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-gray-700 hover:border-gray-600 text-gray-400'
                              }`}
                            >
                              {method.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Categoria *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
                        {categories.map((cat) => {
                          const Icon = getIconComponent(cat.icon);
                          const isSelected = formData.category === cat.id;

                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'border-primary bg-primary/10'
                                  : 'border-gray-700 hover:border-gray-600'
                              }`}
                              style={{
                                color: isSelected ? cat.color : '#9ca3af',
                                borderColor: isSelected ? cat.color : undefined,
                              }}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="text-xs font-medium text-center">{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Note
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Note aggiuntive (opzionale)"
                        maxLength={500}
                        rows={3}
                        className="w-full px-3 py-2 bg-surface border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    {/* Ricorrente */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isRecurring"
                          name="isRecurring"
                          checked={formData.isRecurring}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-gray-700 bg-surface text-primary focus:ring-2 focus:ring-primary"
                        />
                        <label htmlFor="isRecurring" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          <Repeat className="w-4 h-4" />
                          Spesa ricorrente
                        </label>
                      </div>

                      {formData.isRecurring && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <CalendarDatePicker
                            label="Prossima Data Ricorrenza"
                            name="recurringDate"
                            value={formData.recurringDate}
                            onChange={handleChange}
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-surface/95 backdrop-blur-sm pb-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                      >
                        Annulla
                      </Button>
                      <Button type="submit" className="flex-1">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Salva Modifiche
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
