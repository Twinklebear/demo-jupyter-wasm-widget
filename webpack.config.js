const path = require("path");

const rules = [
  {
    test: /\.(png|jpg|jpeg|glb)$/i,
    type: "asset/resource",
  },
  {
    test: /\.wasm$/i,
    type: "asset/resource",
  },
  {
    test: /\.tsx?$/,
    use: "ts-loader",
    exclude: /node_modules/,
  },
];

const resolve = {
  extensions: [".tsx", ".ts", ".js"],
};

const externals = ["@jupyter-widgets/base"];

module.exports = [
  /* Notebook extension.
   *
   * This contains the JS that's run on load of the notebook
   */
  {
    entry: "./ts/extension.ts",
    mode: "development",
    devtool: "inline-source-map",
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "demo_jupyter_wasm_widget", "nbextension"),
      libraryTarget: "amd",
      publicPath: "",
    },
    module: {
      rules,
    },
    resolve,
    externals,
  },

  /* Embeddable widget bundle
   *
   * This contains the static assets and other frontend only widget code
   * We need to publish the package to NPM for notebook extensions to work
   * since they grab this JS code at rutime. E.g., for vscode embeds
   */
  {
    entry: "./ts/index.ts",
    mode: "development",
    devtool: "inline-source-map",
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "dist"),
      libraryTarget: "amd",
      library: "demo_jupyter_wasm_widget",
      publicPath:
        "https://unpkg.com/demo_jupyter_wasm_widget@" + "0.1.0" + "/dist/",
    },
    module: {
      rules,
    },
    resolve,
    externals,
  },
];
