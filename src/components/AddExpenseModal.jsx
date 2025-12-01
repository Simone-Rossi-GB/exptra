import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { X, Plus, ShoppingBag, Coffee, Car, Home, Zap, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { value: 'groceries', label: 'Spesa', icon: ShoppingBag },
  { value: 'food', label: 'Ristoranti', icon: Coffee },
  { value: 'transport', label: 'Trasporti', icon: Car },
  { value: 'home', label: 'Casa', icon: Home },
  { value: 'utilities', label: 'Bollette', icon: Zap },
  { value: 'entertainment', label: 'Svago', icon: Smartphone },
];

export function AddExpenseModal({ isOpen, onClose, onAddExpense }) {
  const [formData, setFormData] = useState({
    descrizione: "",
    importo: "",
    categoria: "groceries",
    data: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.descrizione || !formData.importo) {
      return;
    }

    onAddExpense({
      ...formData,
      importo: parseFloat(formData.importo),
      id: Date.now().toString()
    });

    setFormData({
      descrizione: "",
      importo: "",
      categoria: "groceries",
      data: new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
              className="w-full max-w-lg"
            >
              <Card className="shadow-2xl">
                <CardHeader className="border-b border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" />
                      Aggiungi Spesa
                    </CardTitle>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-surface-light transition-colors text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Descrizione
                      </label>
                      <Input
                        name="descrizione"
                        value={formData.descrizione}
                        onChange={handleChange}
                        placeholder="Es: Spesa al supermercato"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Importo (€)
                        </label>
                        <Input
                          type="number"
                          name="importo"
                          value={formData.importo}
                          onChange={handleChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Data
                        </label>
                        <Input
                          type="date"
                          name="data"
                          value={formData.data}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Categoria
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {categories.map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = formData.categoria === cat.value;

                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, categoria: cat.value }))}
                              className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-300'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="text-xs font-medium">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                      >
                        Annulla
                      </Button>
                      <Button type="submit" className="flex-1">
                        <Plus className="w-4 h-4 mr-2" />
                        Aggiungi
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
