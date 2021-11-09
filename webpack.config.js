const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

var paths = {
  sassFiles: [
    "./styles/rebrand-nav-footer.scss",
    "./styles/main.scss",
    "./styles/prettify.scss",
  ],
  dist: "./docs/chunks",
  styleFiles: "./styles/**/*.scss",
};

module.exports = {
  entry: {
    blah: [
      "./js/main.js",
      paths.sassFiles[0],
      paths.sassFiles[1],
      paths.sassFiles[2],
    ],
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },
  output: {
    path: path.resolve(__dirname, paths.dist),
    filename: "bundle.js",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles.min.css",
    }),
  ],
  devServer: {
    static: "./docs",
  },
};
