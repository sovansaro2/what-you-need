export const formatMoney = (amount: number): string => {
  if (amount === undefined || amount === null) return '0 ៛';
  const formatted = new Intl.NumberFormat('km-KH', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ៛`;
};
