import { appEventBus } from '@/core/events';

export const dashboardEvents = {
  /**
   * Subscribe to all events that require a Dashboard refresh.
   * Returns an unsubscribe cleanup function.
   */
  subscribeToDashboardEvents(onRefresh: () => void): () => void {
    const unsubSaleCreated = appEventBus.on('sale:created', () => onRefresh());
    const unsubStockUpdated = appEventBus.on('stock:updated', () => onRefresh());
    const unsubStockLow = appEventBus.on('stock:low_alert', () => onRefresh());
    const unsubTxCreated = appEventBus.on('finance:transaction_created', () => onRefresh());
    const unsubTxUpdated = appEventBus.on('finance:transaction_updated', () => onRefresh());
    const unsubTxDeleted = appEventBus.on('finance:transaction_deleted', () => onRefresh());
    const unsubProdCreated = appEventBus.on('product:created', () => onRefresh());
    const unsubProdUpdated = appEventBus.on('product:updated', () => onRefresh());
    const unsubProdDeleted = appEventBus.on('product:deleted', () => onRefresh());

    return () => {
      unsubSaleCreated();
      unsubStockUpdated();
      unsubStockLow();
      unsubTxCreated();
      unsubTxUpdated();
      unsubTxDeleted();
      unsubProdCreated();
      unsubProdUpdated();
      unsubProdDeleted();
    };
  },
};
