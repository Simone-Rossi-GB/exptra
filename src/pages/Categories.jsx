import { useState, useEffect } from "react";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import pb, { categoriesService } from "../lib/pocketBase.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import {
  Package,
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
} from "lucide-react";
import { motion } from "framer-motion";

// Available icons for categories
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

// Preset colors for categories
const PRESET_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#f97316', '#ec4899',
  '#6366f1', '#14b8a6', '#84cc16', '#f43f5e',
];

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'ShoppingBag',
    color: '#3b82f6'
  });

  /**
   * Fetch categories from PocketBase on component mount
   */
  useEffect(() => {
    console.log('Categories: Component mounted, fetching categories');
    fetchCategories();
  }, []);

  /**
   * Fetch all categories from database
   */
  const fetchCategories = async () => {
    try {
      console.log('Categories: Fetching categories from PocketBase');
      const fetchedCategories = await categoriesService.getAll();
      console.log('Categories: Fetched', fetchedCategories.length, 'categories');

      // If no categories exist, create default ones
      if (fetchedCategories.length === 0) {
        console.log('Categories: No categories found, creating default categories');
        try {
          const userID = pb.authStore.model?.id;
          if (userID) {
            await categoriesService.createDefaultCategories(userID);
            const newCategories = await categoriesService.getAll();
            console.log('Categories: Created', newCategories.length, 'default categories');
            setCategories(newCategories);
          }
        } catch (catError) {
          console.error('Categories: Error creating default categories', catError);
          setCategories(fetchedCategories);
        }
      } else {
        setCategories(fetchedCategories);
      }
    } catch (error) {
      console.error('Categories: Error fetching categories', error);
      alert('Errore nel caricamento delle categorie');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form submission (create or update)
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Categories: Form submitted', editingId ? 'update' : 'create');

    if (!formData.name.trim()) {
      console.warn('Categories: Empty category name');
      return;
    }

    try {
      if (editingId) {
        // Update existing category
        console.log('Categories: Updating category', editingId);
        const updated = await categoriesService.update(editingId, formData);
        setCategories(prev => prev.map(cat => cat.id === editingId ? updated : cat));
        console.log('Categories: Category updated successfully');
      } else {
        // Create new category
        console.log('Categories: Creating new category');
        const created = await categoriesService.create(formData);
        setCategories(prev => [...prev, created]);
        console.log('Categories: Category created successfully');
      }

      // Reset form
      setFormData({ name: '', description: '', icon: 'ShoppingBag', color: '#3b82f6' });
      setIsAdding(false);
      setEditingId(null);
    } catch (error) {
      console.error('Categories: Error saving category', error);
      alert('Errore nel salvataggio della categoria');
    }
  };

  /**
   * Handle edit button click
   * @param {Object} category - Category to edit
   */
  const handleEdit = (category) => {
    console.log('Categories: Editing category', category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color
    });
    setEditingId(category.id);
    setIsAdding(true);
  };

  /**
   * Handle delete button click
   * @param {string} id - Category ID to delete
   */
  const handleDelete = async (id) => {
    console.log('Categories: Attempting to delete category', id);

    if (!confirm('Sei sicuro di voler eliminare questa categoria?')) {
      console.log('Categories: Delete cancelled by user');
      return;
    }

    try {
      console.log('Categories: Deleting category from PocketBase');
      await categoriesService.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      console.log('Categories: Category deleted successfully');
    } catch (error) {
      console.error('Categories: Error deleting category', error);
      alert('Errore nell\'eliminazione della categoria');
    }
  };

  /**
   * Get icon component by name
   * @param {string} iconName - Name of the icon
   * @returns {React.Component} Icon component
   */
  const getIconComponent = (iconName) => {
    const icon = AVAILABLE_ICONS.find(i => i.name === iconName);
    return icon ? icon.component : ShoppingBag;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Caricamento categorie...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with add button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400">Gestisci le tue categorie di spesa</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 h-11">
              <Plus className="w-5 h-5" />
              Nuova Categoria
            </Button>
          )}
        </div>

        {/* Add/Edit form */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-surface border-gray-800">
              <CardHeader>
                <CardTitle>{editingId ? 'Modifica Categoria' : 'Nuova Categoria'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Nome Categoria</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Es: Abbonamenti"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Category description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Descrizione (opzionale)</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Es: Servizi in abbonamento mensile"
                    />
                  </div>

                  {/* Icon selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Icona</label>
                    <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
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

                  {/* Color selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Colore</label>
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                      {PRESET_COLORS.map((color) => {
                        const isSelected = formData.color === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                            className={`w-12 h-12 rounded-lg border-2 transition-all ${
                              isSelected ? 'border-white scale-110' : 'border-gray-700'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Form buttons */}
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      {editingId ? 'Salva Modifiche' : 'Crea Categoria'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsAdding(false);
                        setEditingId(null);
                        setFormData({ name: '', description: '', icon: 'ShoppingBag', color: '#3b82f6' });
                      }}
                    >
                      Annulla
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const IconComp = getIconComponent(category.icon);

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group"
              >
                <Card className="bg-surface border-gray-800 hover:border-gray-700 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <IconComp className="w-6 h-6" style={{ color: category.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                          )}
                          {category.isDefault && (
                            <span className="text-xs text-gray-600 mt-1 inline-block">Default</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons - show on hover */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        {!category.isDefault && (
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {categories.length === 0 && (
          <Card className="bg-surface border-gray-800">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nessuna categoria</h3>
              <p className="text-gray-400 mb-6">Inizia creando la tua prima categoria di spesa</p>
              <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Crea Prima Categoria
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
