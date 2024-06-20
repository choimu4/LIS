const { override, addBabelPlugins, addWebpackModuleRule } = require('customize-cra');
const path = require('path');

module.exports = override(
  ...addBabelPlugins(
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-private-methods"
  ),
  addWebpackModuleRule({
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
  }),
  (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'crypto': require.resolve('crypto-browserify'),
      'stream': require.resolve('stream-browserify'),
      'path': require.resolve('path-browserify'),
      'zlib': require.resolve('browserify-zlib'),
      'timers': require.resolve('timers-browserify'),
      'http': require.resolve('stream-http'),
      'querystring': require.resolve('querystring-es3'),
      'vm': require.resolve('vm-browserify'),
    };
    return config;
  }
);
