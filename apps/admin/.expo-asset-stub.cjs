// Web stub for `expo-asset`. Used by `packages/ui` BrandMark which
// imports `Asset.fromModule()` to resolve a static image URI on
// React Native. On web, the `require('*.png')` from Next.js returns
// a `{ src, width, height, blurDataURL }` object, so we synthesize
// a fake "module" that exposes the public path under `.uri`.

module.exports = {
  Asset: {
    fromModule: (mod) => {
      if (typeof mod === 'string') return { uri: mod, width: 0, height: 0 };
      if (mod && typeof mod === 'object' && 'src' in mod) {
        return { uri: mod.src, width: mod.width || 0, height: mod.height || 0 };
      }
      return { uri: String(mod || ''), width: 0, height: 0 };
    },
    fromURI: (uri) => ({ uri, width: 0, height: 0 }),
    loadAsync: () => Promise.resolve({ width: 0, height: 0 }),
  },
};
