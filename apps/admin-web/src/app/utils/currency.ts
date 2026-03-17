/**
 * Formats a number as Euro currency
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string in Euros
 */
export const formatCurrency = (
  amount: number | string, 
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  } = {}
): string => {
  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle invalid numbers
  if (!numericAmount || isNaN(numericAmount) || !isFinite(numericAmount)) {
    return '€0';
  }
  
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    locale = 'de-DE'
  } = options;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(numericAmount);
  } catch (error) {
    console.error('Error formatting currency:', error, numericAmount);
    return `€${Math.round(numericAmount).toLocaleString()}`;
  }
};

/**
 * Formats a number as Euro currency with decimal places
 * @param amount - The amount to format
 * @returns Formatted currency string with 2 decimal places
 */
export const formatCurrencyWithDecimals = (amount: number | string): string => {
  return formatCurrency(amount, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Formats a number as Euro currency for display in tables (compact format)
 * @param amount - The amount to format
 * @returns Formatted currency string optimized for table display
 */
export const formatCurrencyCompact = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (!numericAmount || isNaN(numericAmount) || !isFinite(numericAmount)) {
    return '€0';
  }

  // For large amounts, use compact notation
  if (numericAmount >= 1000000) {
    return `€${(numericAmount / 1000000).toFixed(1)}M`;
  } else if (numericAmount >= 1000) {
    return `€${(numericAmount / 1000).toFixed(0)}K`;
  }
  
  return formatCurrency(amount);
};
