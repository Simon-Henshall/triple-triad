import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import jsdoc from "eslint-plugin-jsdoc";
import eslintPluginNoCommentedCode from "eslint-plugin-no-commented-code";

export default [
  {
    ignores: ["coverage/"],
  },
  //pluginJs.configs.recommended,
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
      jsdoc: jsdoc,
      "no-commented-code": eslintPluginNoCommentedCode,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      ...eslintPluginUnicorn.configs.all.rules,
      "@typescript-eslint/no-unused-vars": "warn",
      //"no-console": "warn",
      //"no-commented-code/no-commented-code": "error",
      "no-warning-comments": [
        "warn",
        {
          terms: ["TODO", "FIXME"], // Disallow comments with these terms
          location: "anywhere", // Check for terms anywhere in the comment
        },
      ],
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
      curly: ["error", "all"],
      "unicorn/prefer-dom-node-remove": "off",
      "jsdoc/require-description": "warn",
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
          },
        },
      ],
    },
  },
];
