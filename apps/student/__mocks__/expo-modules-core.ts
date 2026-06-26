// Mock for expo-modules-core — provides web-safe stubs for native-only APIs.
// Used via resolve.alias in vitest.config.ts to prevent native module imports in jsdom.

class EventEmitter<TEventsMap = Record<string, unknown>> {
  addListener(_eventName: keyof TEventsMap, _listener: (...args: any[]) => void) {
    return { remove() {} };
  }
  removeListener(_eventName: keyof TEventsMap, _listener: (...args: any[]) => void) {}
  removeAllListeners(_eventName?: keyof TEventsMap) {}
  emit(_eventName: keyof TEventsMap, ..._args: any[]) {}
}

 
class NativeModule {
  /** Stub for native module base class */
  __stub = true;
}

 
class SharedObject {
  /** Stub for shared object base class */
  __stub = true;
}

 
class SharedRef {
  /** Stub for shared ref base class */
  __stub = true;
}

export function requireNativeModule<T = any>(_moduleName: string): T {
  return {} as T;
}

export function requireOptionalNativeModule<T = any>(_moduleName: string): T | null {
  return null;
}

export function requireNativeViewManager(_viewManagerName: string) {
  return {};
}

export const Platform = {
  OS: 'web' as const,
  select: (obj: Record<string, any>) => obj.web ?? obj.default,
};

export const uuid = {
  v4: () => crypto.randomUUID?.() ?? '00000000-0000-0000-0000-000000000000',
  v5: (_name: string, _ns: string) => '00000000-0000-0000-0000-000000000000',
};

export { EventEmitter, NativeModule, SharedObject, SharedRef };

export default {
  requireNativeModule,
  requireOptionalNativeModule,
  requireNativeViewManager,
  EventEmitter,
  NativeModule,
  SharedObject,
  SharedRef,
  Platform,
  uuid,
};
