import type { NextConfig } from "next";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const rnWebStubAbs = require.resolve("./.rn-web-stub.cjs");

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
  turbopack: {
    resolveAlias: {
      "react-native": "./.rn-web-stub.cjs",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> | undefined),
      "react-native$": rnWebStubAbs,
    };
    return config;
  },
};

export default nextConfig;
