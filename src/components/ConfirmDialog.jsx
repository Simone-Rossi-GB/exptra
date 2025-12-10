import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./ui/button.jsx";

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Conferma", cancelText = "Annulla", isDangerous = false }) {
  if (!isOpen) return null;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-md bg-white dark:bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {isDangerous && (
                      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10">
                        <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-light transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Message */}
                <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="flex-1"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`flex-1 ${isDangerous ? 'bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600' : ''}`}
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
