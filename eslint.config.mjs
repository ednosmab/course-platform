import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import governance from "./eslint-rules/index.js";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/.expo/**",
      "**/expo-router/**",
      "next-env.d.ts",
      "apps/admin/**",
      "design/**",
      "desing_old/**",
    ],
  },

  // Base recommended rules
  js.configs.recommended,

  // TypeScript strict rules for all TS/TSX files
  ...tseslint.configs.strict,

  // React rules for all TSX files
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/jsx-key": "error",
      "react/no-direct-mutation-state": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Governance rules — start as warn, escalate to error over time
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      governance,
    },
    rules: {
      "governance/no-lucide-react": "warn",
      "governance/no-html-elements": "warn",
      "governance/no-hardcoded-colors": "warn",
    },
  },

  // TypeScript and general rules — relaxed for existing codebase
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/unified-signatures": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-dynamic-delete": "warn",
      "no-undef": "off",
      "no-useless-escape": "warn",
      "no-empty": "warn",
      "no-console": "off",
      "prefer-const": "warn",
      "@next/next/no-img-element": "off",
    },
  },

  // CommonJS files — allow module/require globals
  {
    files: ["**/*.cjs", "**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "writable",
        process: "readonly",
      },
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
