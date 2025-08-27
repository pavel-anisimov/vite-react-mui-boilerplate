// eslint.config.mjs
import { fileURLToPath } from "node:url";
import path from "node:path";
import globals from "globals";

import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import a11y from "eslint-plugin-jsx-a11y";
import unicorn from "eslint-plugin-unicorn";
import importX from "eslint-plugin-import-x";
import promise from "eslint-plugin-promise";
import regexp from "eslint-plugin-regexp";
import n from "eslint-plugin-n";
import security from "eslint-plugin-security";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  // Ignored files/folders
  { ignores: ["dist", "coverage", "node_modules", ".husky"] },

  // Main block for app code: src only, with types and browser globals
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
      globals: { ...globals.browser },                 // дает document, localStorage, setTimeout и т.д.
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": a11y,
      unicorn,
      "import-x": importX,
      promise,
      regexp,
      n,
      security,
    },
    rules: {
      // Base Rules
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...a11y.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Modern JSX-transform
      "react/react-in-jsx-scope": "off",

      // Imports
      "import-x/no-duplicates": "error",
      "import-x/first": "error",
      "import-x/newline-after-import": "error",
      "import-x/order": ["warn", {
        alphabetize: { order: "asc", caseInsensitive: true },
        "newlines-between": "always",
        groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
      }],

      // TS typed-rules
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": ["warn", { checksVoidReturn: false }],
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],

      // Restrictions
      "unicorn/prefer-node-protocol": "error",
      "unicorn/no-useless-undefined": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/no-useless-switch-case": "error",
      "unicorn/explicit-length-check": "warn",
      "unicorn/consistent-function-scoping": "warn",
      "unicorn/prevent-abbreviations": ["warn", {
        allowList: { props: true, ref: true, args: true, params: true, env: true, i18n: true, dev: true, prod: true, dir: true, prop: true },
      }],
      "unicorn/filename-case": ["warn", { cases: { pascalCase: true, kebabCase: true } }],

      // Promise/regexp/security
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/no-multiple-resolved": "error",

      "regexp/no-dupe-characters-character-class": "error",
      "regexp/no-empty-alternative": "warn",
      "regexp/no-empty-capturing-group": "warn",
      "regexp/no-unused-capturing-group": "warn",
      "regexp/optimal-quantifier-concatenation": "warn",
      "regexp/no-super-linear-backtracking": "warn",

      "n/no-missing-import": "off",
      "n/no-process-env": "warn",
      "n/no-deprecated-api": "warn",

      "security/detect-eval-with-expression": "error",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-require": "warn",
      "security/detect-object-injection": "warn",
    },
    settings: { react: { version: "detect" } },
  },

  // 🔹 Tests: jsdom/vitest globals + relaxations for the setupTests.ts file name
  {
    files: ["src/**/*.{test,spec}.ts?(x)", "src/setupTests.ts"],
      languageOptions: {
      globals: { ...globals.browser, ...globals.vitest },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
        "unicorn/filename-case": "off",
    },
  },

  // 🔹 Configs/scripts: without typed-linting, node globals
  {
    files: ["**/*.{config,config.*}.{js,cjs,mjs,ts}", "vite.config.ts", "commitlint.config.cjs"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { projectService: false },
      globals: { ...globals.node },
    },
    rules: {
      "n/no-process-env": "off",
    },
  },
];
