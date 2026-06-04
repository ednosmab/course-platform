// Polyfill browser APIs that Tamagui touches at module load.
// Without these, importing @projeto/ui in a jsdom test environment throws
// because some Tamagui primitives call `window.matchMedia` eagerly.
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

  // Polyfill requestAnimationFrame for jsdom so hooks like useA4Scale
  // can synchronously wire up their ResizeObserver observers and flip
  // `ready` to true. Without this, components stay in their loading state.
  // Always overwrite — jsdom's built-in rAF does not fire synchronously.
  window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
    cb(0);
    return 0;
  };
  window.cancelAnimationFrame = (): void => {};
}
