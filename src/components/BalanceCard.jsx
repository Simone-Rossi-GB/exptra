import { Card } from "@/components/ui/card";
import { CreditCard } from "./CreditCard";
import { Eye, EyeOff, ArrowUpRight, Plus } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

export function BalanceCard({ balance }) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Balance Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2"
      >
        <Card className="relative overflow-hidden bg-gradient-card shadow-glow">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

          <div className="relative p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-sm font-medium text-white/70 uppercase tracking-wider mb-2">
                  Saldo Totale
                </p>
                <h2 className="text-5xl font-bold text-white tracking-tight">
                  {isVisible ? formatCurrency(balance) : '••••••'}
                </h2>
              </div>

              <button
                onClick={() => setIsVisible(!isVisible)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white"
              >
                {isVisible ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <p className="text-xs text-white/60">Carta principale</p>
                <p className="text-sm font-medium text-white">Visa •••• 4242</p>
              </div>

              <button className="px-4 py-2.5 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-all duration-200 flex items-center gap-2 group">
                <span>Dettagli</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Credit Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-4"
      >
        <CreditCard
          variant="gradient-purple"
          cardNumber="•••• •••• •••• 4242"
          cardHolder="MARIO ROSSI"
          cardExpiration="12/25"
          company="VISA"
          width={280}
        />

        <button className="w-full py-3 rounded-xl border-2 border-dashed border-gray-700 hover:border-primary text-gray-400 hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 group">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Aggiungi carta</span>
        </button>
      </motion.div>
    </div>
  );
}
