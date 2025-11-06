import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      parser: tsparser,
      sourceType: "module",
    },

    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
      unicorn: eslintPluginUnicorn,
    },

    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      ...eslintPluginUnicorn.configs.all.rules,
      "@typescript-eslint/no-unused-vars": "warn",
      //"no-console": "warn",
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
      curly: ["error", "all"],
      "unicorn/prefer-dom-node-remove": "off", // This is a CreateJS project
    },
  },
];
