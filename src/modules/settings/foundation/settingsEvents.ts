import { appEventBus } from '@/core/events';

export const settingsEvents = {
  emitSettingsUpdated(businessId: string, settings: Record<string, any>): void {
    appEventBus.emit('settings:updated', {
      businessId,
      settings,
      timestamp: new Date().toISOString(),
    });
  },

  emitBusinessUpdated(
    businessId: string,
    businessData: { businessName: string; logoUrl?: string; phone?: string; email?: string; address?: string }
  ): void {
    appEventBus.emit('business:updated', {
      businessId,
      ...businessData,
      timestamp: new Date().toISOString(),
    });
  },

  emitProfileUpdated(userId: string, profileData: { fullName?: string; phone?: string }): void {
    appEventBus.emit('profile:updated', {
      userId,
      ...profileData,
      timestamp: new Date().toISOString(),
    });
  },

  subscribeToSettingsChanges(onUpdate: () => void): () => void {
    const unsub1 = appEventBus.on('settings:updated', () => onUpdate());
    const unsub2 = appEventBus.on('business:updated', () => onUpdate());
    const unsub3 = appEventBus.on('profile:updated', () => onUpdate());

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  },
};
