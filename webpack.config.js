const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader', 'postcss-loader' ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    library: {
      name: 'DiAnalytics',
      type: 'umd',
      export: 'default'
    },
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  }
};
