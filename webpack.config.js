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

module.exports = [
  {
    entry: "./ts/widget.ts",
    mode: "development",
    devtool: "inline-source-map",
    experiments:{
      outputModule: true,
    },
    output: {
      filename: "widget.js",
      path: path.resolve(__dirname, "demo_jupyter_wasm_widget", "static"),
      library: {
        type: "module",
      },
      publicPath: "",
    },
    module: {
      rules,
    },
    resolve,
  },
];
