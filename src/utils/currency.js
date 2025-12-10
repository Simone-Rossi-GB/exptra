// Currency conversion utilities using Frankfurter API
// Fallback exchange rates relative to EUR (in case API fails)
const FALLBACK_RATES = {
  EUR: 1.0,
  USD: 1.09,
  GBP: 0.86,
  JPY: 163.5,
  CHF: 0.94,
};

const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  CHF: 'CHF',
};

// Cache for exchange rates
let EXCHANGE_RATES = { ...FALLBACK_RATES };
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch latest exchange rates from Frankfurter API
 * @returns {Promise<Object>} Exchange rates relative to EUR
 */
async function fetchExchangeRates() {
  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=EUR');
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();

    // Frankfurter returns rates relative to base currency (EUR)
    const rates = {
      EUR: 1.0,
      ...data.rates
    };

    console.log('Currency: Fetched fresh exchange rates from Frankfurter API', rates);
    return rates;
  } catch (error) {
    console.error('Currency: Error fetching exchange rates, using fallback', error);
    return FALLBACK_RATES;
  }
}

/**
 * Get exchange rates (from cache or fetch fresh if cache expired)
 * @returns {Promise<Object>} Exchange rates
 */
async function getExchangeRates() {
  const now = Date.now();

  // Check if cache is still valid
  if (now - lastFetchTime < CACHE_DURATION && EXCHANGE_RATES !== FALLBACK_RATES) {
    return EXCHANGE_RATES;
  }

  // Fetch fresh rates
  const rates = await fetchExchangeRates();
  EXCHANGE_RATES = rates;
  lastFetchTime = now;

  return EXCHANGE_RATES;
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 */
export function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to EUR first, then to target currency
  const amountInEUR = amount / EXCHANGE_RATES[fromCurrency];
  const convertedAmount = amountInEUR * EXCHANGE_RATES[toCurrency];

  return convertedAmount;
}

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted amount with symbol
 */
export function formatCurrency(amount, currency, decimals = 2) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  // For JPY, we typically don't show decimals
  const finalDecimals = currency === 'JPY' ? 0 : decimals;

  const formattedAmount = amount.toFixed(finalDecimals);

  // Format with thousands separator
  const parts = formattedAmount.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const finalAmount = parts.join(',');

  // Symbol placement (EUR uses symbol after, others before)
  if (currency === 'EUR') {
    return `${finalAmount} ${symbol}`;
  } else {
    return `${symbol} ${finalAmount}`;
  }
}

/**
 * Get currency symbol for a currency code
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currency) {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Initialize exchange rates on app startup
 * Call this once when the app starts
 */
export async function initializeExchangeRates() {
  console.log('Currency: Initializing exchange rates...');
  await getExchangeRates();
}

/**
 * Manually refresh exchange rates
 * @returns {Promise<void>}
 */
export async function refreshExchangeRates() {
  lastFetchTime = 0; // Force refresh
  await getExchangeRates();
}

/**
 * Get all available currencies
 * @returns {Array} Array of currency objects
 */
export function getAvailableCurrencies() {
  return [
    { value: 'EUR', label: '€ EUR - Euro', symbol: '€' },
    { value: 'USD', label: '$ USD - Dollaro Americano', symbol: '$' },
    { value: 'GBP', label: '£ GBP - Sterlina', symbol: '£' },
    { value: 'JPY', label: '¥ JPY - Yen', symbol: '¥' },
    { value: 'CHF', label: 'CHF - Franco Svizzero', symbol: 'CHF' },
  ];
}
