import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { CreditCard as CreditCardComponent } from "../components/CreditCard.jsx";
import { AddCardModal } from "../components/AddCardModal.jsx";
import { EditCardModal } from "../components/EditCardModal.jsx";
import { SelectDefaultCardModal } from "../components/SelectDefaultCardModal.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { Plus, CreditCard, Trash2, Edit2, Wallet as WalletIcon, ShoppingBag, Coffee, Car, Home, Zap, Smartphone, Plane, Heart, Book, Dumbbell, PawPrint, Music, Gamepad2, Film, UtensilsCrossed, Shirt, Package, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { cardService, expensesService, categoriesService } from "../lib/pocketBase.js";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "../components/ui/toast.jsx";
import { useCurrency } from "../hooks/useCurrency.js";

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

export function Wallet() {
  const toast = useToast();
  const { format: formatCurrency } = useCurrency();

  // State per le carte
  const [cards, setCards] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [defaultCardId, setDefaultCardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isSelectDefaultCardModalOpen, setIsSelectDefaultCardModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  // useEffect: carica le carte da PocketBase all'avvio
  useEffect(() => {
    console.log('Wallet useEffect: Loading cards on mount');
    loadCards();
  }, []); // Array vuoto = esegui solo una volta all'avvio

  // Funzione per caricare le carte da PocketBase
  const loadCards = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      console.log('Wallet: Checking authentication...');
      const [records, fetchedExpenses, fetchedCategories] = await Promise.all([
        cardService.getAll(),
        expensesService.getAll(),
        categoriesService.getAll()
      ]);

      console.log('Loaded cards from PocketBase:', records);
      console.log('Number of cards:', records.length);

      // Trasforma i dati da PocketBase al formato del componente CreditCard
      const formattedCards = records.map(record => ({
        id: record.id,
        number: `•••• •••• •••• ${record.last_four_digits}`,
        holder: record.card_holder,
        expiration: record.expiration_date,
        type: record.payment_circuit,     // visa, mastercard, amex, maestro
        variant: record.color_variant || 'gradient-purple',
        lastFourDigits: record.last_four_digits,
        isDefault: record.isDefault || false
      }));

      console.log('Formatted cards for UI:', formattedCards);

      // Find and set default card
      const defaultCard = formattedCards.find(c => c.isDefault);
      if (defaultCard) {
        console.log('Default card found:', defaultCard.id);
        setDefaultCardId(defaultCard.id);
      } else {
        console.log('No default card found');
      }

      setCards(formattedCards);
      setExpenses(fetchedExpenses);
      setCategories(fetchedCategories);
      setError(null);
    } catch (err) {
      console.error('Error loading cards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Funzione chiamata quando si aggiunge una carta
  const handleAddCard = (cardData) => {
    console.log('handleAddCard received:', cardData);

    // Aggiungi la carta allo stato locale
    setCards(prev => {
      const newCards = [cardData, ...prev];
      console.log('Updated cards state:', newCards);
      return newCards;
    });

    setIsAddCardModalOpen(false);
  };

  // Apri dialog conferma eliminazione
  const handleDeleteCardClick = (card) => {
    console.log('Wallet.jsx:125 - Apertura dialog conferma eliminazione per carta:', card.id);
    setCardToDelete(card);
    setIsDeleteDialogOpen(true);
  };

  // Funzione per eliminare una carta (chiamata dopo conferma)
  const handleDeleteCardConfirmed = async () => {
    if (!cardToDelete) {
      console.log('Wallet.jsx:133 - Nessuna carta da eliminare');
      return;
    }

    const id = cardToDelete.id;
    console.log('Wallet.jsx:138 - Inizio eliminazione carta confermata:', id);

    try {
      await cardService.delete(id);
      console.log('Wallet.jsx:142 - Carta eliminata da PocketBase con successo');
    } catch (err) {
      // Se l'errore è auto-cancellation, ignoriamolo - la richiesta è andata comunque a buon fine
      if (err.isAbort || err.message?.includes('autocancelled')) {
        console.log('Wallet.jsx:146 - Richiesta auto-cancellata ma carta eliminata');
      } else {
        console.error('Wallet.jsx:148 - ERRORE eliminazione carta:', err);
        toast.error('Errore nell\'eliminazione della carta: ' + err.message, { duration: 5000 });
        return; // Esci senza aggiornare lo stato
      }
    }

    // SEMPRE aggiorna lo stato locale (anche in caso di auto-cancellation)
    console.log('Wallet.jsx:155 - Aggiornamento stato locale');

    // Rimuovi dallo stato locale
    setCards(prev => {
      const newCards = prev.filter(c => c.id !== id);
      console.log('Wallet.jsx:160 - Carte rimanenti:', newCards.length);
      return newCards;
    });

    // Se era la carta selezionata, deseleziona
    if (selectedCard === id) {
      console.log('Wallet.jsx:166 - Carta eliminata era selezionata, deseleziono');
      setSelectedCard(null);
    }

    // Se era la carta di default, reset default
    if (defaultCardId === id) {
      console.log('Wallet.jsx:172 - Carta eliminata era default, resetto default');
      setDefaultCardId(null);
    }

    console.log('Wallet.jsx:176 - Mostro toast successo');
    toast.success('Carta eliminata con successo', { duration: 3000 });

    // Reset stato
    setCardToDelete(null);
  };

  // Funzione per modificare una carta
  const handleEditCard = (card) => {
    setEditingCard(card);
    setIsEditCardModalOpen(true);
  };

  // Funzione chiamata quando si aggiorna una carta
  const handleUpdateCard = (updatedCard) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    setIsEditCardModalOpen(false);
    setEditingCard(null);
  };

  // Filter expenses by selected card (only card payment method)
  const cardExpenses = useMemo(() => {
    if (!selectedCard) return [];
    const card = cards.find(c => c.id === selectedCard);
    if (!card) return [];

    // Filter expenses with paymentMethod === 'card' and matching card number
    // Note: We'll need to check against the card's last 4 digits
    return expenses.filter(e => e.paymentMethod === 'card');
  }, [expenses, selectedCard, cards]);

  const getIconComponent = (iconName) => ICON_MAP[iconName] || Package;

  const getCategoryInfo = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat || {
      name: 'Altro',
      icon: 'Package',
      color: '#6b7280'
    };
  };

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-400">Caricamento carte...</p>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500 dark:text-red-400">Errore: {error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-gray-600 dark:text-gray-400">Gestisci le tue carte di pagamento</p>
        </div>

        <div className="space-y-8">
        {/* First Row: Add Card Button + Non-Default Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Card Button - FIRST (on the left) */}
          {cards.length < 3 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              onClick={() => setIsAddCardModalOpen(true)}
              className="w-full max-w-[320px] mx-auto h-[192px] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary transition-all bg-gray-100 dark:bg-surface/30 hover:bg-gray-200 dark:hover:bg-surface/50 flex flex-col items-center justify-center gap-3 group"
            >
              <Plus className="w-12 h-12 text-gray-500 dark:text-gray-600 group-hover:text-primary transition-colors" />
              <p className="text-gray-600 dark:text-gray-500 group-hover:text-primary transition-colors font-medium">
                Aggiungi Nuova Carta
              </p>
            </motion.button>
          )}

          {/* Non-default cards */}
          {cards.filter(c => c.id !== defaultCardId).map((card, index) => {
            console.log('Rendering non-default card:', card);
            const isSelected = selectedCard === card.id;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 1) * 0.1 }}
                className="relative group w-full max-w-[320px] mx-auto cursor-pointer"
                onClick={() => setSelectedCard(card.id)}
              >
                <div className={`transition-all ${isSelected ? 'ring-4 ring-primary rounded-2xl' : ''}`}>
                  <CreditCardComponent
                    variant={card.variant}
                    cardNumber={card.number}
                    cardHolder={card.holder}
                    cardExpiration={card.expiration}
                    company={card.type ? card.type.toUpperCase() : 'VISA'}
                    width="100%"
                  />
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCard(card);
                    }}
                    className="p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      console.log('Wallet.jsx:273 - PULSANTE ELIMINA CLICCATO', card.id);
                      e.stopPropagation();
                      handleDeleteCardClick(card);
                    }}
                    className="p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-red-500/70 transition-colors text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Max cards warning */}
          {cards.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full"
            >
              <p className="text-center text-sm text-gray-600 dark:text-gray-500">
                Hai raggiunto il limite massimo di 3 carte
              </p>
            </motion.div>
          )}
        </div>

        {/* Second Row: Default Card + Select Default Button + Monthly Spending */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Default Card Display */}
          <div className="md:col-span-1">
            {defaultCardId && cards.find(c => c.id === defaultCardId) ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group w-full max-w-[320px] mx-auto cursor-pointer"
                onClick={() => setSelectedCard(defaultCardId)}
              >
                <div className="mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Carta Default</p>
                </div>
                <div className={`transition-all`}>
                  {(() => {
                    const defaultCard = cards.find(c => c.id === defaultCardId);
                    return (
                      <CreditCardComponent
                        variant={defaultCard.variant}
                        cardNumber={defaultCard.number}
                        cardHolder={defaultCard.holder}
                        cardExpiration={defaultCard.expiration}
                        company={defaultCard.type ? defaultCard.type.toUpperCase() : 'VISA'}
                        width="100%"
                      />
                    );
                  })()}
                </div>
                <div className="absolute top-10 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const defaultCard = cards.find(c => c.id === defaultCardId);
                      handleEditCard(defaultCard);
                    }}
                    className="p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const defaultCard = cards.find(c => c.id === defaultCardId);
                      if (defaultCard) handleDeleteCardClick(defaultCard);
                    }}
                    className="p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-red-500/70 transition-colors text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                  <CreditCard className="w-12 h-12 text-gray-500 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-700 dark:text-gray-400 text-center">Nessuna carta default</p>
                  <p className="text-xs text-gray-600 dark:text-gray-500 text-center mt-1">Seleziona una carta come predefinita</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Select Default Card Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
          >
            <div className="h-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary transition-all bg-gray-100 dark:bg-surface/30 hover:bg-gray-200 dark:hover:bg-surface/50 flex flex-col items-center justify-center gap-3 p-6 cursor-pointer group min-h-[200px]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (cards.length === 0) {
                  toast.warning('Aggiungi prima una carta per selezionare quella di default!', { duration: 5000 });
                } else {
                  setIsSelectDefaultCardModalOpen(true);
                }
              }}
            >
              <CreditCard className="w-12 h-12 text-gray-500 dark:text-gray-600 group-hover:text-primary transition-colors" />
              <p className="text-gray-600 dark:text-gray-500 group-hover:text-primary transition-colors font-medium text-sm text-center">
                Seleziona Carta Default
              </p>
            </div>
          </motion.div>

          {/* Monthly Spending */}
          <Card>
            <CardContent className="p-6 flex flex-col justify-center min-h-[200px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Spese Questo Mese</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(expenses.filter(e => {
                    const expenseDate = new Date(e.date);
                    const now = new Date();
                    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
                  }).reduce((sum, e) => sum + e.amount, 0))}</p>
                </div>
                <WalletIcon className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions with this card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Transazioni Recenti con Carta</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCard ? (
              <p className="text-gray-600 dark:text-gray-500 text-center py-8">
                Seleziona una carta per vedere le transazioni
              </p>
            ) : cardExpenses.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-500 text-center py-8">
                Nessuna transazione con questa carta
              </p>
            ) : (
              <div className="space-y-2">
                {cardExpenses.slice(0, 10).map((expense, index) => {
                  const category = getCategoryInfo(expense.category);
                  const IconComponent = getIconComponent(category.icon);

                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-surface/50 transition-colors"
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {expense.title || expense.description || category.name || 'Spesa'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(expense.date), 'dd MMM yyyy', { locale: it })}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-500 dark:text-red-400">
                          -{formatCurrency(expense.amount)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-500">{category.name}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onAddCard={handleAddCard}
      />

      {/* Edit Card Modal */}
      <EditCardModal
        isOpen={isEditCardModalOpen}
        onClose={() => {
          setIsEditCardModalOpen(false);
          setEditingCard(null);
        }}
        onUpdateCard={handleUpdateCard}
        card={editingCard}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCardToDelete(null);
        }}
        onConfirm={handleDeleteCardConfirmed}
        title="Elimina Carta"
        message={`Sei sicuro di voler eliminare la carta ${cardToDelete?.number}? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        isDangerous={true}
      />

      {/* Select Default Card Modal */}
      <SelectDefaultCardModal
        isOpen={isSelectDefaultCardModalOpen}
        onClose={() => setIsSelectDefaultCardModalOpen(false)}
        cards={cards}
        selectedCardId={defaultCardId}
        onSelectCard={async (cardId) => {
          try {
            console.log('Setting default card:', cardId);

            // Update all cards: set new default to true, others to false
            const updatePromises = cards.map(async (card) => {
              const isDefault = card.id === cardId;
              console.log(`Updating card ${card.id}: isDefault=${isDefault}`);

              // Update in PocketBase
              await cardService.update(card.id, {
                circuit: card.type,
                type: 'debit', // Default type
                holder: card.holder,
                expiration: card.expiration,
                variant: card.variant,
                isDefault: isDefault
              });

              return { ...card, isDefault };
            });

            await Promise.all(updatePromises);
            console.log('All cards updated successfully');

            // Update local state
            setDefaultCardId(cardId);
            setCards(prev => prev.map(c => ({
              ...c,
              isDefault: c.id === cardId
            })));

            toast.success('La carta selezionata è ora la tua carta predefinita', { duration: 3000 });
          } catch (err) {
            console.error('Error setting default card:', err);
            toast.error('Errore nell\'impostare la carta default: ' + err.message, { duration: 5000 });
          }
        }}
      />
    </AppLayout>
  );
}
