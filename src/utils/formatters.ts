export const formatCurrency = (value: number, currencySymbol: string = '$'): string => {
  if (currencySymbol === '៛') {
    const khrFormatted = new Intl.NumberFormat('km-KH', {
      maximumFractionDigits: 0,
    }).format(value);
    return `${khrFormatted} ៛`;
  }

  const usdFormatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `$${usdFormatted}`;
};

export const formatDateKhmer = (dateString?: string): string => {
  if (!dateString) return 'ថ្មីៗ';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('km-KH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};
