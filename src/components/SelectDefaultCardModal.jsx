import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CreditCard as CreditCardIcon, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard as CreditCardComponent } from "./CreditCard.jsx";

export function SelectDefaultCardModal({ isOpen, onClose, cards, selectedCardId, onSelectCard }) {
  const [tempSelectedCardId, setTempSelectedCardId] = useState(selectedCardId);

  // Update temp selection when modal opens with new selectedCardId
  useEffect(() => {
    if (isOpen) {
      setTempSelectedCardId(selectedCardId);
    }
  }, [isOpen, selectedCardId]);

  const handleConfirm = () => {
    if (tempSelectedCardId) {
      onSelectCard(tempSelectedCardId);
      onClose();
    }
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
                      <CreditCardIcon className="w-5 h-5 text-primary" />
                      Seleziona Carta Default
                    </CardTitle>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-surface-light transition-colors text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
                  {cards.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCardIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Nessuna carta disponibile</p>
                      <p className="text-sm text-gray-500 mt-2">Aggiungi prima una carta dalla sezione Wallet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-400 mb-4">
                        Seleziona la carta che vuoi usare come predefinita per i pagamenti
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cards.map((card) => {
                          const isSelected = tempSelectedCardId === card.id;
                          return (
                            <motion.div
                              key={card.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setTempSelectedCardId(card.id)}
                              className={`relative cursor-pointer rounded-2xl transition-all ${
                                isSelected ? 'ring-4 ring-primary' : 'hover:ring-2 hover:ring-gray-700'
                              }`}
                            >
                              <CreditCardComponent
                                variant={card.variant}
                                cardNumber={card.number}
                                cardHolder={card.holder}
                                cardExpiration={card.expiration}
                                company={card.type ? card.type.toUpperCase() : 'VISA'}
                                width="100%"
                              />
                              {isSelected && (
                                <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-1.5">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="flex gap-3 pt-4 sticky bottom-0 bg-surface/95 backdrop-blur-sm">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={onClose}
                          className="flex-1"
                        >
                          Annulla
                        </Button>
                        <Button
                          onClick={handleConfirm}
                          className="flex-1"
                          disabled={!tempSelectedCardId}
                        >
                          Conferma
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
