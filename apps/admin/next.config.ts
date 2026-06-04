import type { NextConfig } from "next";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const rnWebStubAbs = require.resolve("./.rn-web-stub.cjs");
const expoAssetStubAbs = require.resolve("./.expo-asset-stub.cjs");

const nextConfig: NextConfig = {
  serverExternalPackages: ["@projeto/core"],
  async redirects() {
    return [
      {
        source: "/studio/:courseId",
        has: [{ type: "query", key: "mode", value: "certificate" }],
        destination: "/studio/:courseId/certificate",
        permanent: true,
      },
    ];
  },
  /**
   * Alias `react-native` → stub web e `expo-asset` → stub web.
   *
   * Necessário porque `packages/ui` (BrandMark, etc.) é partilhado entre
   * web (Next.js) e native (Expo). O Turbopack do Next.js 16 não
   * consegue parsear `react-native/index.js` (Flow syntax) nem
   * `expo-modules-core/src/index.ts` (TypeScript sem loader), portanto
   * aliasamos para stubs CommonJS puros.
   */
  turbopack: {
    resolveAlias: {
      "react-native": "./.rn-web-stub.cjs",
      "expo-asset": "./.expo-asset-stub.cjs",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> | undefined),
      "react-native$": rnWebStubAbs,
      "expo-asset$": expoAssetStubAbs,
    };
    return config;
  },
};

export default nextConfig;
