import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { X, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cardService } from "../lib/pocketBase";

const CARD_VARIANTS = [
  { value: 'gradient-purple', label: 'Purple Gradient' },
  { value: 'gradient-blue', label: 'Blue Gradient' },
  { value: 'gradient-green', label: 'Green Gradient' },
  { value: 'gradient-orange', label: 'Orange Gradient' },
  { value: 'gradient-pink', label: 'Pink Gradient' },
];

const CARD_CIRCUIT = [
  { value: 'visa', label: 'VISA' },
  { value: 'mastercard', label: 'MASTERCARD' },
  { value: 'amdex', label: 'American Express' },
  { value: 'maestro', label: 'Maestro' },
];

const CARD_TYPES = [
  { value: 'credit', label: 'Credito' },
  { value: 'debit', label: 'Debito' },
];

export function AddCardModal({ isOpen, onClose, onAddCard }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    holder: "",
    expiration: "",
    circuit: "visa",      // payment_circuit in PocketBase
    type: "debit",        // card_type in PocketBase
    variant: "gradient-purple",
    isDefault: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    // Validate card number (last 4 digits)
    if (formData.number.length !== 4) {
      alert("Inserisci le ultime 4 cifre della carta");
      return;
    }

    // Validate expiration format MM/YY
    const expirationRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expirationRegex.test(formData.expiration)) {
      alert("Formato scadenza non valido. Usa MM/YY");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to PocketBase first
      const record = await cardService.create(formData);
      console.log('Card saved to database:', record.id);

      // Create masked card number for UI
      const maskedNumber = `•••• •••• •••• ${formData.number}`;

      // Call parent callback with the complete card data INCLUDING id from PocketBase
      // Format data to match Wallet.jsx expectations
      onAddCard({
        id: record.id,
        number: maskedNumber,
        holder: record.card_holder,
        expiration: record.expiration_date,
        type: record.payment_circuit,     // payment_circuit (visa, mastercard) -> used for company prop
        variant: record.color_variant
      });

      // Close modal
      onClose();

      // Reset form
      setFormData({
        number: "",
        holder: "",
        expiration: "",
        circuit: "visa",
        type: "debit",
        variant: "gradient-purple",
        isDefault: false
      });

      alert('✅ Carta aggiunta con successo!');
    } catch (error) {
      console.error('Error saving card:', error);
      alert('❌ Errore nel salvare la carta: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="bg-surface border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-primary" />
                  Aggiungi Nuova Carta
                </CardTitle>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-light transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Card Number (last 4 digits) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Ultime 4 Cifre della Carta *
                    </label>
                    <Input
                      type="text"
                      value={formData.number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setFormData(prev => ({ ...prev, number: value }));
                      }}
                      placeholder="4242"
                      required
                      maxLength={4}
                      className="text-lg tracking-wider"
                    />
                    <p className="text-xs text-gray-500">
                      Per sicurezza, inseriamo solo le ultime 4 cifre
                    </p>
                  </div>

                  {/* Card Holder */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Intestatario Carta *
                    </label>
                    <Input
                      type="text"
                      value={formData.holder}
                      onChange={(e) => setFormData(prev => ({ ...prev, holder: e.target.value }))}
                      placeholder="MARIO ROSSI"
                      required
                      className="uppercase"
                    />
                  </div>

                  {/* Expiration Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Scadenza (MM/YY) *
                    </label>
                    <Input
                      type="text"
                      value={formData.expiration}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setFormData(prev => ({ ...prev, expiration: value }));
                      }}
                      placeholder="12/25"
                      required
                      maxLength={5}
                    />
                  </div>

                  {/* Card Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Tipo Carta *
                    </label>
                    <Select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      options={CARD_TYPES}
                      placeholder="Seleziona tipo carta"
                      required
                    />

                  </div>

                  {/* Card Circuit */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Circuito Carta *
                    </label>
                    <Select
                      value={formData.circuit}
                      onChange={(e) => setFormData(prev => ({ ...prev, circuit: e.target.value }))}
                      options={CARD_CIRCUIT}
                      placeholder="Seleziona circuito carta"
                      required
                    />
                  </div>

                  {/* Card Variant (Color) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Colore Carta
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {CARD_VARIANTS.map((variant) => (
                        <button
                          key={variant.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, variant: variant.value }))}
                          className={`h-12 rounded-lg border-2 transition-all ${
                            formData.variant === variant.value
                              ? 'border-primary scale-105'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                          style={{
                            background: variant.value === 'gradient-purple' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                                       variant.value === 'gradient-blue' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' :
                                       variant.value === 'gradient-green' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' :
                                       variant.value === 'gradient-orange' ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' :
                                       'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Aggiungendo...' : 'Aggiungi Carta'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Annulla
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
