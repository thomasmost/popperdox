import path from 'path';
import webpack from 'webpack';

const config: webpack.Configuration = {
  entry: "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'webassembly/sync',
      }
    ]
  },
  experiments: {
    syncWebAssembly: true
  },
  mode: "development",
  // plugins: [
  //   new CopyWebpackPlugin(['index.html'])
  // ],
};

export default config;
