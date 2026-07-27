import { ValidationError } from '@/core/errors';

export const settingsContext = {
  resolveBusinessId(providedId?: string | null, fallbackUserId?: string | null): string {
    const id = providedId?.trim() || fallbackUserId?.trim();
    if (!id) {
      throw new ValidationError(
        'Business ID is required for settings operation.',
        'សូមផ្តល់អត្តសញ្ញាណអាជីវកម្ម'
      );
    }
    return id;
  },

  validateBusinessId(businessId: string): boolean {
    return Boolean(businessId && typeof businessId === 'string' && businessId.trim().length > 0);
  },
};
