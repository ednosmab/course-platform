import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import governance from "../../eslint-rules/index.js";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Governance rules — start as warn, escalate to error over time
  {
    plugins: { governance },
    rules: {
      "governance/no-lucide-react": "warn",
      "governance/no-html-elements": "warn",
      "governance/no-hardcoded-colors": "warn",
    },
  },

  // Relax strict TypeScript rules for existing codebase
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": "off",
      "prefer-const": "warn",
    },
  },
]);

export default eslintConfig;
