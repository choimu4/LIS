const { override, addBabelPreset, addBabelPlugin } = require('customize-cra');

module.exports = override(
  addBabelPreset('@babel/preset-env'),
  addBabelPlugin('@babel/plugin-proposal-class-properties'),
  addBabelPlugin('@babel/plugin-proposal-private-methods'),
  addBabelPlugin('@babel/plugin-proposal-private-property-in-object'),
  (config) => {
    // Ensure that mjs files are processed with babel-loader
    const oneOfRule = config.module.rules.find(rule => rule.oneOf);
    if (oneOfRule) {
      oneOfRule.oneOf.unshift({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-private-methods',
              '@babel/plugin-proposal-private-property-in-object'
            ]
          }
        }
      });
    }
    return config;
  }
);
