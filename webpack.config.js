const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/mysql2'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-private-methods'
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "fs": false,
      "net": false,
      "tls": false,
      "zlib": require.resolve("browserify-zlib"),
      "timers": require.resolve("timers-browserify"),
      "http": require.resolve("stream-http"),
      "querystring": require.resolve("querystring-es3"),
      "async_hooks": false,
      "vm": require.resolve("vm-browserify")
    }
  },
  performance: {
    hints: false
  }
};
