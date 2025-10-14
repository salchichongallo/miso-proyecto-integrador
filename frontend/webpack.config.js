const Dotenv = require('dotenv-webpack');

module.exports = (config) => {
  config.plugins.push(
    new Dotenv({
      safe: !process.env['CI'],
      silent: false,
      systemvars: true,
    }),
  );
  return config;
};
