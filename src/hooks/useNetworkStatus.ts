import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  checkConnection: () => Promise<boolean>;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    // If navigator says offline, return false directly
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      return false;
    }

    try {
      // Ping a lightweight fetch endpoint with cache busting
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store',
      }).catch(() => null);

      const status = response ? response.ok : navigator.onLine;
      setIsOnline(status);
      return status;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, []);

  return { isOnline, wasOffline, checkConnection };
};
