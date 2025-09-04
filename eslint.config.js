// eslint.config.js
// @ts-check
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import a11y from "eslint-plugin-jsx-a11y";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";

export default defineConfig([
  // Ignor
  { ignores: ["dist", "coverage", "node_modules"] },

  // JS Base
  js.configs.recommended,

  // Recommendations from typescript-eslint (includes parser and basic rules)
  ...tseslint.configs.recommended,

  // Project rules (IMPORTANT: plugins are declared here and here are the rules, so
  // that there is no error about the plugin)
  {
    files: ["**/*.{ts,tsx,js,jsx,cjs}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      // If you want type-aware rules, uncomment:
      // parser: tseslint.parser,
      // parserOptions: {
      //   projectService: true,                 // without specifying paths to tsconfig
      //   tsconfigRootDir: import.meta.dirname, // tsconfig search base
      // },
    },

    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": a11y,
      unicorn,
    },

    settings: {
      react: { version: "detect" },
    },

    rules: {
      // TS: Ignore unused if name starts with "_"
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      }],

      // React / Hooks
      "react/react-in-jsx-scope": "off", // Vite/React 17+
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // A11y
      // (set the default from the plugin, you can add it pointwise)

      // Unicorn — softer for familiar contractions
      "unicorn/prevent-abbreviations": ["warn", {
        checkFilenames: false,
        checkProperties: false,
        replacements: { props: false, ref: false },
        ignore: ["e", "err", "ctx", "env", "db", "i18n", "params"],
      }],
    },
  },
]);
