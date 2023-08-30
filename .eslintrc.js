/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
  },
  extends: ["airbnb", "prettier"],
  rules: {
    "max-classes-per-file": "off",
    "no-restricted-syntax": "off",
    "react/react-in-jsx-scope": "off",
    "import/extensions": ["error", "ignorePackages"],
    "react/jsx-filename-extension": "off",
  },
  overrides: [
    ...["examples/todoapp", "redux-entity-query"].map((workspaceDir) => ({
      files: [`${workspaceDir}/webpack.config.mjs`],
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          { devDependencies: true, packageDir: [".", workspaceDir] },
        ],
      },
    })),
  ],
};
