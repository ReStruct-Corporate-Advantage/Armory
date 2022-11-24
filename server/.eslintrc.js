module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "require-jsdoc": "off",
    "camelcase": "off",
    "max-len": "off",
    "valid-jsdoc": "off",
    "new-cap": "off",
    "no-unused-vars": "off",
    "no-var": "off",
    "no-invalid-this": "off",
    "space-before-function-paren": "off",
    "indent": "off",
    "object-curly-spacing": "off",
    "spaced-comment": "off",
    "eol-last": "off",
    "quotes": ["error", "double"],
  },
  parserOptions: {
    ecmaVersion: 11,
    // sourceType: "module",
  },
};
