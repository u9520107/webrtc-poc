const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const execa = require('execa');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const pages = ["server", "client", "index"];

class CommandPlugin {
  constructor({ command }) {
    this._command = command;
  }
  _isRunning = false;
  apply(compiler) {
    compiler.hooks.afterEmit.tap("AfterEmitPlugin", async () => {
      if (!this._isRunning) {
        execa.command(this._command, {
          stdio: "inherit",
        });
        this._isRunning = true;
      }
    });
  }
}

module.exports = {
  entry: pages.reduce((entry, page) => {
    entry[page] = `./src/pages/${page}.ts`;
    return entry;
  }, {}),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new NodePolyfillPlugin(),
    ...pages.map(
      (page) =>
        new HtmlWebpackPlugin({
          filename: `${page}.html`,
          chunks: [page],
        })
    ),
    new CommandPlugin({
      command: "yarn ts-node ./src/signal-server/signal-server.ts",
    }),
  ],
  mode: "development",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    hot: true,
    port: 8080,
  },
};
