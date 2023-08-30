import HtmlWebpackPlugin from "html-webpack-plugin";

/** @type {import('webpack').Configuration} */
export default {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.jsx?/,
        use: {
          loader: "babel-loader",
          options: {
            rootMode: "upward",
          },
        },
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin()],
};
