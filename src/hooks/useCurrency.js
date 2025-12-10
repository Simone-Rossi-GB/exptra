import { useAuth } from '../contexts/AuthContext.jsx';
import { convertCurrency, formatCurrency, getCurrencySymbol } from '../utils/currency.js';

/**
 * Hook to handle currency conversion and formatting based on user preferences
 * @returns {Object} Currency utilities
 */
export function useCurrency() {
  const { user } = useAuth();

  // Get user's preferred currency from their preferences (defaults to EUR)
  const userCurrency = user?.preferences?.currency || 'EUR';

  /**
   * Convert an amount to the user's preferred currency
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency (defaults to EUR)
   * @returns {number} Converted amount
   */
  const convert = (amount, fromCurrency = 'EUR') => {
    return convertCurrency(amount, fromCurrency, userCurrency);
  };

  /**
   * Format an amount in the user's preferred currency
   * @param {number} amount - Amount to format
   * @param {string} sourceCurrency - Source currency (defaults to EUR)
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted amount with symbol
   */
  const format = (amount, sourceCurrency = 'EUR', decimals = 2) => {
    const convertedAmount = convertCurrency(amount, sourceCurrency, userCurrency);
    return formatCurrency(convertedAmount, userCurrency, decimals);
  };

  /**
   * Get the user's currency symbol
   * @returns {string} Currency symbol
   */
  const symbol = getCurrencySymbol(userCurrency);

  return {
    userCurrency,
    convert,
    format,
    symbol,
  };
}
