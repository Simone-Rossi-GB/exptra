import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Plus,
  Edit2,
  Trash2,
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
import { motion, AnimatePresence } from "framer-motion";

// Icone disponibili per le categorie
const AVAILABLE_ICONS = [
  { name: 'ShoppingBag', component: ShoppingBag },
  { name: 'Coffee', component: Coffee },
  { name: 'Car', component: Car },
  { name: 'Home', component: Home },
  { name: 'Zap', component: Zap },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Plane', component: Plane },
  { name: 'Heart', component: Heart },
  { name: 'Book', component: Book },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'PawPrint', component: PawPrint },
  { name: 'Music', component: Music },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'Film', component: Film },
  { name: 'UtensilsCrossed', component: UtensilsCrossed },
  { name: 'Shirt', component: Shirt },
  { name: 'Package', component: Package },
];

// Colori predefiniti
const PRESET_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#f97316', '#ec4899',
  '#6366f1', '#14b8a6', '#84cc16', '#f43f5e',
];

export function CategoryManager({ isOpen, onClose, categories, onAddCategory, onUpdateCategory, onDeleteCategory }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    icon: 'ShoppingBag',
    colore: '#3b82f6'
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) return;

    if (editingId) {
      onUpdateCategory(editingId, formData);
      setEditingId(null);
    } else {
      onAddCategory({
        ...formData,
        id: Date.now().toString()
      });
    }

    setFormData({ nome: '', icon: 'ShoppingBag', colore: '#3b82f6' });
    setIsAdding(false);
  };

  const handleEdit = (category) => {
    setFormData({
      nome: category.nome,
      icon: category.icon,
      colore: category.colore
    });
    setEditingId(category.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setFormData({ nome: '', icon: 'ShoppingBag', colore: '#3b82f6' });
    setEditingId(null);
    setIsAdding(false);
  };

  const getIconComponent = (iconName) => {
    const icon = AVAILABLE_ICONS.find(i => i.name === iconName);
    return icon ? icon.component : ShoppingBag;
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
                      <Package className="w-5 h-5 text-primary" />
                      Gestisci Categorie
                    </CardTitle>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-surface-light transition-colors text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="space-y-6 mt-6">
                    {/* Lista Categorie */}
                    <div className="space-y-3">
                      {categories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <motion.div
                            key={category.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-surface/50 border border-gray-800/50 hover:border-gray-700 transition-colors"
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: category.colore + '20' }}
                            >
                              <IconComponent
                                className="w-5 h-5"
                                style={{ color: category.colore }}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-white">{category.nome}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(category)}
                                className="p-2 rounded-lg hover:bg-surface-light transition-colors text-gray-400 hover:text-white"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteCategory(category.id)}
                                className="p-2 rounded-lg hover:bg-surface-light transition-colors text-gray-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Form Aggiungi/Modifica */}
                    {isAdding ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-800/50 pt-6"
                      >
                        <h3 className="text-lg font-semibold text-white mb-4">
                          {editingId ? 'Modifica Categoria' : 'Nuova Categoria'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          {/* Nome */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                              Nome Categoria
                            </label>
                            <Input
                              value={formData.nome}
                              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                              placeholder="Es: Abbonamenti"
                              required
                              autoFocus
                            />
                          </div>

                          {/* Icona */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                              Icona
                            </label>
                            <div className="grid grid-cols-6 gap-2">
                              {AVAILABLE_ICONS.map((icon) => {
                                const IconComp = icon.component;
                                const isSelected = formData.icon === icon.name;
                                return (
                                  <button
                                    key={icon.name}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, icon: icon.name }))}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                      isSelected
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                  >
                                    <IconComp className="w-5 h-5 mx-auto text-gray-300" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Colore */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                              Colore
                            </label>
                            <div className="grid grid-cols-6 gap-2">
                              {PRESET_COLORS.map((color) => {
                                const isSelected = formData.colore === color;
                                return (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, colore: color }))}
                                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                      isSelected
                                        ? 'border-white scale-110'
                                        : 'border-transparent hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: color }}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          {/* Bottoni */}
                          <div className="flex gap-3 pt-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={handleCancel}
                              className="flex-1"
                            >
                              Annulla
                            </Button>
                            <Button type="submit" className="flex-1">
                              {editingId ? 'Salva' : 'Aggiungi'}
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    ) : (
                      <Button
                        onClick={() => setIsAdding(true)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuova Categoria
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
