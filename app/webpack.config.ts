import path from 'path';
import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const config: webpack.Configuration = {
  entry: "./index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  experiments: {
    asyncWebAssembly: true
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "index.html", to: "index.html" },
        { from: "public", to: "public"}
      ],
    })
  ],
};

export default config;
