import { appEventBus } from '@/core/events';
import { Transaction } from '../types';

export const financeEvents = {
  emitTransactionCreated(transaction: Transaction, businessId: string): void {
    appEventBus.emit('finance:transaction_created', {
      transactionId: transaction.id,
      businessId,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category?.name || 'General',
      note: transaction.note || undefined,
      date: transaction.transaction_date,
    });
  },

  emitTransactionUpdated(transaction: Transaction, businessId: string): void {
    appEventBus.emit('finance:transaction_updated', {
      transactionId: transaction.id,
      businessId,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category?.name || 'General',
      note: transaction.note || undefined,
      date: transaction.transaction_date,
    });
  },

  emitTransactionDeleted(transactionId: string, businessId: string): void {
    appEventBus.emit('finance:transaction_deleted', {
      transactionId,
      businessId,
    });
  },
};
