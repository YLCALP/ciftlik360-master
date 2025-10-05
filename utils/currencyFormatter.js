export const formatCurrency = (value) => {
  // Remove all non-numeric characters except decimal point
  const numericValue = value.replace(/[^0-9,]/g, '');
  
  // Replace comma with dot for decimal separator
  const normalizedValue = numericValue.replace(',', '.');
  
  // Ensure only one decimal point
  const parts = normalizedValue.split('.');
  if (parts.length > 2) {
    return parts[0] + ',' + parts.slice(1).join('');
  }
  
  // Limit decimal places to 2
  if (parts.length === 2 && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2);
  }
  
  // Add thousand separators with dots
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  
  // Use comma as decimal separator (Turkish format)
  return parts.join(',');
};

export const parseCurrency = (formattedValue) => {
  // Remove formatting and return numeric value
  // First remove thousand separators (dots), then replace comma with dot for decimal
  return formattedValue.replace(/\./g, '').replace(',', '.');
};

export const formatCurrencyWithSymbol = (value, symbol = '₺') => {
  const formatted = formatCurrency(value);
  return formatted ? `${formatted} ${symbol}` : '';
};

export const formatCurrencyDisplay = (amount, symbol = '₺') => {
  // Format number with Turkish locale
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${formatted} ${symbol}`;
};