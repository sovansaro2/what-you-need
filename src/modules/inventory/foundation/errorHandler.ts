export class InventoryError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string = 'INVENTORY_ERROR', details?: any) {
    super(message);
    this.name = 'InventoryError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, InventoryError.prototype);
  }
}

export function handleInventoryError(err: any, contextMessage: string): never {
  console.error(`[Inventory Error - ${contextMessage}]:`, err);

  if (err instanceof InventoryError) {
    throw err;
  }

  const rawMessage = err?.message || String(err);
  throw new InventoryError(
    `[${contextMessage}] ${rawMessage}`,
    err?.code || 'DATABASE_ERROR',
    err
  );
}
