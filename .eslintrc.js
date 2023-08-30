const glob = require("fast-glob");
const fs = require("fs");
const path = require("path");

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf-8")
);
const workspaceGlobs = pkg.workspaces;
const workspaceDirs = glob.sync(workspaceGlobs, {
  onlyFiles: false,
  onlyDirectories: true,
  cwd: __dirname,
});

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
    ...workspaceDirs.map((workspaceDir) => ({
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
