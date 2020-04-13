const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  entry: "./src/index.jsx",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /.(gif|svg)$/,
        loader: "file-loader",
        options: { publicPath: "/" },
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({ template: "./src/index.html", inject: false }),
  ],
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devServer: {
    host: "0.0.0.0",
    proxy: {
      "/api": "http://localhost:3000",
      "/socket.io": "http://localhost:3000",
    },
    historyApiFallback: true,
  },
};
