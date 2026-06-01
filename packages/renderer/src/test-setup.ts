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
}
