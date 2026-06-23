import type { NextConfig } from "next";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const require = createRequire(import.meta.url);
const rnWebStubAbs = require.resolve("./.rn-web-stub.cjs");
const expoAssetStubAbs = require.resolve("./.expo-asset-stub.cjs");
const expoAvStubAbs = require.resolve("./.expo-av-stub.cjs");

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
   * Alias `react-native` → stub web, `expo-asset` → stub web
   * e `expo-av` → stub web.
   *
   * Necessário porque `packages/ui` (BrandMark, VideoBlock, etc.) é
   * partilhado entre web (Next.js) e native (Expo). O Turbopack do
   * Next.js 16 não consegue parsear `react-native/index.js`
   * (Flow syntax) nem `expo-modules-core/src/index.ts` (TypeScript
   * sem loader). Aliasamos para stubs CommonJS puros.
   *
   * `expo-av` é aliasado para impedir que a cadeia
   * expo-av → expo-modules-core seja resolvida pelo bundler.
   */
  turbopack: {
    root: path.resolve(rootDir, "../.."),
    resolveAlias: {
      "react-native": "./.rn-web-stub.cjs",
      "expo-asset": "./.expo-asset-stub.cjs",
      "expo-av": "./.expo-av-stub.cjs",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> | undefined),
      "react-native$": rnWebStubAbs,
      "expo-asset$": expoAssetStubAbs,
      "expo-av$": expoAvStubAbs,
    };
    return config;
  },
};

export default nextConfig;
