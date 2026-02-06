
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";

export default [
  {files: ["**/*.{js,mjs,cjs,ts,vue}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {files: ["**/*.vue"], languageOptions: { parserOptions: { parser: tseslint.parser } }},
  {
      ignores: ["dist/**", ".astro/**", "node_modules/**", "android/**", ".wrangler/**", "coverage/**", ".gemini/**"]
  },
  {
      rules: {
          "@typescript-eslint/no-explicit-any": "off",
          "@typescript-eslint/ban-ts-comment": "off",
          "vue/multi-word-component-names": "off"
      }
  }
];
