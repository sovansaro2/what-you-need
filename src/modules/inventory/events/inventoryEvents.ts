export const INVENTORY_UPDATED_EVENT = 'wyn_inventory_updated';

export interface InventoryUpdatedDetail {
  productId?: string;
  movementId?: string;
  isLowStock?: boolean;
  source?: string;
}

export const notifyInventoryUpdated = (detail?: InventoryUpdatedDetail) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<InventoryUpdatedDetail>(INVENTORY_UPDATED_EVENT, { detail })
    );
  }
};
