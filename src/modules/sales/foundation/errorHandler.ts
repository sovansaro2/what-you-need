export function handleSalesError(error: any, context: string): never {
  const message = error?.message || (typeof error === 'string' ? error : 'An unexpected sales error occurred');
  console.error(`[${context}] Error:`, error);
  throw new Error(message);
}
