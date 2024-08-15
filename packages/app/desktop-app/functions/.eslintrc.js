module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: ["eslint:recommended", "google"],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "object-curly-spacing": "off", // オブジェクトの中括弧内のスペースチェックを無効にする
    "quotes": ["error", "double", { allowTemplateLiterals: true }],
    "indent": "off", // インデントに関するチェックを無効にする
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
