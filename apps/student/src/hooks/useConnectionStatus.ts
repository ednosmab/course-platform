import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface ConnectionState {
  isOnline: boolean;
  isWifi: boolean;
  isCellular: boolean;
  type: string;
}

const initialState: ConnectionState = {
  isOnline: true,
  isWifi: false,
  isCellular: false,
  type: 'unknown',
};

/**
 * Hook que monitora o estado de conectividade da rede.
 * No web, assume sempre online (navigator.onLine).
 * Em native, usa NetInfo para detectar mudanças.
 */
export function useConnectionStatus(): ConnectionState {
  const [state, setState] = useState<ConnectionState>(initialState);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleOnline = () => setState({ ...initialState, isOnline: true });
      const handleOffline = () => setState({ ...initialState, isOnline: false });

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      setState({
        ...initialState,
        isOnline: navigator.onLine,
      });

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // Native: use NetInfo
    let subscription: { remove: () => void } | null = null;

    import('@react-native-community/netinfo').then((NetInfo) => {
      NetInfo.default.getStateAsync().then((info) => {
        setState({
          isOnline: info.isConnected ?? false,
          isWifi: info.type === 'wifi',
          isCellular: info.type === 'cellular',
          type: info.type,
        });
      });

      subscription = NetInfo.default.addEventListener((info) => {
        setState({
          isOnline: info.isConnected ?? false,
          isWifi: info.type === 'wifi',
          isCellular: info.type === 'cellular',
          type: info.type,
        });
      });
    }).catch(() => {
      // NetInfo not available, assume online
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return state;
}
