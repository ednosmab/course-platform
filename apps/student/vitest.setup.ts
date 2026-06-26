// Expo/React Native globals required for jsdom environment
// __DEV__ is injected by Metro bundler at build time
globalThis.__DEV__ = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

// EXPO_OS is injected by babel-preset-expo during transformation
if (!process.env.EXPO_OS) {
  process.env.EXPO_OS = 'web';
}

// Provide the globalThis.expo object as a safety net for expo-modules-core internals.
// The primary fix is the resolve.alias in vitest.config.ts, but this prevents crashes
// if the alias is ever removed or if code accesses globalThis.expo directly.
if (!(globalThis as any).expo) {
  (globalThis as any).expo = {
    modules: {},
    EventEmitter: class EventEmitter<TEventsMap = Record<string, unknown>> {
      addListener(_eventName: keyof TEventsMap, _listener: (...args: any[]) => void) {
        return { remove() {} };
      }
      removeListener(_eventName: keyof TEventsMap, _listener: (...args: any[]) => void) {}
      removeAllListeners(_eventName?: keyof TEventsMap) {}
      emit(_eventName: keyof TEventsMap, ..._args: any[]) {}
    },
    SharedObject: class SharedObject {
      __stub = true;
    },
    SharedRef: class SharedRef {
      __stub = true;
    },
    NativeModule: class NativeModule {
      __stub = true;
    },
    uuidv4: () => crypto.randomUUID?.() ?? '00000000-0000-0000-0000-000000000000',
    uuidv5: (_name: string, _ns: string) => '00000000-0000-0000-0000-000000000000',
    getViewConfig: () => null,
    reloadAppAsync: async () => {},
    expoModulesCoreVersion: undefined,
    cacheDir: undefined,
    documentsDir: undefined,
  };
}

if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }

  window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
    cb(0);
    return 0;
  };
  window.cancelAnimationFrame = (): void => {};
}
