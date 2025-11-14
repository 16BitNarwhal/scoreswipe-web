module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["next", "next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "react/jsx-props-no-spreading": "off",
    "react/function-component-definition": "off"
  }
};
